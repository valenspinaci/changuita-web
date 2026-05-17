/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#006039",
          light: "#1a7a4d",
          bg: "#cbe6d3",
          muted: "#eceeec",
        },
        text: {
          DEFAULT: "#191c1b",
          secondary: "#3f4941",
          muted: "#6f7a71",
        },
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};
