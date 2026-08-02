const fs = require('fs');

let file = fs.readFileSync('src/server/searchEngine.ts', 'utf-8');

const regex = /basePriceNum = 69900;/;

const replacement = `
    const charSum = baseTitle.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    basePriceNum = 1000 + (charSum % 40) * 1500;
`;

file = file.replace(regex, replacement);

fs.writeFileSync('src/server/searchEngine.ts', file, 'utf-8');
console.log("Patched price logic!");
