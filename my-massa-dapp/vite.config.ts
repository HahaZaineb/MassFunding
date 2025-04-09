import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Disable TypeScript checking in development
      babel: {
        plugins: [["@babel/plugin-transform-typescript", { allowDeclareFields: true }]],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Disable TypeScript checking during build
    sourcemap: true,
    // Ensure we're building for the web
    target: "esnext",
    // Output to the dist folder
    outDir: "dist",
  },
})
