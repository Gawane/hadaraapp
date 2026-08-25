import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        emerald: { 950: '#062A20', 800: '#0B3D2E', 600: '#10603F' },
        gold: { 500: '#C9A227', 300: '#E3C766' },
        cream: '#FBF8F1',
        sand: '#EDE4CC',
      },
    },
  },
  plugins: [],
};
export default config;
