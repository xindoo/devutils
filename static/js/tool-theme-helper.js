/**
 * Tool Theme Helper
 * This script should be included in all tool pages to ensure theme consistency
 */

(function() {
    'use strict';

    /**
     * Apply theme to tool page immediately
     */
    function applyToolTheme() {
        const THEME_KEY = 'devutils-theme';
        const savedTheme = localStorage.getItem(THEME_KEY);

        if (savedTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }

    /**
     * Listen for theme changes from parent window
     */
    function listenToThemeChanges() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'devutils-theme') {
                applyToolTheme();
            }
        });

        // Also listen to custom event
        window.addEventListener('themechange', (e) => {
            applyToolTheme();
        });
    }

    /**
     * Update inline styles to use CSS variables
     * This helps ensure custom styles work in both themes
     */
    function updateInlineStyles() {
        // Find all elements with background-color inline styles
        document.querySelectorAll('[style*="background"]').forEach(el => {
            const style = el.getAttribute('style');
            if (style) {
                // Replace common hardcoded colors with CSS variables
                let newStyle = style
                    .replace(/#f8f9fa/gi, 'var(--surface)')
                    .replace(/#ffffff/gi, 'var(--surface)')
                    .replace(/#fff/gi, 'var(--surface)')
                    .replace(/#dee2e6/gi, 'var(--border)')
                    .replace(/#6c757d/gi, 'var(--text-secondary)')
                    .replace(/#343a40/gi, 'var(--text-primary)');

                if (newStyle !== style) {
                    el.setAttribute('style', newStyle);
                }
            }
        });
    }

    // Apply theme immediately (before DOM loads)
    applyToolTheme();

    // Setup listeners when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            listenToThemeChanges();
            updateInlineStyles();
        });
    } else {
        listenToThemeChanges();
        updateInlineStyles();
    }
})();
