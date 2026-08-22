const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Replace standard admin usages with casted usages
code = code.replace(/admin\.apps/g, '((admin as any).apps || (admin as any).default?.apps)');
code = code.replace(/admin\.credential/g, '((admin as any).credential || (admin as any).default?.credential)');
code = code.replace(/admin\.initializeApp/g, '((admin as any).initializeApp || (admin as any).default?.initializeApp)');
code = code.replace(/admin\.auth/g, '((admin as any).auth || (admin as any).default?.auth)');
code = code.replace(/admin\.firestore/g, '((admin as any).firestore || (admin as any).default?.firestore)');

fs.writeFileSync('server.ts', code, 'utf8');
