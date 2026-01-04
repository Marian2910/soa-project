import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "hr_admin",
      remotes: {
        otp_app: "http://localhost:3001/assets/remoteEntry.js",
      },
      shared: {
        react: { singleton: true },
        "react-dom": { singleton: true },
        axios: { singleton: true },
      },
    }),
  ],
  build: {
    target: "esnext",
  },
});
