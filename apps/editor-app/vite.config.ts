import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: [{ find: "@", replacement: resolve(__dirname, "./src") }],
  },
  server: {
    port: 10000,
    open: true,
    fs: {
      allow: [".."],
    },
  },
  preview: {
    port: 10000,
  },
  worker: {
    format: "es",
  },
  optimizeDeps: {
    exclude: ["@road-tile/lib", "@road-tile/wasm"],
  },
  build: {
    target: "esnext",
    sourcemap: false,
  },
  assetsInclude: ["**/*.wasm"],
})
