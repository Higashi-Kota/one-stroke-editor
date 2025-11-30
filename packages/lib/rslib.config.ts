import { defineConfig } from "@rslib/core"

export default defineConfig({
  source: {
    entry: {
      index: "./src/index.ts",
    },
  },
  lib: [
    {
      format: "esm",
      dts: true,
      bundle: true,
      autoExtension: true,
      syntax: "esnext",
    },
  ],
  output: {
    target: "web",
    distPath: {
      root: "./dist",
    },
    externals: {
      "@road-tile/wasm/pkg/road_tile_wasm": "@road-tile/wasm/pkg/road_tile_wasm",
    },
  },
})
