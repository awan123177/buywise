const fs = require('fs');
const file = 'server.ts';
let content = fs.readFileSync(file, 'utf-8');

const regex = /const session = await dodoClient\.checkoutSessions\.create\(\{[\s\S]*?\}\);/;
const match = content.match(regex);
if (match) {
   const insertCode = `
    const session = await dodoClient.checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer: { email, name },
      return_url: returnUrl,
      metadata: { userId, planId, source: "buywise" }
    });
    
    // Write to data_store.json for preview environment verification
    try {
      const storePath = path.join(process.cwd(), "data_store.json");
      if (fs.existsSync(storePath)) {
         const raw = JSON.parse(fs.readFileSync(storePath, "utf-8"));
         if (!raw.pendingCheckouts) raw.pendingCheckouts = {};
         raw.pendingCheckouts[userId] = { sessionId: session.session_id, planId: planId, timestamp: Date.now() };
         fs.writeFileSync(storePath, JSON.stringify(raw, null, 2));
      }
    } catch (e) {
      console.error("Failed to store pending checkout", e);
    }
   `.trim();
   
   content = content.replace(match[0], insertCode);
   fs.writeFileSync(file, content);
   console.log("Patched checkout");
} else {
   console.log("Regex match failed");
}
