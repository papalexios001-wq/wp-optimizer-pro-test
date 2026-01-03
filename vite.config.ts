import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    server: {
        port: 3000,
        host: '0.0.0.0',
        open: true,
        cors: true
    },
    plugins: [react()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('.', import.meta.url))
        }
    },
    build: {
        target: 'esnext',
        minify: 'esbuild',
        sourcemap: false
    },
    optimizeDeps: {
        include: ['react', 'react-dom', 'zustand', 'immer', '@google/genai']
    }
});
