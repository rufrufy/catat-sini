import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#f4f6ff",
        surface: "#f8f9ff",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#eff4ff",
        "surface-container": "#e5eeff",
        "surface-container-high": "#dce9ff",
        "surface-container-highest": "#d3e4fe",
        "surface-variant": "#d3e4fe",
        primary: "#00685f",
        "primary-container": "#008378",
        "primary-fixed": "#89f5e7",
        "primary-fixed-dim": "#6bd8cb",
        secondary: "#3f6560",
        "secondary-container": "#c2ebe3",
        tertiary: "#924628",
        "tertiary-container": "#b05e3d",
        "tertiary-fixed": "#ffdbce",
        "tertiary-fixed-dim": "#ffb59a",
        outline: "#6d7a77",
        "outline-variant": "#bcc9c6",
        "on-surface": "#0b1c30",
        "on-surface-variant": "#3d4947",
        "on-primary": "#ffffff",
        "on-primary-container": "#f4fffc",
        "on-secondary-container": "#274d48",
        "on-tertiary": "#ffffff",
        "on-tertiary-fixed": "#370e00",
        error: "#ba1a1a",
        "error-container": "#ffdad6"
      },
      fontFamily: {
        headline: ["var(--font-manrope)"],
        body: ["var(--font-inter)"]
      },
      boxShadow: {
        ambient: "0 20px 40px rgba(11, 28, 48, 0.06)",
        veil: "0 8px 24px rgba(0, 104, 95, 0.24)"
      },
      borderRadius: {
        "4xl": "2rem"
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #00685f 0%, #008378 100%)",
        "hero-fade":
          "radial-gradient(circle at top right, rgba(0, 131, 120, 0.15), transparent 35%), radial-gradient(circle at bottom left, rgba(176, 94, 61, 0.08), transparent 30%)"
      }
    }
  },
  plugins: []
};

export default config;
