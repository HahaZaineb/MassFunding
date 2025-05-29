/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@massalabs/react-ui-kit/src/**/*.{js,ts,jsx,tsx}",
  ],
  presets: [require("@massalabs/react-ui-kit/presets/massa-station-preset.js")],
  theme: {
    extend: {
      colors: {
        'massa-cyan': '#00fff0',
        'massa-green': '#00ff9d',
        'massa-red': '#ef3e24',
        'massa-dark': '#1a2340',
        'massa-darker': '#0f1629',
        'massa-light': '#f5f5f5',
      },
      boxShadow: {
        'glow': '0 0 15px rgba(0, 255, 157, 0.5)',
      },
      backgroundImage: {
        'gradient-card': 'linear-gradient(to bottom right, #1a2340, #0f1629)',
      }
    },
  },
};
