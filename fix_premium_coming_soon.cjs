const fs = require('fs');
let code = fs.readFileSync('src/components/Premium.tsx', 'utf8');

// Replace <span>BUY NOW — COMING SOON</span> with <span>BUY NOW</span>
code = code.replace(/<span>BUY NOW — COMING SOON<\/span>/g, '<span>BUY NOW</span>');
code = code.replace(/<span>BUY NOW - COMING SOON<\/span>/g, '<span>BUY NOW</span>');

// If there are other "COMING SOON" texts:
code = code.replace(/<span[^>]*>COMING SOON<\/span>/g, '');

fs.writeFileSync('src/components/Premium.tsx', code, 'utf8');
