import { defineConfig } from "vite"
import typescript from "@rollup/plugin-typescript"

export default defineConfig({
  build: {
    lib: {
      entry: "src/tategaki.ts",
      name: "tategaki",
      formats: ["iife"],
      fileName: (format) => `index.js`
    },
    rollupOptions: {
      output: {
        generatedCode: "es2015"
      },
      plugins: [
        typescript({
          'target': 'es2020',
          'rootDir': 'src',
          'declaration': true,
          'declarationDir': 'dist/dts',
          exclude: 'node_modules/**'
        })
      ]
    },
    target: "esnext"
  }
})