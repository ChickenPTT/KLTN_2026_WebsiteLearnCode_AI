import esbuild from 'esbuild';
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const testFile = path.join(rootDir, 'tests', 'difficulty.test.ts');
const tempDir = path.join(rootDir, '.temp-tests');

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const outFile = path.join(tempDir, 'difficulty.test.mjs');

try {
  await esbuild.build({
    entryPoints: [testFile],
    outfile: outFile,
    bundle: true,
    format: 'esm',
    platform: 'node',
    alias: {
      '@': path.join(rootDir, 'src'),
    },
  });

  const child = spawn(process.execPath, ['--test', outFile], {
    stdio: 'inherit',
    cwd: rootDir,
  });

  child.on('exit', (code) => {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
    process.exit(code ?? 0);
  });
} catch (err) {
  console.error('Lỗi khi biên dịch test:', err);
  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
  } catch {
    // ignore
  }
  process.exit(1);
}
