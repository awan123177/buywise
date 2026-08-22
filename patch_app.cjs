const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('PremiumSuccess')) {
  code = code.replace("import Premium from './components/Premium';", "import Premium from './components/Premium';\nimport PremiumSuccess from './components/PremiumSuccess';");
  code = code.replace("<Route path=\"/premium\" element={<Premium />} />", "<Route path=\"/premium\" element={<Premium />} />\n              <Route path=\"/premium/success\" element={<PremiumSuccess />} />");
  fs.writeFileSync('src/App.tsx', code, 'utf8');
}
