const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `app.post("/api/payments/verify", getUserContext, async (req: any, res: any) => {
  try {
    const userId = req.userContext?.userId || req.userId;`;
    
const replacement = `app.post("/api/payments/verify", getUserContext, async (req: any, res: any) => {
  console.log("--- VERIFY ENDPOINT CALLED ---");
  console.log("Body:", req.body);
  console.log("Headers:", { uid: req.headers['x-user-id'], email: req.headers['x-user-email'] });
  
  try {
    const userId = req.userContext?.userId || req.userId;`;

code = code.replace(target, replacement);
fs.writeFileSync('server.ts', code);
