document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('text-input');
    const charCount = document.getElementById('char-count');
    const wordCount = document.getElementById('word-count');
    const lineCount = document.getElementById('line-count');

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

    textInput.addEventListener('input', updateCounts);

    // Initial count
    updateCounts();
});
