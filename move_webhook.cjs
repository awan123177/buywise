const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const webhookRegex = /app\.post\('\/api\/webhooks\/dodo', express\.text\(\{ type: '\*\/\*' \}\), async \(req: any, res: any\) => \{[\s\S]*?\}\);\n/g;

const match = code.match(webhookRegex);
if (match) {
  code = code.replace(webhookRegex, "");
  code = code.replace("app.use(express.json({ limit: \"15mb\" }));", match[0] + "\n  app.use(express.json({ limit: \"15mb\" }));");
  fs.writeFileSync('server.ts', code, 'utf8');
}
