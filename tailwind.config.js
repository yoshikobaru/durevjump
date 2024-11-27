/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}",
    "./*.html"
  ],
  theme: {
    extend: {
      keyframes: {
        bug: {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '25%': { transform: 'translate(10px, 15px) rotate(10deg)' },
          '50%': { transform: 'translate(0, 30px) rotate(0deg)' },
          '75%': { transform: 'translate(-10px, 15px) rotate(-10deg)' }
        },
        'bug-reverse': {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '25%': { transform: 'translate(-10px, 15px) rotate(-10deg)' },
          '50%': { transform: 'translate(0, 30px) rotate(0deg)' },
          '75%': { transform: 'translate(10px, 15px) rotate(10deg)' }
        }
      },
      animation: {
        'bug': 'bug 4s ease-in-out infinite',
        'bug-reverse': 'bug-reverse 4s ease-in-out infinite'
      }
    }
  },
  plugins: [],
}
