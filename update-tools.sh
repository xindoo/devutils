#!/bin/bash

# Script to add theme helper to all tool HTML files
# This ensures all tools support dark mode

TOOL_DIR="static/tools"
THEME_HELPER='<script src="../js/tool-theme-helper.js"></script>'

# Find all HTML files in tools directory
for file in "$TOOL_DIR"/*.html; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")

        # Check if theme helper is already included
        if grep -q "tool-theme-helper.js" "$file"; then
            echo "✓ $filename - Already has theme helper"
        else
            # Add theme helper before </head> tag
            if grep -q "</head>" "$file"; then
                # Create backup
                cp "$file" "$file.bak"

                # Insert theme helper script before </head>
                sed -i.tmp "s|</head>|    $THEME_HELPER\n</head>|" "$file"
                rm -f "$file.tmp"

                echo "✓ $filename - Added theme helper"
            else
                echo "✗ $filename - No </head> tag found"
            fi
        fi
    fi
done

echo ""
echo "Update complete! All tool pages now support theme switching."
echo "Backup files created with .bak extension."
