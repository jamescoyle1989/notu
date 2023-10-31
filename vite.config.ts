import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
    build: {
        lib: {
            name: 'notu',
            entry: './src/index.ts'
        }
    },
    plugins: [
        dts({
            insertTypesEntry: true,
            outDir: './dist/types',
            exclude: '*/**/*.test.ts'
        })
    ],
    esbuild: {
        minifyIdentifiers: false
    }
});