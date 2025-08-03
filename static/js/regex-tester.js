document.addEventListener('DOMContentLoaded', () => {
    const regexInput = document.getElementById('regex-input');
    const testStringInput = document.getElementById('test-string-input');
    const highlightOutput = document.getElementById('highlight-output');
    const regexError = document.getElementById('regex-error');

    function performTest() {
        const regexValue = regexInput.value;
        const stringValue = testStringInput.value;
        
        // Clear previous errors
        regexError.textContent = '';

        if (!regexValue) {
            highlightOutput.innerHTML = escapeHtml(stringValue);
            return;
        }

        try {
            const regex = new RegExp(regexValue, 'g');
            const highlightedString = stringValue.replace(regex, (match) => {
                return `<span class="highlight">${escapeHtml(match)}</span>`;
            });
            
            highlightOutput.innerHTML = highlightedString;

        } catch (error) {
            regexError.textContent = `正则表达式错误: ${error.message}`;
            highlightOutput.innerHTML = escapeHtml(stringValue); // Show plain text on error
        }
    }

    function escapeHtml(text) {
        return text
            .replace(/&/g, "&")
            .replace(/</g, "<")
            .replace(/>/g, ">")
            .replace(/"/g, '"')
            .replace(/'/g, '&#039;');
    }

    function syncScroll() {
        highlightOutput.scrollTop = testStringInput.scrollTop;
        highlightOutput.scrollLeft = testStringInput.scrollLeft;
    }

    regexInput.addEventListener('input', performTest);
    testStringInput.addEventListener('input', performTest);
    testStringInput.addEventListener('scroll', syncScroll);

    // Initial run
    performTest();
});