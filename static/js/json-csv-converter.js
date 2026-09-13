const inputArea = document.getElementById('inputData');
const outputArea = document.getElementById('outputData');
const errorDisplay = document.getElementById('errorDisplay');

function clearError() {
    errorDisplay.textContent = '';
}

function convertToCsv() {
    clearError();
    const jsonInput = inputArea.value.trim();
    if (!jsonInput) {
        errorDisplay.textContent = 'Please enter JSON data.';
        outputArea.value = '';
        return;
    }

    try {
        const jsonData = JSON.parse(jsonInput);
        if (!Array.isArray(jsonData)) {
            errorDisplay.textContent = 'Input must be a JSON array of objects.';
            outputArea.value = '';
            return;
        }
        if (jsonData.length === 0) {
            outputArea.value = '';
            return;
        }

        // 遍历所有行取键的并集，避免仅看第一行丢失列
        const headerSet = new Set();
        for (const row of jsonData) {
            if (row && typeof row === 'object') {
                Object.keys(row).forEach(k => headerSet.add(k));
            }
        }
        const headers = Array.from(headerSet);
        const csvRows = [];
        csvRows.push(headers.join(','));

        for (const row of jsonData) {
            const values = headers.map(header => {
                const value = row ? row[header] : undefined;
                // 缺失键与非原始值统一处理：null/undefined 输出空串，对象/数组用 JSON.stringify
                let cell;
                if (value === null || value === undefined) {
                    cell = '';
                } else if (typeof value === 'object') {
                    cell = JSON.stringify(value);
                } else {
                    cell = String(value);
                }
                const escaped = cell.replace(/"/g, '""');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(','));
        }

        outputArea.value = csvRows.join('\n');
    } catch (e) {
        console.error("JSON to CSV Error:", e);
        if (e instanceof SyntaxError) {
            errorDisplay.textContent = `JSON Parsing Error: ${e.message}`;
        } else {
            errorDisplay.textContent = `CSV Conversion Error: ${e.message}`;
        }
        outputArea.value = '';
    }
}

let copyTimer = null;
const copyIcon = document.querySelector('.copy-icon');
const originalIconHtml = copyIcon.innerHTML;

function copyToClipboard() {
   if (!outputArea.value) return;
   navigator.clipboard.writeText(outputArea.value).then(() => {
       clearTimeout(copyTimer);
       copyIcon.innerHTML = `<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>`;
       copyTimer = setTimeout(() => {
           copyIcon.innerHTML = originalIconHtml;
       }, 2000);
   }).catch(err => {
       alert('无法复制到剪贴板: ' + err);
   });
}