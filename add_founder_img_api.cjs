const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
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
if (!code.includes('/api/founder-image')) {
   code = code.replace(/app\.listen\(PORT/, apiCode + '\n  app.listen(PORT');
   fs.writeFileSync('server.ts', code);
   console.log("Added /api/founder-image");
}
