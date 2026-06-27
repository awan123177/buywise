import fs from 'fs';
const content = fs.readFileSync('server.ts', 'utf8');
const fixed = content.replace(/gemini-3\.5-flash/g, 'gemini-2.0-flash').replace(/gemini-2\.5-flash/g, 'gemini-2.0-flash');
fs.writeFileSync('server.ts', fixed);
console.log('Fixed model names');
