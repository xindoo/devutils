document.addEventListener('DOMContentLoaded', () => {
    const text1Div = document.getElementById('text1');
    const text2Div = document.getElementById('text2');

    // Initialize diff-match-patch
    const dmp = new diff_match_patch();

    function compareAndHighlight() {
        // Get plain text content from divs
        const text1 = text1Div.textContent || "";
        const text2 = text2Div.textContent || "";

        // Compute the difference
        const diffs = dmp.diff_main(text1, text2);
        dmp.diff_cleanupSemantic(diffs); // Make the diff more human-readable

        // Generate HTML representation of the diffs
        const html1 = diffToHtml(diffs, 1); // HTML for the first div (show deletions)
        const html2 = diffToHtml(diffs, 2); // HTML for the second div (show insertions)

        // Preserve cursor position (basic attempt - might not be perfect)
        const selection = window.getSelection();
        const anchorNode = selection.anchorNode;
        const anchorOffset = selection.anchorOffset;
        const focusNode = selection.focusNode;
        const focusOffset = selection.focusOffset;

        // Check if cursor was in one of the divs
        const cursorInDiv1 = text1Div.contains(anchorNode);
        const cursorInDiv2 = text2Div.contains(anchorNode);

        // Update the innerHTML with highlighted diffs
        // Avoid updating if the content hasn't actually changed textually
        // (prevents unnecessary cursor jumps if only whitespace/formatting changes)
        if (text1Div.innerHTML !== html1) {
             text1Div.innerHTML = html1;
        }
        if (text2Div.innerHTML !== html2) {
             text2Div.innerHTML = html2;
        }


        // Restore cursor position (basic attempt)
        // This is complex and might not work perfectly after innerHTML changes.
        // A more robust solution would involve mapping the old position to the new DOM structure.
        try {
            if (cursorInDiv1 && text1Div.contains(anchorNode)) {
                 selection.collapse(anchorNode, Math.min(anchorOffset, anchorNode.textContent.length));
            } else if (cursorInDiv2 && text2Div.contains(anchorNode)) {
                 selection.collapse(anchorNode, Math.min(anchorOffset, anchorNode.textContent.length));
            }
            // Fallback: put cursor at the start if restoration fails or wasn't in divs
            else if (cursorInDiv1) {
                 selection.collapse(text1Div.firstChild || text1Div, 0);
            } else if (cursorInDiv2) {
                 selection.collapse(text2Div.firstChild || text2Div, 0);
            }
        } catch (e) {
            console.error("Error restoring cursor position:", e);
            // Attempt to place cursor at the start as a fallback
             if (cursorInDiv1) selection.collapse(text1Div.firstChild || text1Div, 0);
             else if (cursorInDiv2) selection.collapse(text2Div.firstChild || text2Div, 0);
        }


    }

    // Function to convert diff array to HTML for a specific view (1 or 2)
    function diffToHtml(diffs, view) {
        let html = '';
        for (let i = 0; i < diffs.length; i++) {
            const op = diffs[i][0]; // Operation (DIFF_INSERT, DIFF_DELETE, DIFF_EQUAL)
            let data = diffs[i][1]; // Text of change.

            // Escape HTML characters in the data
             data = data.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/\n/g, '<br>');


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

    // Use debounce to limit how often compareAndHighlight runs during typing
    let debounceTimer;
    function handleInput() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(compareAndHighlight, 500); // Adjust delay as needed (e.g., 250ms)
    }

    // Add input event listeners to both divs
    text1Div.addEventListener('input', handleInput);
    text2Div.addEventListener('input', handleInput);

    // Initial comparison on load (if divs have initial content)
    compareAndHighlight();
});
