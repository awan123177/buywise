const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/const { userId } = req;/g, "const userId = req.userContext?.userId || req.userId;");

fs.writeFileSync('server.ts', code, 'utf8');
