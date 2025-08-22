// react-vite/vite.config.js
import { defineConfig } from "vite";
import eslintPlugin from "vite-plugin-eslint";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    eslintPlugin({
      lintOnStart: true,
      failOnError: mode === "production",
    }),
  ],
  server: {
    open: true,
    proxy: {
      "/api": "http://127.0.0.1:8000",
    },
  },
}));
