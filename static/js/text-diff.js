document.addEventListener('DOMContentLoaded', () => {
    const text1Div = document.getElementById('text1');
    const text2Div = document.getElementById('text2');
    const lineNumbers1 = document.getElementById('lineNumbers1');
    const lineNumbers2 = document.getElementById('lineNumbers2');
    const autoWrapToggle = document.getElementById('autoWrap');

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

        // Rebuild the line-number gutters (handles wrapped lines correctly)
        renderGutter(text1Div, lineNumbers1);
        renderGutter(text2Div, lineNumbers2);
    }

    // A <br> that only exists to give an empty block some height is not a real
    // newline: the enclosing block already represents the line break.
    function isPlaceholderBR(node) {
        const parent = node.parentNode;
        return !!parent && parent.nodeName === 'DIV' && parent.childNodes.length === 1;
    }

    // Elements that represent a line of their own. Container blocks (ul, table,
    // ...) are deliberately absent: their child blocks provide the breaks.
    const BLOCK_TAGS = new Set([
        'DIV', 'P', 'LI', 'TR', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
        'BLOCKQUOTE', 'PRE', 'DD', 'DT', 'FIGCAPTION', 'ADDRESS', 'HR',
        'SECTION', 'ARTICLE', 'ASIDE', 'HEADER', 'FOOTER', 'MAIN', 'NAV',
        'FORM', 'FIELDSET', 'DETAILS', 'SUMMARY'
    ]);

    // A block element only produces a line break when it directly holds inline
    // content. Wrappers such as <div><p>..</p></div> or <ul><li>..</li></ul>
    // must not add a line of their own.
    function isLineBlock(node) {
        if (!node || node.nodeType !== Node.ELEMENT_NODE) return false;
        if (!BLOCK_TAGS.has(node.nodeName)) return false;
        const children = node.children;
        if (children) {
            for (let i = 0; i < children.length; i++) {
                if (BLOCK_TAGS.has(children[i].nodeName)) return false;
            }
        }
        return true;
    }

    // Extract plain text from an element (or DocumentFragment), turning block
    // boundaries, <br> elements and raw newlines into "\n" while skipping
    // zero-width spaces.
    function textFromRoot(root) {
        let text = '';
        let lastWasSeparator = false;
        let hasEmittedBlock = false;
        const walker = document.createTreeWalker(
            root,
            NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
            null,
            false
        );

        let node;
        while ((node = walker.nextNode())) {
            if (node.nodeType === Node.TEXT_NODE) {
                // Skip zero-width spaces (used to keep empty editable divs focusable)
                const clean = node.textContent.replace(/\u200B/g, '');
                if (clean !== '') {
                    text += clean;
                    lastWasSeparator = false;
                }
            } else if (node.nodeName === 'BR') {
                if (!isPlaceholderBR(node)) {
                    text += '\n';
                    lastWasSeparator = false;
                }
            } else if (isLineBlock(node) && node !== root) {
                if (!hasEmittedBlock) {
                    // The first line never gets a leading separator, but an
                    // empty first line must still be kept.
                    hasEmittedBlock = true;
                } else if (text.endsWith('\n') && !lastWasSeparator) {
                    // A raw newline already separates this block from the
                    // previous one; adding another would duplicate the line.
                } else {
                    text += '\n';
                    lastWasSeparator = true;
                }
            }
        }

        return text;
    }

    // Helper function to get text content while preserving line breaks
    function getTextWithLineBreaks(element) {
        return textFromRoot(element);
    }

    // Helper function to get text content before cursor position
    function getTextBeforeCursor(element, range) {
        try {
            const preRange = document.createRange();
            preRange.selectNodeContents(element);
            preRange.setEnd(range.startContainer, range.startOffset);
            const fragment = preRange.cloneContents();
            if (!fragment.hasChildNodes()) return '';
            return textFromRoot(fragment);
        } catch (e) {
            return '';
        }
    }

    // Helper function to restore cursor position based on text offset
    function restoreCursorPosition(element, textOffset) {
        try {
            const selection = window.getSelection();
            const placeCursor = (node, offset) => {
                const range = document.createRange();
                range.setStart(node, offset);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
            };
            const placeAtEnd = (node) => {
                const range = document.createRange();
                range.selectNodeContents(node);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            };

            const walker = document.createTreeWalker(
                element,
                NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
                null,
                false
            );

            let text = '';
            let lastWasSeparator = false;
            let hasEmittedBlock = false;
            let node;

            while ((node = walker.nextNode())) {
                if (node.nodeType === Node.TEXT_NODE) {
                    const clean = node.textContent.replace(/\u200B/g, '');
                    if (clean === '') continue;
                    if (text.length + clean.length >= textOffset) {
                        placeCursor(node, Math.min(textOffset - text.length, node.textContent.length));
                        return;
                    }
                    text += clean;
                    lastWasSeparator = false;
                } else if (node.nodeName === 'BR') {
                    if (!isPlaceholderBR(node)) {
                        if (text.length >= textOffset) {
                            placeCursor(node, 0);
                            return;
                        }
                        text += '\n';
                        lastWasSeparator = false;
                    }
                } else if (isLineBlock(node) && node !== element) {
                    if (!hasEmittedBlock) {
                        hasEmittedBlock = true;
                    } else if (text.endsWith('\n') && !lastWasSeparator) {
                        // No separator is added here, so nothing to resolve.
                    } else {
                        if (text.length >= textOffset) {
                            // A block boundary has no character of its own, so an
                            // offset landing exactly here belongs to the end of the
                            // previous (empty) line rather than the next block.
                            const prev = node.previousSibling;
                            const prevEmpty = prev &&
                                (prev.textContent || '').replace(/\u200B/g, '') === '';
                            if (prevEmpty && text.length === textOffset) {
                                placeAtEnd(prev);
                                return;
                            }
                            placeCursor(node, 0);
                            return;
                        }
                        text += '\n';
                        lastWasSeparator = true;
                    }
                }
            }

            // If we couldn't find the exact position, place cursor at the end
            placeAtEnd(element);
        } catch (e) {
            console.error("Error restoring cursor position:", e);
        }
    }

    function escapeHtml(value) {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    // Convert a diff array into HTML for a specific view (1 or 2).
    // Every logical line is emitted as its own block so the line-number gutter
    // can stay aligned even when a line wraps onto multiple visual rows.
    function diffToHtml(diffs, view) {
        const lines = [];
        let current = [];

        for (let i = 0; i < diffs.length; i++) {
            const op = diffs[i][0]; // Operation (DIFF_INSERT, DIFF_DELETE, DIFF_EQUAL)
            const data = diffs[i][1]; // Text of change.

            // Chunks that are not shown in this view contribute nothing,
            // including their newlines.
            if (op === DIFF_INSERT && view !== 2) continue;
            if (op === DIFF_DELETE && view !== 1) continue;

            const parts = data.split('\n');
            for (let p = 0; p < parts.length; p++) {
                if (p > 0) {
                    lines.push(current);
                    current = [];
                }
                if (parts[p] === '') continue;

                let html = escapeHtml(parts[p]);
                if (op === DIFF_INSERT) {
                    html = '<ins>' + html + '</ins>';
                } else if (op === DIFF_DELETE) {
                    html = '<del>' + html + '</del>';
                }
                current.push(html);
            }
        }
        lines.push(current);

        let html = '';
        for (let i = 0; i < lines.length; i++) {
            html += '<div class="diff-line">' + lines[i].join('') + '</div>';
        }

        // Keep an empty editor focusable/editable
        if (html === '<div class="diff-line"></div>') {
            html = '&#8203;';
        }
        return html;
    }

    // Render the line-number gutter. Numbers are absolutely positioned so they
    // line up with the first visual row of every logical line, even when the
    // text wraps.
    function renderGutter(editor, gutter) {
        const lines = editor.querySelectorAll('.diff-line');
        const parts = [];

        if (lines.length === 0) {
            const padTop = parseFloat(getComputedStyle(editor).paddingTop) || 0;
            parts.push('<span class="line-no" style="top:' + padTop + 'px">1</span>');
        } else {
            for (let i = 0; i < lines.length; i++) {
                parts.push('<span class="line-no" style="top:' + lines[i].offsetTop + 'px">' + (i + 1) + '</span>');
            }
        }

        gutter.innerHTML = parts.join('');
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

    // Paste as plain text. Rich sources (markdown editors, rendered pages,
    // chat UIs) put the raw text in the "text/plain" clipboard flavor while
    // the "text/html" flavor contains rendered markup. Letting the browser
    // paste the HTML would silently drop markdown markers ("#", "**", ...)
    // and line structure, so we always insert the plain text instead.
    function insertPlainText(text) {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer;
        if (!text1Div.contains(container) && !text2Div.contains(container)) return;

        range.deleteContents();
        const textNode = document.createTextNode(text);
        range.insertNode(textNode);

        // Place the caret right after the pasted text
        range.setStartAfter(textNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);

        handleInput();
    }

    function handlePaste(event) {
        const clipboard = event.clipboardData || window.clipboardData;
        if (!clipboard) return;

        // Normalize Windows/macOS line endings so the diff sees clean "\n".
        const text = (clipboard.getData('text/plain') || '').replace(/\r\n?/g, '\n');
        event.preventDefault();
        if (text) insertPlainText(text);
    }

    text1Div.addEventListener('paste', handlePaste);
    text2Div.addEventListener('paste', handlePaste);

    // Scroll synchronization: when either side scrolls, the other side (and both
    // line-number gutters) follow proportionally, so the line numbers on the two
    // sides stay aligned as much as possible even when line counts differ.
    let scrollLock = false;

    function syncEditors(source, sourceGutter, target, targetGutter) {
        if (scrollLock) return;
        scrollLock = true;
        try {
            const sourceMax = source.scrollHeight - source.clientHeight;
            const targetMax = target.scrollHeight - target.clientHeight;
            // Proportional mapping: same relative position in both editors. When
            // either side cannot scroll, align both to the top.
            const top = (sourceMax > 0 && targetMax > 0)
                ? (source.scrollTop / sourceMax) * targetMax
                : 0;
            if (Math.abs(target.scrollTop - top) > 0.5) {
                target.scrollTop = top;
            }
            if (Math.abs(targetGutter.scrollTop - top) > 0.5) {
                targetGutter.scrollTop = top;
            }
            if (Math.abs(sourceGutter.scrollTop - source.scrollTop) > 0.5) {
                sourceGutter.scrollTop = source.scrollTop;
            }
        } finally {
            scrollLock = false;
        }
    }

    function bindScrollSync(editor, gutter, otherEditor, otherGutter) {
        editor.addEventListener('scroll', () => {
            syncEditors(editor, gutter, otherEditor, otherGutter);
        });
        // Scrolling the gutter itself also keeps everything in sync.
        gutter.addEventListener('scroll', () => {
            if (scrollLock) return;
            editor.scrollTop = gutter.scrollTop;
            syncEditors(editor, gutter, otherEditor, otherGutter);
        });
    }

    bindScrollSync(text1Div, lineNumbers1, text2Div, lineNumbers2);
    bindScrollSync(text2Div, lineNumbers2, text1Div, lineNumbers1);

    // Auto-wrap toggle: wraps long lines instead of scrolling horizontally.
    function applyWrapMode() {
        const wrap = !autoWrapToggle || autoWrapToggle.checked;
        text1Div.classList.toggle('wrap', wrap);
        text2Div.classList.toggle('wrap', wrap);
        // Line heights change when wrapping, so reposition the line numbers.
        renderGutter(text1Div, lineNumbers1);
        renderGutter(text2Div, lineNumbers2);
    }

    if (autoWrapToggle) {
        autoWrapToggle.addEventListener('change', applyWrapMode);
    }

    // Wrapped lines change height when the window is resized.
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            renderGutter(text1Div, lineNumbers1);
            renderGutter(text2Div, lineNumbers2);
        }, 150);
    });

    // Initial setup
    applyWrapMode();
    compareAndHighlight();
});
