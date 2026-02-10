document.addEventListener('DOMContentLoaded', () => {
    const wsUrlInput = document.getElementById('wsUrl');
    const connectBtn = document.getElementById('connectBtn');
    const disconnectBtn = document.getElementById('disconnectBtn');
    const sendBtn = document.getElementById('sendBtn');
    const messageInput = document.getElementById('message');
    const logDiv = document.getElementById('log');
    const errorDisplay = document.getElementById('errorDisplay');

    let websocket = null;

    function log(message, type) {
        const p = document.createElement('p');
        p.className = `log-message ${type}`;
        p.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        logDiv.appendChild(p);
        logDiv.scrollTop = logDiv.scrollHeight;
    }

    function showError(message) {
        errorDisplay.textContent = message;
        errorDisplay.style.display = 'block';
    }

    function clearError() {
        errorDisplay.textContent = '';
        errorDisplay.style.display = 'none';
    }

    connectBtn.addEventListener('click', () => {
        const url = wsUrlInput.value.trim();
        if (!url) {
            showError('WebSocket URL cannot be empty.');
            return;
        }
        clearError();

        try {
            websocket = new WebSocket(url);
        } catch (e) {
            showError(`Invalid WebSocket URL: ${e.message}`);
            return;
        }


        log(`Connecting to ${url}...`, 'status');

        websocket.onopen = () => {
            log('Connected.', 'status');
            connectBtn.disabled = true;
            disconnectBtn.disabled = false;
            sendBtn.disabled = false;
            wsUrlInput.disabled = true;
        };

        websocket.onmessage = (event) => {
            log(`Received: ${event.data}`, 'received');
        };

        websocket.onerror = (error) => {
            // WebSocket error 事件不包含详细的错误信息
            log('Error: WebSocket 连接发生错误', 'error');
            showError('WebSocket 连接失败。');
        };

        websocket.onclose = (event) => {
            let reason = '';
            if (event.reason) {
                reason = `Reason: ${event.reason}`;
            }
            log(`Disconnected. Code: ${event.code}. ${reason}`, 'status');
            connectBtn.disabled = false;
            disconnectBtn.disabled = true;
            sendBtn.disabled = true;
            wsUrlInput.disabled = false;
            websocket = null;
        };
    });

    disconnectBtn.addEventListener('click', () => {
        if (websocket) {
            websocket.close();
        }
    });

    sendBtn.addEventListener('click', () => {
        if (websocket && websocket.readyState === WebSocket.OPEN) {
            const message = messageInput.value;
            if (message) {
                websocket.send(message);
                log(`Sent: ${message}`, 'sent');
                messageInput.value = '';
            }
        }
    });
    
    messageInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendBtn.click();
        }
    });
});