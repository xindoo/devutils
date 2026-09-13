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
            // Split the string into matched/unmatched segments and escape every
            // segment before building HTML, so unescaped input never reaches innerHTML
            let highlightedString = '';
            let lastIndex = 0;
            let match;
            while ((match = regex.exec(stringValue)) !== null) {
                highlightedString += escapeHtml(stringValue.slice(lastIndex, match.index));
                highlightedString += `<span class="highlight">${escapeHtml(match[0])}</span>`;
                lastIndex = match.index + match[0].length;
                if (match[0].length === 0) {
                    regex.lastIndex++; // Avoid infinite loop on zero-length matches
                }
            }
            highlightedString += escapeHtml(stringValue.slice(lastIndex));
            
            highlightOutput.innerHTML = highlightedString;

        } catch (error) {
            regexError.textContent = `正则表达式错误: ${error.message}`;
            highlightOutput.innerHTML = escapeHtml(stringValue); // Show plain text on error
        }
    }

    function escapeHtml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
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