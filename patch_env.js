import fs from 'fs';

let code = fs.readFileSync('server.ts', 'utf8');

const importRegex = /import [\s\S]*?;/;
const replaceStr = `process.env.TRAVELPAYOUTS_API_KEY = process.env.TRAVELPAYOUTS_API_KEY || 'f77e4ddba522db919bc7415359d7c892';\n\nconst app = express();`;
code = code.replace("const app = express();", replaceStr);

fs.writeFileSync('server.ts', code);
