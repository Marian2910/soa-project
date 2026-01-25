import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/otp",
  plugins: [react()],
  server: {
    port: 3001,
    cors: true,
    proxy: {
      "/api": {
        target: "http://localhost:5062",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    target: "esnext",
  },
});
