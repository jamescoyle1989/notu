import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
            name: 'notu',
            entry: './src/index.ts'
        }
    }
});