import typescript from '@rollup/plugin-typescript'
import { terser } from 'rollup-plugin-terser'
import { nodeResolve } from '@rollup/plugin-node-resolve'

export default [
  {
    input: 'src/tategaki.ts',
    plugins: [
      typescript({
        target: 'es2020',
        rootDir: 'src',
        declaration: true,
        declarationDir: 'dist/dts',
        exclude: 'node_modules/**',
        sourceMap: false
      })
    ],
    output: [
      {
        file: 'dist/tategaki.cjs.js',
        format: 'cjs',
        generatedCode: 'es2015'
      },
      {
        file: 'dist/tategaki.es.js',
        format: 'es',
        generatedCode: 'es2015'
      }
    ],
  },
  {
    input: 'src/external.ts',
    plugins: [typescript(), nodeResolve(), terser()],
    moduleContext: {
      'node_modules/detect-browser/es/index.js': 'window'
    },
    output: {
      file: 'dist/tategaki.iife.js',
      format: 'iife',
      generatedCode: 'es2015',
      compact: true,
      sourcemap: true
    }
  }
]