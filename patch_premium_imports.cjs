const fs = require('fs');
let code = fs.readFileSync('src/components/Premium.tsx', 'utf8');

code = code.replace(/import \{.*?\} from 'lucide-react';/, "import { ShieldCheck, Check } from 'lucide-react';");
code = code.replace(/import QRCode from 'react-qr-code';\n/, "");

fs.writeFileSync('src/components/Premium.tsx', code);
console.log("Patched Premium.tsx imports");
