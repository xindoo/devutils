# TOOLS DIRECTORY KNOWLEDGE BASE

**Generated:** 2026-02-19
**Commit:** 4ca849f
**Branch:** master

## OVERVIEW
Contains all tool HTML files for the DevUtils toolset.

## STRUCTURE
```
static/tools/
├── audio-visualization.html
├── base-converter.html
├── base64-image.html
├── base64.html
├── code-formatter.html
├── cron-converter.html
├── file-to-base64.html
├── image-compressor.html
├── image-format-converter.html
├── json-csv-converter.html
├── json-format.html
├── json-yaml-converter.html
├── markdown-previewer.html
├── nanoid-generator.html
├── panorama-video-viewer.html
├── panorama-viewer.html
├── random-data-generator.html
├── regex-tester.html
├── socketio-tester.html
├── string-hash-generator.html
├── text-counter.html
├── text-diff.html
├── time-converter.html
├── unicode.html
├── url-encode-decode.html
├── video-compressor.html
├── video-player.html
└── websocket-tester.html
```

## WHERE TO LOOK
- Add new tool HTML files here following kebab-case convention
- Corresponding JavaScript logic belongs in ../js/

## CONVENTIONS
- Kebab-case filenames (e.g., regex-tester.html)
- Each tool HTML has a matching JS file in ../js/
- Tools are registered in ../../tools.json

## ANTI-PATTERNS (THIS DIRECTORY)

## NOTES
- All tools are pure HTML + JavaScript, no server-side dependencies
