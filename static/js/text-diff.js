document.addEventListener('DOMContentLoaded', () => {
    const text1Div = document.getElementById('text1');
    const text2Div = document.getElementById('text2');
    const lineNumbers1 = document.getElementById('lineNumbers1');
    const lineNumbers2 = document.getElementById('lineNumbers2');

    // Initialize diff-match-patch
    const dmp = new diff_match_patch();
    
    // Define diff constants
    const DIFF_DELETE = -1;
    const DIFF_INSERT = 1;
    const DIFF_EQUAL = 0;

    function compareAndHighlight() {
        // Get text content from divs, preserving line breaks
        const text1 = getTextWithLineBreaks(text1Div);
        const text2 = getTextWithLineBreaks(text2Div);

        // Update line numbers
        updateLineNumbers(text1, lineNumbers1);
        updateLineNumbers(text2, lineNumbers2);

        // Compute the difference
        const diffs = dmp.diff_main(text1, text2);
        dmp.diff_cleanupSemantic(diffs); // Make the diff more human-readable

        // Calculate statistics
        updateStatistics(diffs, text1, text2);

        // Generate HTML representation of the diffs
        const html1 = diffToHtml(diffs, 1); // HTML for the first div (show deletions)
        const html2 = diffToHtml(diffs, 2); // HTML for the second div (show insertions)

        // Store current cursor position
        const selection = window.getSelection();
        let cursorInfo = null;
        
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const cursorInDiv1 = text1Div.contains(range.startContainer);
            const cursorInDiv2 = text2Div.contains(range.startContainer);
            
            if (cursorInDiv1 || cursorInDiv2) {
                // Calculate text offset before the cursor
                const textBeforeCursor = getTextBeforeCursor(cursorInDiv1 ? text1Div : text2Div, range);
                cursorInfo = {
                    div: cursorInDiv1 ? 1 : 2,
                    textOffset: textBeforeCursor.length
                };
            }
        }

        // Update the innerHTML with highlighted diffs
        const currentHtml1 = text1Div.innerHTML;
        const currentHtml2 = text2Div.innerHTML;
        
        if (currentHtml1 !== html1) {
            text1Div.innerHTML = html1;
        }
        if (currentHtml2 !== html2) {
            text2Div.innerHTML = html2;
        }

        // Restore cursor position
        if (cursorInfo) {
            restoreCursorPosition(cursorInfo.div === 1 ? text1Div : text2Div, cursorInfo.textOffset);
        }
    }

    // Function to update line numbers
    function updateLineNumbers(text, lineNumbersDiv) {
        const lines = text.split('\n');
        const lineCount = Math.max(1, lines.length);
        
        let lineNumbersHtml = '';
        for (let i = 1; i <= lineCount; i++) {
            lineNumbersHtml += i + '\n';
        }
        
        if (lineNumbersDiv.textContent !== lineNumbersHtml.trim()) {
            lineNumbersDiv.textContent = lineNumbersHtml.trim();
        }
    }

    // Helper function to get text content while preserving line breaks
    function getTextWithLineBreaks(element) {
        let text = '';
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
            null,
            false
        );
        
        let node;
        while (node = walker.nextNode()) {
            if (node.nodeType === Node.TEXT_NODE) {
                text += node.textContent;
            } else if (node.nodeName === 'BR') {
                text += '\n';
            } else if (node.nodeName === 'DIV' && node !== element) {
                // Add newline for div elements (except the root element)
                if (text && !text.endsWith('\n')) {
                    text += '\n';
                }
            }
        }
        
        return text;
    }

    // Helper function to get text content before cursor position
    function getTextBeforeCursor(element, range) {
        const tempRange = document.createRange();
        tempRange.setStart(element, 0);
        tempRange.setEnd(range.startContainer, range.startOffset);
        
        let text = '';
        const walker = document.createTreeWalker(
            tempRange.commonAncestorContainer,
            NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
            {
                acceptNode: function(node) {
                    if (tempRange.intersectsNode(node)) {
                        return NodeFilter.FILTER_ACCEPT;
                    }
                    return NodeFilter.FILTER_REJECT;
                }
            },
            false
        );
        
        let node;
        while (node = walker.nextNode()) {
            if (node.nodeType === Node.TEXT_NODE) {
                if (node === range.startContainer) {
                    text += node.textContent.substring(0, range.startOffset);
                } else {
                    text += node.textContent;
                }
            } else if (node.nodeName === 'BR') {
                text += '\n';
            }
        }
        
        return text;
    }

    // Helper function to restore cursor position based on text offset
    function restoreCursorPosition(element, textOffset) {
        try {
            const walker = document.createTreeWalker(
                element,
                NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
                null,
                false
            );
            
            let currentOffset = 0;
            let node;
            
            while (node = walker.nextNode()) {
                if (node.nodeType === Node.TEXT_NODE) {
                    const nodeLength = node.textContent.length;
                    if (currentOffset + nodeLength >= textOffset) {
                        const selection = window.getSelection();
                        const range = document.createRange();
                        range.setStart(node, Math.min(textOffset - currentOffset, nodeLength));
                        range.collapse(true);
                        selection.removeAllRanges();
                        selection.addRange(range);
                        return;
                    }
                    currentOffset += nodeLength;
                } else if (node.nodeName === 'BR') {
                    if (currentOffset >= textOffset) {
                        const selection = window.getSelection();
                        const range = document.createRange();
                        range.setStartAfter(node);
                        range.collapse(true);
                        selection.removeAllRanges();
                        selection.addRange(range);
                        return;
                    }
                    currentOffset += 1; // BR counts as one character (newline)
                }
            }
            
            // If we couldn't find the exact position, place cursor at the end
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(element);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        } catch (e) {
            console.error("Error restoring cursor position:", e);
        }
    }

    // Function to convert diff array to HTML for a specific view (1 or 2)
    function diffToHtml(diffs, view) {
        let html = '';
        for (let i = 0; i < diffs.length; i++) {
            const op = diffs[i][0]; // Operation (DIFF_INSERT, DIFF_DELETE, DIFF_EQUAL)
            let data = diffs[i][1]; // Text of change.

            // Escape HTML characters in the data
             data = data.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');


            switch (op) {
                case DIFF_INSERT: // Insertion
                    if (view === 2) { // Show insertions in the second view
                        html += '<ins>' + data + '</ins>';
                    }
                    break;
                case DIFF_DELETE: // Deletion
                    if (view === 1) { // Show deletions in the first view
                        html += '<del>' + data + '</del>';
                    }
                    break;
                case DIFF_EQUAL: // Equal
                    html += data;
                    break;
            }
        }
        // Add a zero-width space at the end if the div is empty to ensure it's still editable
        if (html === '') {
            html = '&#8203;';
        }
        return html;
    }

    // Function to update statistics display
    function updateStatistics(diffs, text1, text2) {
        let addedCount = 0;
        let removedCount = 0;
        let totalChars = Math.max(text1.length, text2.length);
        
        // Count additions and deletions
        for (let i = 0; i < diffs.length; i++) {
            const op = diffs[i][0];
            const data = diffs[i][1];
            
            if (op === DIFF_INSERT) {
                addedCount += data.length;
            } else if (op === DIFF_DELETE) {
                removedCount += data.length;
            }
        }
        
        // Calculate similarity percentage
        let similarity = 100;
        if (totalChars > 0) {
            const changedChars = addedCount + removedCount;
            similarity = Math.max(0, Math.round((1 - changedChars / totalChars) * 100));
        }
        
        // Update DOM elements
        const addedElement = document.getElementById('addedCount');
        const removedElement = document.getElementById('removedCount');
        const similarityElement = document.getElementById('similarity');
        
        if (addedElement) addedElement.textContent = addedCount;
        if (removedElement) removedElement.textContent = removedCount;
        if (similarityElement) similarityElement.textContent = similarity + '%';
    }

    // Use debounce to limit how often compareAndHighlight runs during typing
    let debounceTimer;
    function handleInput() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(compareAndHighlight, 500); // Adjust delay as needed (e.g., 250ms)
    }

    // Add input event listeners to both divs
    text1Div.addEventListener('input', handleInput);
    text2Div.addEventListener('input', handleInput);

    // Add scroll synchronization between text areas and line numbers
    function syncScroll(textDiv, lineNumbersDiv) {
        lineNumbersDiv.scrollTop = textDiv.scrollTop;
    }

    text1Div.addEventListener('scroll', () => syncScroll(text1Div, lineNumbers1));
    text2Div.addEventListener('scroll', () => syncScroll(text2Div, lineNumbers2));

    // Initialize line numbers on load
    updateLineNumbers('', lineNumbers1);
    updateLineNumbers('', lineNumbers2);

    // Initial comparison on load (if divs have initial content)
    compareAndHighlight();
});
