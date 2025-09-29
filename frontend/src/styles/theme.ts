import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

// Puedes extender la configuración base
const config = defineConfig({
    theme: {
        tokens: {
        colors: {
            brand: {
            50:  { value: "#f5f3ff" },
            100: { value: "#ede9fe" },
            200: { value: "#ddd6fe" },
            300: { value: "#c4b5fd" },
            400: { value: "#a78bfa" },
            500: { value: "#8b5cf6" }, // tu color principal
            600: { value: "#7c3aed" },
            700: { value: "#6d28d9" },
            800: { value: "#5b21b6" },
            900: { value: "#4c1d95" },
            },
            accent: {
            500: { value: "#f59e0b" }, // color secundario / acento
            },
            background: {
            light: { value: "#ffffff" },
            dark: { value: "#202020ff" },
            },
        },
        },
        breakpoints: {
            sm: "30em",   // 480px
            md: "48em",   // 768px
            lg: "62em",   // 992px
            xl: "80em",   // 1280px
            "2xl": "96em", // 1536px
            "3xl": "112em",
        },
    },
    })

export const theme = createSystem(defaultConfig, config)