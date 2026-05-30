/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Clean warm whites
        porcelain: "#FBFAF6",
        paper: "#FFFFFF",
        cream: "#F4F1EA",

        // Ink
        ink: "#1C1B19",
        "ink-soft": "#4A4742",
        muted: "#8C857A",

        // Hairlines
        hairline: "#E7E2D8",
        "hairline-soft": "#F0ECE3",

        // Restrained, expensive metallic accent (no orange / no green)
        champagne: "#C8B595",
        "champagne-deep": "#A6906B",
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
        serif: ["DM Serif Display", "Playfair Display", "Georgia", "serif"],
        body: ["Cormorant Garamond", "Garamond", "Georgia", "serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(28, 27, 25, 0.05), 0 8px 24px rgba(28, 27, 25, 0.06)",
        lift: "0 2px 6px rgba(28, 27, 25, 0.08), 0 20px 48px rgba(28, 27, 25, 0.12)",
      },
      transitionTimingFunction: {
        cinema: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};
