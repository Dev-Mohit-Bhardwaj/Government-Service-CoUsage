/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kratos: {
          dark: "#050816",
          navy: "#080D1C",
          surface: "#0B1224",
          surfaceHover: "#111A33",
          card: "rgba(11, 18, 36, 0.75)",
          border: "rgba(0, 217, 255, 0.15)",
          borderHover: "rgba(0, 217, 255, 0.35)",
          cyan: "#00D9FF",
          cyanGlow: "#00F0FF",
          violet: "#6C63FF",
          purple: "#A78BFA",
          gold: "#F5C76A",
          muted: "#94A3B8",
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(0, 217, 255, 0.3)',
        'glow-violet': '0 0 25px -5px rgba(108, 99, 255, 0.3)',
        'glow-gold': '0 0 25px -5px rgba(245, 199, 106, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 20s linear infinite',
      }
    },
  },
  plugins: [],
}
