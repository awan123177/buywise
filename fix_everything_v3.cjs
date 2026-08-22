const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetFunction = 'const getDodoPlanMap = () => {';
const startIndex = code.indexOf(targetFunction);

// This is just hopeless. I will just delete everything from line 1140 to the end of the file.
// Wait, that might be too much. 
// I will just read the file, remove the duplicated `const getDodoPlanMap` and keep only one.
const lines = code.split('\n');
let newLines = [];
let foundFunction = false;
for (let line of lines) {
    if (line.includes('const getDodoPlanMap')) {
        if (!foundFunction) {
            newLines.push(line);
            foundFunction = true;
        }
    } else {
        newLines.push(line);
    }
}
fs.writeFileSync('server.ts', newLines.join('\n'));
