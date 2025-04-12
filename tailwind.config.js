/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FFFFFF", // White as primary color like Pacha
        secondary: "#E42313", // Pacha's signature red (cherry color)
        accent: "#B11A0F", // Darker red for hover states
        dark: "#000000", // Pure black like Pacha
        darker: "#0A0A0A",
        light: "#F5F5F5",
        'dark-800': "#111111",
        'dark-700': "#171717",
        'dark-600': "#1C1C1C",
        'gray-light': "#9CA3AF",
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-pacha': 'linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 1))',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.8s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      },
      fontFamily: {
        'sans': ['Montserrat', 'sans-serif'],
        'display': ['Playfair Display', 'serif'],
      },
      fontSize: {
        'xxs': '0.65rem',
      },
      spacing: {
        '128': '32rem',
      },
      maxWidth: {
        '8xl': '90rem',
      },
      letterSpacing: {
        'widest': '0.15em',
      }
    },
  },
  plugins: [],
};
