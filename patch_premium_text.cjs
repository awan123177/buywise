const fs = require('fs');
let code = fs.readFileSync('src/components/Premium.tsx', 'utf8');

code = code.replace(/<div className="bg-white\/5 p-4 rounded-xl border border-white\/10 text-xs text-white\/60 leading-relaxed mb-8">[\s\S]*?<\/div>/m, '');

fs.writeFileSync('src/components/Premium.tsx', code);
console.log("Patched Premium.tsx text");
