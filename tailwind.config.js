/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      minHeight: {
        100: "400px",
      },
      backgroundImage: {
        "linear-to-r": "linear-gradient(to right, var(--tw-gradient-stops))",
        "linear-to-br":
          "linear-gradient(to bottom right, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
