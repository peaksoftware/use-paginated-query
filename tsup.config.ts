import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: "terser",
  external: ["react", "next/navigation", "@tanstack/react-query"],
  esbuildOptions(options) {
    options.conditions = ["module"];
  },
});
