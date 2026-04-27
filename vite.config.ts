import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@jabali/auth": path.resolve(__dirname, "vendor/@jabali/auth"),
      "@jabali/llm-games-sdk": path.resolve(
        __dirname,
        "vendor/@jabali/llm-games-sdk"
      ),
    },
  },
  // IMPORTANT: Keep base "./" for subdirectory deployments and assetsDir "" (empty)
  // so CSS url() references resolve correctly relative to images at the root level.
  // Without this, CSS urls like url('images/bg.png') would incorrectly resolve to /assets/images/bg.png
  base: "./",
  build: {
    assetsDir: "",
  },
});
