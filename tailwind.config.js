/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paper + ink
        cream: "#F5EEDC",
        "cream-deep": "#EDE3CB",
        paper: "#FBF7EC",
        ink: "#2A1F12",
        "ink-soft": "#4B3D2D",

        // Vintage accent palette
        burnt: "#B85A2C",        // burnt orange — primary
        terracotta: "#C97251",
        sage: "#7A8B6E",
        "sage-deep": "#5E6E55",
        mustard: "#CC9A2E",
        butter: "#E8C25D",
        brick: "#8E3B2A",
        navy: "#2E3A52",
        rose: "#C97C8B",

        // Utility
        hairline: "#D8C8A9",
        "hairline-soft": "#E8DBBE",
        muted: "#857560",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        serif: [
          "DM Serif Display",
          "Playfair Display",
          "Georgia",
          "serif",
        ],
        body: [
          "Cormorant Garamond",
          "Garamond",
          "Georgia",
          "serif",
        ],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(42, 31, 18, 0.06), 0 4px 16px rgba(42, 31, 18, 0.06)",
        lift: "0 2px 4px rgba(42, 31, 18, 0.08), 0 12px 32px rgba(42, 31, 18, 0.12)",
        stamp:
          "inset 0 0 0 1px rgba(184, 90, 44, 0.4), 0 1px 0 rgba(184, 90, 44, 0.15)",
      },
      transitionTimingFunction: {
        cinema: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};
