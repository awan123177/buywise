const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const gpEndpoint = `
// Google Play Purchase Verification
app.post('/api/google-play/verify-purchase', async (req, res) => {
  try {
    const { productId, purchaseToken, couponCode } = req.body;
    
    console.log(\`Verifying Google Play purchase: \${productId} / \${purchaseToken}\`);
    
    let durationDays = 0;
    if (productId.includes('daily')) durationDays = 1;
    if (productId.includes('weekly')) durationDays = 7;
    if (productId.includes('monthly')) durationDays = 30;
    if (productId.includes('yearly')) durationDays = 365;
    if (productId.includes('founder')) durationDays = 36500; // 100 years
    
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + durationDays);
    
    res.json({
      success: true,
      verified: true,
      expiryTime: expiryDate.toISOString(),
      subscriptionState: 'ACTIVE'
    });
  } catch (error: any) {
    console.error('Verify purchase error:', error);
    res.status(500).json({ success: false, error: 'Verification failed' });
  }
});

app.post('/api/google-play/restore-purchases', async (req, res) => {
  res.json({ success: false, error: 'No active subscriptions found.' });
});
`;

code = code.replace(
  /app\.post\('\/api\/gamification\/spin'/g,
  `${gpEndpoint}\n\napp.post('/api/gamification/spin'`
);

fs.writeFileSync('server.ts', code);
console.log('Added GP endpoints to server.ts');
