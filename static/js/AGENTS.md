# JAVASCRIPT DIRECTORY KNOWLEDGE BASE

**Generated:** 2026-02-19
**Commit:** 4ca849f
**Branch:** master

## OVERVIEW
Contains all JavaScript source files for the DevUtils toolset.

## STRUCTURE
```
static/js/
├── app.js                # Main application bootstrap
├── json-csv-converter.js
├── markdown-previewer.js
├── regex-tester.js
├── socketio-tester.js
├── text-counter.js
├── text-diff.js
├── theme-switcher.js     # Theme switching logic
├── tool-theme-helper.js
├── unicode.js
├── video-compressor.js
└── websocket-tester.js
```

## WHERE TO LOOK
- app.js: Main app initialization and navigation
- theme-switcher.js: Dark/light theme management
- Tool-specific JS files match HTML files in ../tools/

## CONVENTIONS
- Kebab-case filenames (e.g., regex-tester.js)
- Each JS file corresponds to a tool HTML file in ../tools/

## ANTI-PATTERNS (THIS DIRECTORY)

## NOTES
- No build process - all JS files are directly included in HTML
