/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
        success: "#28a745",
        info: "#17a2b8",
        warning: "#ffc107",
        danger: "#dc3545",
        primary: {
          1: "#09a4ff",
          2: "#21aafe",
          3: "#3bb5fe",
          4: "#64c6ff",
          5: "#9adbff",
          6: "#cbeeff",
        },
        dark: {
          1: "#0a0a09",
          2: "#232322",
          3: "#3a3a39",
          4: "#535352",
          5: "#6d6d6c",
          6: "#888888",
        },
        mixed: {
          1: "#211f13",
          2: "#363428",
          3: "#4c4a3f",
          4: "#636158",
          5: "#7b7971",
          6: "#94938c",
        },
        senderMessageColor: "#cc88e7",
        senderMessageColorDark: "#72378b",
        document: {
          light: "#d400c6",
          dark: "#d96ad1",
        },
        image: {
          light: "#ff0040",
          dark: "#de7a93",
        },
        video: {
          light: "#4b0380",
          dark: "#ae66e3",
        },
        audio: {
          light: "#055e00",
          dark: "#8beb88",
        },
      },
      animation: {
        smoothBounce: "smoothBounce 1.3s linear infinite",
        'spin-slow': 'spin 10s linear infinite',
        'glow-pulse': 'glow-pulse 2s infinite',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'pulse-pop': 'pulse-pop 0.8s ease-in-out infinite',
      },
      keyframes: {
        smoothBounce: {
          "0%, 60%, 100%": { transform: "translateY(0)" },
          "30%": { transform: "translateY(-6px)" },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: 0.8, transform: 'scale(1)' },
          '50%': { opacity: 1, transform: 'scale(1.05)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { 
            transform: 'translateY(0) scale(1)', 
          },
          '50%': { 
            transform: 'translateY(-6px) scale(1.05)',
            filter: 'brightness(1.1)'
          },
        },
        'pulse-pop': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.3)' },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
