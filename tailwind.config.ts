import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#e5e7eb',
            a: {
              color: '#3b82f6',
              '&:hover': {
                color: '#60a5fa',
              },
            },
            h1: { color: '#f3f4f6' },
            h2: { color: '#f3f4f6' },
            h3: { color: '#f3f4f6' },
            h4: { color: '#f3f4f6' },
            code: { color: '#f3f4f6' },
            strong: { color: '#f3f4f6' },
            pre: {
              backgroundColor: '#1e293b',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
export default config
