import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"PingFang SC"',
          '"Hiragino Sans GB"',
          '"Noto Sans SC"',
          "system-ui",
          "sans-serif",
        ],
        serif: [
          '"New York"',
          '"Noto Serif SC"',
          "Georgia",
          "serif",
        ],
        mono: [
          '"SF Mono"',
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
      colors: {
        apple: {
          blue: "var(--apple-blue)",
          indigo: "var(--apple-indigo)",
          teal: "var(--apple-teal)",
          green: "var(--apple-green)",
          orange: "var(--apple-orange)",
          red: "var(--apple-red)",
          purple: "var(--apple-purple)",
        },
      },
    },
  },
  plugins: [],
};

export default config;
