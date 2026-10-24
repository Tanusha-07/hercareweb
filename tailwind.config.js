/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand pink (berry/blush) is retained for identity and emergency.
        // The interface accents are light blue (formerly lavender) and light
        // green (sage), over a cool blue-green tinted neutral (cream). Text
        // always carries a label too — colour is never the only signal.
        berry: {
          50: '#fdf2f7',
          100: '#fce7f1',
          200: '#fbcfe3',
          300: '#f9a8cd',
          400: '#f472b0',
          500: '#e94894',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174b',
          900: '#831843',
        },
        blush: {
          50: '#fff5f8',
          100: '#ffe9f0',
          200: '#ffd6e3',
        },
        // Light blue — secondary buttons, selections, informational surfaces.
        lavender: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        // Light, fresh green — positive, wellness and privacy surfaces.
        sage: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        // Cool blue-green tinted neutral — page background and chips.
        cream: {
          50: '#f6fbfb',
          100: '#eef6f8',
          200: '#e0eef2',
          300: '#cfe3e9',
        },
        ink: {
          DEFAULT: '#241a20',
          soft: '#4b3b45',
          muted: '#6f5c67',
        },
        alert: {
          red: '#b42318',
          redBg: '#fde8e6',
          amber: '#a15c07',
          amberBg: '#fdf1dc',
          green: '#2f522f',
          greenBg: '#e3ede1',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans"', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        // Larger base sizes: readable for low-literacy and low-vision users.
        '2xs': ['0.8125rem', { lineHeight: '1.1rem' }],
        base: ['1.0625rem', { lineHeight: '1.6rem' }],
        lg: ['1.1875rem', { lineHeight: '1.75rem' }],
        xl: ['1.375rem', { lineHeight: '1.9rem' }],
        '2xl': ['1.6rem', { lineHeight: '2.1rem' }],
      },
      spacing: {
        tap: '2.75rem', // 44px minimum touch target
      },
      borderRadius: {
        card: '1.25rem',
        pill: '999px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(36,26,32,0.04), 0 8px 24px -12px rgba(36,26,32,0.18)',
      },
      minHeight: {
        tap: '2.75rem',
        'tap-lg': '3.25rem',
      },
      minWidth: {
        tap: '2.75rem',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'none' },
        },
      },
      animation: {
        'fade-in': 'fade-in 160ms ease-out',
      },
    },
  },
  plugins: [],
};
