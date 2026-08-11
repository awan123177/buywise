const fs = require('fs');
let premium = fs.readFileSync('src/components/Premium.tsx', 'utf8');
premium = premium.replace(/<div className="max-w-2xl mx-auto w-full border border-white\/10 bg-white\/5 p-6 space-y-4">[\s\S]*?<\/div>\s*<\/div>\s*<p className="text-\[11px\] text-white\/50 leading-relaxed">[\s\S]*?<\/p>\s*<\/div>/, '');
fs.writeFileSync('src/components/Premium.tsx', premium);

let support = fs.readFileSync('src/components/HumanSupport.tsx', 'utf8');
support = support.replace(/\|\| lower\.includes\('utr'\)/, '');
fs.writeFileSync('src/components/HumanSupport.tsx', support);
console.log("Remnants cleaned");
