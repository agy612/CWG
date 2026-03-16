/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                "background": "var(--color-bg)",
                "card-gray": "var(--color-card)",
                "card-hover": "var(--color-card-hover)",
                "surface": "var(--color-surface)",
                "t-primary": "var(--color-text)",
                "t-secondary": "var(--color-text-secondary)",
                "t-muted": "var(--color-text-muted)",
                "t-dim": "var(--color-text-dim)",
                "t-faint": "var(--color-text-faint)",
                "t-inverse": "var(--color-text-inverse)",
                "bg-inverse": "var(--color-bg-inverse)",
                "btn-secondary": "var(--color-btn-secondary)",
                "btn-secondary-text": "var(--color-btn-secondary-text)",
                "input-bg": "var(--color-input-bg)",
                "muted-teal": "#14b8a6",
                "revolut-gray": "#8E8E93"
            },
            borderColor: {
                "themed": "var(--color-border)",
                "themed-light": "var(--color-border-light)",
                "themed-medium": "var(--color-border-medium)",
            },
            backgroundColor: {
                "overlay": "var(--color-overlay)",
                "overlay-heavy": "var(--color-overlay-heavy)",
                "gradient-solid": "var(--color-gradient-solid)",
            },
            boxShadowColor: {
                "themed": "var(--color-shadow)",
            },
            fontFamily: {
                "sans": ["Inter", "-apple-system", "BlinkMacSystemFont", "Helvetica Neue", "sans-serif"],
            },
        },
    },
    plugins: [],
};
