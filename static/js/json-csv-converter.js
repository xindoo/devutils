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

        const headers = Object.keys(jsonData[0]);
        const csvRows = [];
        csvRows.push(headers.join(','));

        for (const row of jsonData) {
            const values = headers.map(header => {
                const escaped = ('' + row[header]).replace(/"/g, '""');
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

function copyToClipboard() {
   if (!outputArea.value) return;
   navigator.clipboard.writeText(outputArea.value).then(() => {
       const icon = document.querySelector('.copy-icon');
       const originalPath = icon.innerHTML;
       icon.innerHTML = `<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>`;
       setTimeout(() => {
           icon.innerHTML = originalPath;
       }, 2000);
   }).catch(err => {
       alert('无法复制到剪贴板: ' + err);
   });
}