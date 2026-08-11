const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(/app\.get\('\/api\/founder-image',[\s\S]*?app\.listen\(PORT, "0\.0\.0\.0", \(\) => {/g, 'app.listen(PORT, "0.0.0.0", () => {');

const apiCode = `
  app.get('/api/founder-image', (req, res) => {
     const fs = require('fs');
     const path = require('path');
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

code = code.replace(/\/\/ Vite middleware for development/, apiCode + '\n  // Vite middleware for development');
fs.writeFileSync('server.ts', code);
