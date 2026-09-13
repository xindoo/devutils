document.addEventListener('DOMContentLoaded', () => {
    const markdownInput = document.getElementById('markdown-input');
    const markdownOutput = document.getElementById('markdown-output');

    function updatePreview() {
        const markdownText = markdownInput.value;
        markdownOutput.innerHTML = DOMPurify.sanitize(marked.parse(markdownText));
    }

    markdownInput.addEventListener('input', updatePreview);

    // Initial preview
    updatePreview();
});