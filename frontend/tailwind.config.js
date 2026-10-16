/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          0: '#0A0D12',
          1: '#10141B',
          2: '#151A22',
          3: '#1C222C',
          hover: '#212832',
        },
        border: {
          DEFAULT: '#232A34',
          strong: '#323C49',
        },
        ink: {
          primary: '#EDF1F5',
          secondary: '#95A1B0',
          muted: '#5B6675',
        },
        accent: {
          DEFAULT: '#3E93B0',
          strong: '#57ADC9',
          dim: '#1B3038',
          text: '#7FCBE3',
        },
        success: { DEFAULT: '#4CAE80', dim: '#152A21', text: '#7BD3A5' },
        warning: { DEFAULT: '#D6B24C', dim: '#2B2413', text: '#E8CD7C' },
        caution: { DEFAULT: '#D98F4E', dim: '#2C2013', text: '#EAAE72' },
        danger: { DEFAULT: '#D95B54', dim: '#2E1918', text: '#F08887' },
        inactive: { DEFAULT: '#5B6675', dim: '#1B1F26', text: '#8A94A2' },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '10px',
        lg: '14px',
      },
    },
  },
  plugins: [],
}
