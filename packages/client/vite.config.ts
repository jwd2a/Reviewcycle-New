import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  resolve: {
    alias: {
      'react': 'preact/compat',
      'react-dom': 'preact/compat',
      'react/jsx-runtime': 'preact/jsx-runtime',
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ReviewCycle',
      formats: ['es', 'umd'],
      fileName: (format) => `reviewcycle.${format}.js`,
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {},
      },
    },
    minify: 'esbuild',
    target: 'es2020',
    sourcemap: true,
  },
  plugins: [
    dts({
      include: ['src'],
      exclude: ['src/**/*.test.ts'],
      rollupTypes: true,
    }),
  ],
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'preact',
  },
});
