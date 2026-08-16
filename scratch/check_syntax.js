import fs from 'fs';
import * as esbuild from 'esbuild';

async function check() {
  try {
    const result = await esbuild.transform(fs.readFileSync('server.ts', 'utf-8'), {
      loader: 'ts',
    });
    console.log('SUCCESS: server.ts is syntactically 100% VALID!');
  } catch (e) {
    console.error('ESBUILD SYNTAX ERROR:', e);
  }
}

check();
