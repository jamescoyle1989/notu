import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
    build: {
        lib: {
            name: 'notu',
            entry: './src/index.ts'
        },
        rollupOptions: {
            output: {
                entryFileNames: `[name].js`,
                chunkFileNames: `[name].js`,
                assetFileNames: `[name].[ext]`
            }
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