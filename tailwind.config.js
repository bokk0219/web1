/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // DESIGN.md 토큰
        paper: "#f7f6f3",
        card: "#ffffff",
        ink: "#1c1b1a",
        mute: "#8c8a86",
        line: "#e7e5e1",
        // 예전 이름은 같은 흑백 팔레트로 연결해 다른 화면도 함께 바뀌게 함
        cream: "#f7f6f3",
        sand: "#efede9",
        beige: "#e7e5e1",
        clay: "#bdbab4",
        brown: "#5e5c58",
        espresso: "#1c1b1a",
        stone: "#8c8a86",
      },
      fontFamily: {
        emoji: ['"Noto Emoji"', "sans-serif"],
        sans: [
          '"Gowun Dodum"',
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "none",
      },
      keyframes: {
        "word-in": {
          from: { opacity: "0", transform: "translateY(40%)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        drop: {
          "0%": { opacity: "0", transform: "translate(var(--dx), -42vh) rotate(var(--rot))" },
          "20%": { opacity: "1" },
          "80%": { opacity: "1", transform: "translate(0, 2px) rotate(calc(var(--rot) * -0.15))" },
          "100%": { opacity: "1", transform: "translate(0, 0) rotate(0deg)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "page-flip": {
          "0%, 100%": { transform: "rotateX(0deg)" },
          "50%": { transform: "rotateX(-70deg)" },
        },
      },
      animation: {
        "word-in": "word-in 0.5s ease-out",
        "page-flip": "page-flip 0.6s ease-in-out",
        drop: "drop 1.6s cubic-bezier(0.22, 0.8, 0.3, 1) both",
        "fade-up": "fade-up 0.6s ease-out both",
      },
    },
  },
  plugins: [],
};
