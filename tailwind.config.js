/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#ECFEFF",
          100: "#CFFAFE",
          200: "#A5F3FC",
          300: "#67E8F9",
          400: "#22D3EE",
          500: "#06B6D4",
          600: "#0891B2",
          700: "#0E7490",
          800: "#155E75",
          900: "#164E63"
        }
      },
      boxShadow: {
        glass: "inset 0 1px 0 0 rgba(255,255,255,0.08), 0 4px 24px rgba(2,12,27,0.35)"
      },
      backdropBlur: {
        xs: '2px'
      }
    }
  },
  plugins: []
};


