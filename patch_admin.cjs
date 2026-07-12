const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');
code = code.replace(/fs\.writeFileSync\(publicPath, buffer\);/g, `fs.writeFileSync(publicPath, buffer);
      fs.writeFileSync(path.join(process.cwd(), "public", "founder.png"), buffer);`);
code = code.replace(/fs\.writeFileSync\(distPath, buffer\);/g, `fs.writeFileSync(distPath, buffer);
        fs.writeFileSync(path.join(process.cwd(), "dist", "founder.png"), buffer);`);
fs.writeFileSync('server.ts', code);
