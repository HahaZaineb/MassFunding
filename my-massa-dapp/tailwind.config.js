/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@massalabs/react-ui-kit/src/**/*.{js,ts,jsx,tsx,css}",
  ],
  presets: [require("@massalabs/react-ui-kit/presets/massa-station-preset.js")],
  theme: {
    extend: {
      colors: {
        secondary: "hsl(var(--secondary))",
        tertiary: "hsl(var(--tertiary))",
        brand: "hsl(var(--brand))",
        neutral: "hsl(var(--neutral))",
      }
    },
  },
  plugins: [],
}

