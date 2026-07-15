import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  entry: ["src/main.ts"],
  format: ["esm"],
  noExternal: ["@repo/http-api"],
  platform: "node",
  sourcemap: true,
  target: "node22",
});
