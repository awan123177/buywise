const fs = require('fs');
let code = fs.readFileSync('src/components/Premium.tsx', 'utf8');

code = code.replace(/headers: \{\n\s*'Content-Type': 'application\/json'\n\s*\}/, 
`headers: {
            'Content-Type': 'application/json',
            'x-user-id': user?.uid || (user as any)?.id || '',
            'x-user-email': user?.email || '',
            'x-user-name': user?.displayName || ''
          }`);

fs.writeFileSync('src/components/Premium.tsx', code, 'utf8');
