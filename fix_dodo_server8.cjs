const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  `// Optional: save to local db to track initiated sessions
    const { db } = await import('./src/lib/firebase.js');
    const { doc, setDoc } = await import('firebase/firestore');`,
  `// Optional: save to local db to track initiated sessions
    const { db, doc, setDoc } = await import('./src/lib/firebase.js');`
);

fs.writeFileSync('server.ts', code, 'utf8');
