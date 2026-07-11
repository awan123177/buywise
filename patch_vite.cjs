const fs = require('fs');
let code = fs.readFileSync('vite.config.ts', 'utf8');

if (!code.includes('build: {')) {
  code = code.replace(
    "server: {",
    "build: { outDir: 'dist', emptyOutDir: true },\n    server: {"
  );
  fs.writeFileSync('vite.config.ts', code);
}
