/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
    
  },
  plugins: [require("daisyui")],

  // ixtiyoriy - o'zingizga yoqqan theme ni tanlang
  daisyui: {
    themes: ["light", "dark", "cupcake", "valentine", "cyberpunk",],
  },
};
