/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  daisyui: {
    themes: [
      "light",
      "black",
      {
        mytheme: {
          primary: "#000000",
          secondary: "#fca311",
          accent: "#e5e5e5",
          neutral: "#ffffff",
          "base-100": "#ffffff",
          info: "#2563eb",
          success: "#22c55e",
          warning: "#fbbd23",
          error: "#dc2626",
        },
      },
    ],
  },
  plugins: [require("daisyui")],
};
