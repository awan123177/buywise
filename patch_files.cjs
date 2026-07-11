const fs = require('fs');
let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.files = ["dist", "server.ts", "src", "public"];
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
