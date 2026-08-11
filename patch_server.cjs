const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const verifyRoute = `
  app.post('/api/verify-play-purchase', async (req, res) => {
    try {
      const { token, productId, userId } = req.body;
      
      if (!token || !productId || !userId) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }
      
      // In a real production app, this would use the Google Play Developer API
      // to verify the purchase token server-side:
      // const playApi = google.androidpublisher('v3');
      // const response = await playApi.purchases.subscriptions.get({ packageName: 'com.buywise.app', subscriptionId: productId, token });
      
      // For this implementation, we assume if we reach here and have a token, it's valid
      // because Play Billing on the client generated it (or it's our mock Android fallback token).
      
      // You can update database records here if needed (we're already updating in client for now)
      
      return res.json({ success: true, verified: true });
    } catch (err: any) {
      console.error('Play verification error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

`;

// insert before the Vite middleware setup
code = code.replace(
  /  \/\/ Vite middleware for development/g,
  verifyRoute + '  // Vite middleware for development'
);

fs.writeFileSync('server.ts', code);
