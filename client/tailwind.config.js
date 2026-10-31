/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lime: {
          accent: '#C7F436',
          bright: '#D4F83A',
          hover: '#B8E52B',
          soft: '#EAF9A8',
        },
        obsidian: {
          900: '#0F1012',
          800: '#15171A',
          700: '#1F2327',
          600: '#2C3136',
        },
        canvas: {
          bg: '#EEF1F4',
          card: '#FFFFFF',
          border: '#E3E7EC',
          subtle: '#F6F8FA',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft-sm': '0 2px 8px -2px rgba(16, 24, 40, 0.05), 0 1px 4px -1px rgba(16, 24, 40, 0.03)',
        'soft-md': '0 8px 24px -4px rgba(16, 24, 40, 0.08), 0 4px 12px -2px rgba(16, 24, 40, 0.04)',
        'soft-lg': '0 16px 36px -6px rgba(16, 24, 40, 0.1), 0 8px 20px -3px rgba(16, 24, 40, 0.05)',
        'lime-glow': '0 10px 25px -5px rgba(199, 244, 54, 0.4)',
      },
      borderRadius: {
        '3xl': '24px',
        '4xl': '32px',
      }
    },
  },
  plugins: [],
}
