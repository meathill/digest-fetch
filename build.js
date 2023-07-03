#!/usr/bin/env node

import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  minify: true,
  sourcemap: true,
  platform: 'node',
  target: 'node16',
  outfile: 'dist/index.js',
  format: 'esm',
});
