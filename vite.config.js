import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/tategaki.ts',
      name: "tategaki",
      formats: ["iife"],
      fileName: (format) => `index.js`
    },
    rollupOptions: {
      output: {
        generatedCode: "es2015"
      }
    },
    target: 'esnext'
  }
})