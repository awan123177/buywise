const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const replacement = `    let returnUrl = process.env.DODO_PAYMENTS_RETURN_URL || 'https://buywiser.store/premium/success';
    const isTestMode = (process.env.DODO_PAYMENTS_ENVIRONMENT || 'test_mode') === 'test_mode';
    
    if (isTestMode) {
      let reqOrigin = req.get('origin');
      if (!reqOrigin && req.get('referer')) {
        try { reqOrigin = new URL(req.get('referer')).origin; } catch (e) {}
      }
      if (reqOrigin && (reqOrigin.endsWith('.run.app') || reqOrigin.startsWith('http://localhost') || reqOrigin.startsWith('https://localhost'))) {
        returnUrl = \`\${reqOrigin}/premium/success\`;
      }
    }

    const session = await dodoClient.checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer: { email, name },
      return_url: returnUrl,
      metadata: { userId, planId, source: "buywise" }
    });`;

code = code.replace(/const session = await dodoClient\.checkoutSessions\.create\(\{[\s\S]*?return_url: process\.env\.DODO_PAYMENTS_RETURN_URL \|\| 'https:\/\/buywiser\.store\/premium\/success',[\s\S]*?metadata: \{ userId, planId, source: "buywise" \}\s*\}\);/, replacement);

fs.writeFileSync('server.ts', code, 'utf8');
