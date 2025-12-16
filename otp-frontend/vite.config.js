import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'otp_app',
      filename: 'remoteEntry.js',
      exposes: {
        './OtpVerifier': './src/components/OtpVerifier.jsx',
      },
      shared: ['react', 'react-dom', 'axios']
    })
  ],
  build: {
    target: 'esnext'
  },
  server: {
    port: 3001,
    cors: true
  }
});