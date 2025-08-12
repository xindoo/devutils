document.addEventListener('DOMContentLoaded', () => {
 const urlInput = document.getElementById('sioUrl');
 const pathInput = document.getElementById('sioPath');
 const nsInput = document.getElementById('sioNamespace');
 const websocketChk = document.getElementById('transportWebsocket');
 const pollingChk = document.getElementById('transportPolling');
 const queryInput = document.getElementById('sioQuery');
 const authInput = document.getElementById('sioAuth');

 const connectBtn = document.getElementById('connectBtn');
 const disconnectBtn = document.getElementById('disconnectBtn');

 const subEventInput = document.getElementById('subscribeEvent');
 const addSubscriptionBtn = document.getElementById('addSubscriptionBtn');
 const subscriptionsList = document.getElementById('subscriptionsList');

 const emitEventInput = document.getElementById('emitEvent');
 const payloadIsJSONChk = document.getElementById('payloadIsJSON');
 const emitPayloadInput = document.getElementById('emitPayload');
 const emitBtn = document.getElementById('emitBtn');

 const logDiv = document.getElementById('log');
 const errorDisplay = document.getElementById('errorDisplay');
 const clearLogBtn = document.getElementById('clearLogBtn');
 
 let socket = null;

 // Map of eventName -> listener function (to allow detach/removal)
 const subscriptions = new Map();
 const STORAGE_KEY = 'socketio-tester-settings';

 function log(message, type) {
 const p = document.createElement('p');
 p.className = `log-message ${type || ''}`;
 p.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
 logDiv.appendChild(p);
 logDiv.scrollTop = logDiv.scrollHeight;
 }

 function safeStringify(value) {
   try {
       if (typeof value === 'string') {
           return value;
       }
       const result = JSON.stringify(value, null, 2);
       return result === undefined ? 'null' : result;
   } catch (e) {
       try {
           return String(value);
       } catch {
           return '[Unserializable]';
       }
   }
 }

 function showError(message) {
 errorDisplay.textContent = message;
 errorDisplay.style.display = 'block';
 }

 function clearError() {
 errorDisplay.textContent = '';
 errorDisplay.style.display = 'none';
 }

 function parseOptionalJSON(text, label) {
 const trimmed = (text || '').trim();
 if (!trimmed) return undefined;
 try {
 return JSON.parse(trimmed);
 } catch (e) {
 throw new Error(`${label} must be valid JSON. ${e.message}`);
 }
 }

 function buildTransports() {
 const transports = [];
 if (websocketChk.checked) transports.push('websocket');
 if (pollingChk.checked) transports.push('polling');
 return transports.length ? transports : undefined;
 }

 function normalizedNamespace(ns) {
 let v = (ns || '').trim();
 if (!v) return '/';
 if (!v.startsWith('/')) v = '/' + v;
 return v;
 }

 function setConnectedUI() {
 connectBtn.disabled = true;
 connectBtn.textContent = 'Connect';
 disconnectBtn.disabled = false;
 emitBtn.disabled = false;

 urlInput.disabled = true;
 pathInput.disabled = true;
 nsInput.disabled = true;
 websocketChk.disabled = true;
 pollingChk.disabled = true;
 queryInput.disabled = true;
 authInput.disabled = true;
 }

 function setDisconnectedUI() {
 connectBtn.disabled = false;
 connectBtn.textContent = 'Connect';
 disconnectBtn.disabled = true;
 emitBtn.disabled = true;

 urlInput.disabled = false;
 pathInput.disabled = false;
 nsInput.disabled = false;
 websocketChk.disabled = false;
 pollingChk.disabled = false;
 queryInput.disabled = false;
 authInput.disabled = false;
 }

 function attachAllSubscriptions() {
 if (!socket) return;
 for (const [event, listener] of subscriptions.entries()) {
 socket.on(event, listener);
 }
 }

 function removeSubscriptionUIItem(itemEl) {
    if (itemEl) {
        itemEl.remove();
    }
 }

 function addSubscription(eventName) {
 const name = (eventName || '').trim();
 if (!name) {
 showError('Subscribe event name cannot be empty.');
 return;
 }
 clearError();

 if (subscriptions.has(name)) {
 log(`Already subscribed to "${name}"`, 'status');
 return;
 }

 const listener = (...args) => {
 const data = args.length > 1 ? args : args[0];
 log(`Received [${name}]: ${safeStringify(data)}`, 'received');
 };
 subscriptions.set(name, listener);

 if (socket) {
 socket.on(name, listener);
 log(`Subscribed to "${name}"`, 'status');
 } else {
 log(`Queued subscription for "${name}" (will attach on connect)`, 'status');
 }

   const item = document.createElement('div');
   item.className = 'sio-subscription-tag';
   item.dataset.eventName = name;
   
   const label = document.createElement('span');
   label.textContent = name;
   item.appendChild(label);
   
   const removeBtn = document.createElement('button');
   removeBtn.innerHTML = '&times;';
   removeBtn.title = `Remove subscription to "${name}"`;
   removeBtn.addEventListener('click', () => {
       const fn = subscriptions.get(name);
       if (fn && socket) {
           socket.off(name, fn);
       }
       subscriptions.delete(name);
       removeSubscriptionUIItem(item);
       log(`Removed subscription "${name}"`, 'status');
   });
   item.appendChild(removeBtn);

 subscriptionsList.appendChild(item);
 }

 function saveSettings() {
   const settings = {
       url: urlInput.value,
       path: pathInput.value,
       ns: nsInput.value,
       transportWebsocket: websocketChk.checked,
       transportPolling: pollingChk.checked,
       query: queryInput.value,
       auth: authInput.value,
   };
   localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
 }

 function loadSettings() {
     const saved = localStorage.getItem(STORAGE_KEY);
     if (saved) {
         try {
           const settings = JSON.parse(saved);
           if(settings.url !== undefined) urlInput.value = settings.url;
           if(settings.path !== undefined) pathInput.value = settings.path;
           if(settings.ns !== undefined) nsInput.value = settings.ns;
           if(settings.transportWebsocket !== undefined) websocketChk.checked = settings.transportWebsocket;
           if(settings.transportPolling !== undefined) pollingChk.checked = settings.transportPolling;
           if(settings.query !== undefined) queryInput.value = settings.query;
           if(settings.auth !== undefined) authInput.value = settings.auth;
         } catch (e) {
             console.error("Failed to load settings from localStorage", e);
             localStorage.removeItem(STORAGE_KEY); // Clear corrupted settings
         }
     }
 }

 connectBtn.addEventListener('click', () => {
 if (typeof io === 'undefined') {
 showError('Socket.IO client library failed to load.');
 return;
 }

 const baseUrl = (urlInput.value || '').trim();
 if (!baseUrl) {
 showError('Server URL cannot be empty.');
 return;
 }

 const path = (pathInput.value || '').trim() || '/socket.io';
 const ns = normalizedNamespace(nsInput.value);
 let query, auth;

 try {
 query = parseOptionalJSON(queryInput.value, 'Query');
 auth = parseOptionalJSON(authInput.value, 'Auth');
 } catch (e) {
 showError(e.message);
 return;
 }

 const transports = buildTransports();

 clearError();
 try {
 log(`Connecting to ${baseUrl}${ns} (path=${path}, transports=${transports ? transports.join(',') : 'default'})...`, 'status');
 socket = io(`${baseUrl}${ns}`, {
 path,
 transports,
 query,
 auth,
 autoConnect: false,
 forceNew: true,
 reconnection: false,
 });
 } catch (e) {
 showError(`Failed to initialize Socket.IO client: ${e.message}`);
 return;
 }

 // Core lifecycle events
 socket.on('connect', () => {
 log(`Connected. id=${socket.id}`, 'status');
 setConnectedUI();
 attachAllSubscriptions();
 });

 socket.on('disconnect', (reason) => {
 log(`Disconnected. reason=${reason}`, 'status');
 setDisconnectedUI();
 socket = null;
 });

 socket.on('connect_error', (err) => {
 log(`Connect error: ${err && err.message ? err.message : safeStringify(err)}`, 'error');
 showError(`Connect error: ${err && err.message ? err.message : safeStringify(err)}`);
 setDisconnectedUI();
 });

 socket.on('error', (err) => {
 log(`Socket error: ${err && err.message ? err.message : safeStringify(err)}`, 'error');
 });
 connectBtn.disabled = true;
 connectBtn.textContent = 'Connecting...';
 socket.connect();
 });

 disconnectBtn.addEventListener('click', () => {
 if (socket) {
 log('Disconnecting...', 'status');
 socket.disconnect();
 // The 'disconnect' event will now handle cleanup correctly
 }
 });

 addSubscriptionBtn.addEventListener('click', () => {
 addSubscription(subEventInput.value);
 subEventInput.value = '';
 subEventInput.focus();
 });

 subEventInput.addEventListener('keydown', (e) => {
 if (e.key === 'Enter') {
 e.preventDefault();
 addSubscriptionBtn.click();
 }
 });

 function emitInternal() {
 if (!socket) {
 showError('Not connected.');
 return;
 }
 const eventName = (emitEventInput.value || '').trim();
 if (!eventName) {
 showError('Emit event name cannot be empty.');
 return;
 }
 clearError();

 const raw = emitPayloadInput.value;
 let args = [];

 if (payloadIsJSONChk.checked) {
 const trimmed = raw.trim();
 if (trimmed.length) {
 try {
 const parsed = JSON.parse(trimmed);
 if (Array.isArray(parsed)) {
 args = parsed;
 } else {
 args = [parsed];
 }
 } catch (e) {
 showError(`Payload JSON parse error: ${e.message}`);
 return;
 }
 } else {
 args = [];
 }
 } else {
 if (raw.length) {
 args = [raw];
 } else {
 args = [];
 }
 }

 try {
   log(`Emit [${eventName}]: ${safeStringify(args.length === 1 ? args[0] : args)}`, 'sent');
   
   const ack = (...ackArgs) => {
       const data = ackArgs.length > 1 ? ackArgs : ackArgs[0];
       try {
           log(`Received ack for [${eventName}]: ${JSON.stringify(data)}`, 'received');
       } catch (e) {
           log(`Received ack for [${eventName}]: ${String(data)}`, 'received');
       }
   };

   if (args.length) {
       socket.emit(eventName, ...args, ack);
   } else {
       socket.emit(eventName, ack);
   }
 } catch (e) {
   showError(`Emit failed: ${e.message}`);
   log(`Emit failed: ${e.message}`, 'error');
   return;
 }
 }

 emitBtn.addEventListener('click', emitInternal);

 emitPayloadInput.addEventListener('keydown', (e) => {
 if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
 e.preventDefault();
 emitInternal();
 }
 });

    clearLogBtn.addEventListener('click', () => {
        logDiv.innerHTML = '';
        log('Log cleared', 'status');
    });
 
  // Small convenience defaults:
  // addSubscription('message'); // uncomment if desired

 // --- Settings Persistence ---
 [
     urlInput, pathInput, nsInput,
     queryInput, authInput
 ].forEach(input => {
     input.addEventListener('input', saveSettings);
 });
 [websocketChk, pollingChk].forEach(chk => {
     chk.addEventListener('change', saveSettings);
 });

 loadSettings(); // Load settings on page load
 });