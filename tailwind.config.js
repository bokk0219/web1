/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#f7f2ea",
        sand: "#efe4d3",
        beige: "#e3d3b8",
        clay: "#c9a97e",
        brown: "#8a6a4b",
        espresso: "#5b4636",
        ink: "#3a2f28",
        stone: "#8d8378",
      },
      fontFamily: {
        sans: [
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 2px 12px rgba(90, 70, 50, 0.08)",
      },
    },
  },
  plugins: [],
};
