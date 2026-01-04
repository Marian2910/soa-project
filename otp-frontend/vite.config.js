import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "otp_app",
      filename: "remoteEntry.js",
      exposes: {
        "./OtpVerifier": "./src/components/OtpVerifier.jsx",
      },
      shared: ["react", "react-dom"],
    }),
  ],
  server: {
    port: 3001,
    cors: true, // basic CORS
    fs: { strict: false },
    headers: {
      // required for cross-origin module scripts
      "Access-Control-Allow-Origin": "http://localhost:5173",
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
});
