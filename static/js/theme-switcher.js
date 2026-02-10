/**
 * Theme Switcher for DevUtils
 * Handles light/dark mode toggle with localStorage persistence
 */

(function() {
    'use strict';

    const THEME_KEY = 'devutils-theme';
    const THEME_LIGHT = 'light';
    const THEME_DARK = 'dark';

    /**
     * Get the current theme from localStorage or system preference
     */
    function getCurrentTheme() {
        const savedTheme = localStorage.getItem(THEME_KEY);

        if (savedTheme) {
            return savedTheme;
        }

        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return THEME_DARK;
        }

        return THEME_LIGHT;
    }

    /**
     * Apply theme to the document
     */
    function applyTheme(theme, animate = false) {
        const root = document.documentElement;

        // Add animation class if requested
        if (animate) {
            root.style.transition = 'background-color 0.3s ease, color 0.3s ease';
            setTimeout(() => {
                root.style.transition = '';
            }, 300);
        }

        // Set theme attribute
        if (theme === THEME_DARK) {
            root.setAttribute('data-theme', 'dark');
        } else {
            root.removeAttribute('data-theme');
        }

        // Save to localStorage
        localStorage.setItem(THEME_KEY, theme);

        // Update toggle button if it exists
        updateToggleButton(theme);
    }

    /**
     * Update the toggle button appearance
     */
    function updateToggleButton(theme) {
        const toggleButton = document.getElementById('theme-toggle');
        if (!toggleButton) return;

        // Add rotation animation
        toggleButton.classList.add('rotating');
        setTimeout(() => {
            toggleButton.classList.remove('rotating');
        }, 500);

        // Update aria-label
        const label = theme === THEME_DARK ? '切换到浅色模式' : '切换到深色模式';
        toggleButton.setAttribute('aria-label', label);
        toggleButton.setAttribute('title', label);
    }

    /**
     * Toggle between light and dark themes
     */
    function toggleTheme() {
        const currentTheme = getCurrentTheme();
        const newTheme = currentTheme === THEME_LIGHT ? THEME_DARK : THEME_LIGHT;
        applyTheme(newTheme, true);

        // Dispatch custom event for other scripts to listen
        window.dispatchEvent(new CustomEvent('themechange', {
            detail: { theme: newTheme }
        }));
    }

    /**
     * Initialize theme switcher
     */
    function init() {
        // Apply saved theme immediately (before DOM loads)
        const currentTheme = getCurrentTheme();
        applyTheme(currentTheme, false);

        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupToggleButton);
        } else {
            setupToggleButton();
        }

        // Listen to system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                // Only auto-switch if user hasn't manually set a preference
                const savedTheme = localStorage.getItem(THEME_KEY);
                if (!savedTheme) {
                    const newTheme = e.matches ? THEME_DARK : THEME_LIGHT;
                    applyTheme(newTheme, true);
                }
            });
        }
    }

    /**
     * Setup toggle button click handler
     */
    function setupToggleButton() {
        const toggleButton = document.getElementById('theme-toggle');
        if (!toggleButton) {
            console.warn('Theme toggle button not found');
            return;
        }

        toggleButton.addEventListener('click', toggleTheme);

        // Keyboard accessibility
        toggleButton.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleTheme();
            }
        });

        // Update initial button state
        updateToggleButton(getCurrentTheme());
    }

    // Export functions for use in other scripts
    window.ThemeSwitcher = {
        getCurrentTheme,
        applyTheme,
        toggleTheme,
        THEME_LIGHT,
        THEME_DARK
    };

    // Initialize immediately
    init();
})();
