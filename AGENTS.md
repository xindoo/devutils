# PROJECT KNOWLEDGE BASE

**Generated:** 2026-02-19
**Commit:** 4ca849f
**Branch:** master

## OVERVIEW
DevUtils is a web-based developer toolset with all functionality running locally in the browser.

## STRUCTURE
```
devutils/
├── .github/          # CI/CD workflows
├── static/           # Static assets
│   ├── css/          # Stylesheets
│   ├── js/           # JavaScript source files
│   └── tools/        # Tool HTML files
├── index.html        # Main entry point
└── tools.json        # Tool definitions
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Add new tool | static/tools/, static/js/, tools.json | Follow existing naming convention |
| Modify UI | static/css/, index.html | Theme switching is in static/js/theme-switcher.js |
| CI/CD | .github/workflows/ | Deploys to GitHub Pages |

## CODE MAP
| Symbol | Type | Location | Refs | Role |
|--------|------|----------|------|------|

## CONVENTIONS
- Tool files use kebab-case naming (e.g., regex-tester.html)
- Tools are defined in tools.json with bilingual support (Chinese/English)
- No build process - all files serve directly

## ANTI-PATTERNS (THIS PROJECT)

## UNIQUE STYLES
- All tools run locally in browser - no server-side components
- Bilingual interface (Chinese/English)

## COMMANDS
```bash
# Serve locally (using serve)
npx serve .

# Serve locally (Python)
python -m http.server 8000
```

## NOTES
- No package.json or dependencies
- All data stays local in the browser
