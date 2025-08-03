document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('text-input');
    const charCount = document.getElementById('char-count');
    const wordCount = document.getElementById('word-count');
    const lineCount = document.getElementById('line-count');
    const statsBar = document.getElementById('stats-bar');
    const toolContent = textInput.closest('.tool-content');

    function updateCounts() {
        const text = textInput.value;

        // Character count
        charCount.textContent = text.length;

        // Word count
        const words = text.trim().split(/\s+/).filter(word => word.length > 0);
        wordCount.textContent = words.length === 1 && words[0] === '' ? 0 : words.length;


        // Line count
        const lines = text.split('\n');
        lineCount.textContent = text ? lines.length : 0;
    }

    function autoResizeTextarea() {
        if (toolContent && statsBar) {
            const containerHeight = toolContent.clientHeight;
            const statsHeight = statsBar.parentElement.offsetHeight;
            const availableHeight = containerHeight - statsHeight;
            textInput.style.maxHeight = `${availableHeight}px`;
        }

        textInput.style.height = 'auto';
        textInput.style.height = `${textInput.scrollHeight}px`;
    }

    textInput.addEventListener('input', () => {
        updateCounts();
        autoResizeTextarea();
    });

    const resizeObserver = new ResizeObserver(() => {
        autoResizeTextarea();
    });

    if (toolContent) {
        resizeObserver.observe(toolContent);
    }

    // Initial count and resize
    updateCounts();
    autoResizeTextarea();
});