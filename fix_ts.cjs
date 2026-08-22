const fs = require('fs');

// Fix server.ts
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(/admin\.apps/g, '((admin as any).apps || (admin.default as any).apps)');
code = code.replace(/admin\.credential/g, '((admin as any).credential || (admin.default as any).credential)');
code = code.replace(/admin\.initializeApp/g, '((admin as any).initializeApp || (admin.default as any).initializeApp)');
code = code.replace(/admin\.auth/g, '((admin as any).auth || (admin.default as any).auth)');
code = code.replace(/admin\.firestore/g, '((admin as any).firestore || (admin.default as any).firestore)');
fs.writeFileSync('server.ts', code, 'utf8');

// Fix supabase-migration.ts
let sm = fs.readFileSync('supabase-migration.ts', 'utf8');
sm = sm.replace('admin.firestore.Firestore', 'any');
sm = sm.replace(/admin\.apps/g, '((admin as any).apps || (admin.default as any).apps)');
sm = sm.replace(/admin\.credential/g, '((admin as any).credential || (admin.default as any).credential)');
sm = sm.replace(/admin\.initializeApp/g, '((admin as any).initializeApp || (admin.default as any).initializeApp)');
sm = sm.replace(/admin\.firestore/g, '((admin as any).firestore || (admin.default as any).firestore)');
sm = sm.replace('.catch(() => {})', '');
fs.writeFileSync('supabase-migration.ts', sm, 'utf8');

console.log("Typescript issues fixed");
