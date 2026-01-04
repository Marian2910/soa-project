import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "hr_admin",
      remotes: {
        otp_app: "http://localhost:4173/assets/remoteEntry.js",
      },
      shared: {
        react: { singleton: true },
        "react-dom": { singleton: true },
        axios: { singleton: true },
      },
    }),
  ],
  server: {
    port: 5173,
    cors: true,
  },
  build: {
    target: "esnext",
  },
});
