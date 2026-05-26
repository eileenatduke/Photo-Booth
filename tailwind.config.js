/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FAF7F2",
        ink: "#2A2620",
        accent: "#C76B3C",
        "accent-soft": "#E0916A",
        hairline: "#E6DFD3",
        muted: "#8A8175",
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
      },
      boxShadow: {
        soft: "0 1px 2px rgba(42, 38, 32, 0.05), 0 4px 16px rgba(42, 38, 32, 0.06)",
        lift: "0 2px 4px rgba(42, 38, 32, 0.06), 0 12px 32px rgba(42, 38, 32, 0.10)",
      },
      transitionTimingFunction: {
        cinema: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};
