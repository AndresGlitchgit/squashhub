import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'sq-dark': '#0c0c0c',
        'sq-card': '#161616',
        'sq-border': '#1f1f1f',
        'sq-green': '#10B981',
        'sq-green-dark': '#059669',
        'sq-yellow': '#FBBF24',
      },
    },
  },
  plugins: [],
};

export default config;
