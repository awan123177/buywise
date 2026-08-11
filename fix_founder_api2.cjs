const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const apiCode = `
  app.get('/api/founder-image', (req, res) => {
     const distPath = path.join(process.cwd(), 'dist', 'founder.jpg');
     const publicPath = path.join(process.cwd(), 'public', 'founder.jpg');
     
     if (fs.existsSync(distPath)) {
        res.sendFile(distPath);
     } else if (fs.existsSync(publicPath)) {
        res.sendFile(publicPath);
     } else {
        res.status(404).send('Image not found');
     }
  });
`;

code = code.replace(/app\.get\('\/api\/founder-image', \(req, res\) => {[\s\S]*?res\.status\(404\)\.send\('Image not found'\);\n     }\n  }\);/g, apiCode.trim());
fs.writeFileSync('server.ts', code);
