document.addEventListener('DOMContentLoaded', () => {
    const inputTextarea = document.getElementById('input-text');
    const outputTextarea = document.getElementById('output-text');
    const encodeButton = document.getElementById('encode-button');
    const decodeButton = document.getElementById('decode-button');

    encodeButton.addEventListener('click', () => {
        const text = inputTextarea.value;
        let unicodeEncoded = '';
        for (let i = 0; i < text.length; i++) {
            let charCode = text.charCodeAt(i).toString(16);
            while (charCode.length < 4) {
                charCode = '0' + charCode;
            }
            unicodeEncoded += '\\u' + charCode;
        }
        outputTextarea.value = unicodeEncoded;
    });

    decodeButton.addEventListener('click', () => {
        const text = inputTextarea.value;
        try {
            // Use JSON.parse to handle unicode escape sequences
            // Wrap in quotes to make it a valid JSON string
            const decodedText = JSON.parse('"' + text.replace(/\\u/g, '\\u') + '"');
            outputTextarea.value = decodedText;
        } catch (e) {
            outputTextarea.value = '解码失败，请检查输入格式。';
        }
    });
});
