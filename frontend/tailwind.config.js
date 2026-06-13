/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#0a0a16",
        darkCard: "#12122c",
        darkCardHover: "#19193f",
        neonBlue: "#00f0ff",
        neonPurple: "#bd00ff",
        cyberPink: "#ff007f",
        neonGreen: "#39ff14",
        glowCyan: "rgba(0, 240, 255, 0.15)",
        glowPurple: "rgba(189, 0, 255, 0.15)",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        orbitron: ['Orbitron', 'sans-serif'],
      },
      boxShadow: {
        'neon-blue': '0 0 12px rgba(0, 240, 255, 0.4), 0 0 24px rgba(0, 240, 255, 0.15)',
        'neon-purple': '0 0 12px rgba(189, 0, 255, 0.4), 0 0 24px rgba(189, 0, 255, 0.15)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }
    },
  },
  plugins: [],
}
