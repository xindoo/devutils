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
            // 只解码 \uXXXX 与 \u{hex} 转义序列，其余字符（含引号、换行、裸反斜杠）原样保留，
            // 避免整体 JSON.parse 对含特殊字符的输入必然失败
            const decodedText = text
                .replace(/\\u\{([0-9a-fA-F]{1,6})\}/g, (_, hex) => {
                    const code = parseInt(hex, 16);
                    if (code > 0x10FFFF) {
                        throw new Error('无效的 Unicode 码点: \\u{' + hex + '}');
                    }
                    return String.fromCodePoint(code);
                })
                .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
            outputTextarea.value = decodedText;
        } catch (e) {
            outputTextarea.value = '解码失败，请检查输入格式。';
        }
    });
});
