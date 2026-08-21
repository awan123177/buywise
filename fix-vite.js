const fs = require('fs');
let code = fs.readFileSync('vite.config.ts', 'utf8');
code = code.replace("import { VitePWA } from 'vite-plugin-pwa';", "");
code = code.replace(/VitePWA\(\{[\s\S]*?\}\)/, "");
fs.writeFileSync('vite.config.ts', code);
