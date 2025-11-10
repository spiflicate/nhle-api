import { defineConfig } from 'tsup';

export default defineConfig({
   entry: ['src/index.ts'],
   format: ['esm', 'cjs'],
   dts: true,
   sourcemap: true,
   outDir: 'lib',
   clean: true,
   splitting: false,
   treeshake: true,
});
