const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const replacement = `
import DodoPayments from 'dodopayments';
const dodoClient = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY || ''
});

const dodoPlanMap: Record<string, string> = {
  daily: 'pdt_0NIseugD37hZhQ7eR9Igx',
  weekly: 'pdt_0NIsfcBlkdpPpZOZpBUncF',
  monthly: 'pdt_0NIsfvmdNk8MOUZDAPwFC',
  yearly: 'pdt_0NIsgR5Ig7OyWQ7hFPPO9',
  lifetime: 'pdt_0NIsgAgxtmImcGR7BFMmx'
};

app.post('/api/payments/dodo/checkout', getUserContext, async (req: any, res: any) => {
  try {
    const { userId } = req;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { planId } = req.body;
    if (!planId || !dodoPlanMap[planId]) {
      return res.status(400).json({ error: "Invalid plan ID" });
    }

    const productId = dodoPlanMap[planId];
    
    // Optional: fetch user data to attach to customer if possible
    let email = req.userEmail || "user_" + userId + "@example.com";
    let name = "BuyWise User";

    const session = await dodoClient.checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer: { email, name },
      return_url: process.env.DODO_PAYMENTS_RETURN_URL || 'https://buywiser.store/premium/success',
      metadata: { userId, planId, source: "buywise" }
    });

    res.json({ checkout_url: session.checkout_url, session_id: session.session_id });
  } catch (error: any) {
    console.error("Dodo checkout error:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

app.post('/api/webhooks/dodo', express.text({ type: '*/*' }), async (req: any, res: any) => {
  try {
    const webhookKey = process.env.DODO_PAYMENTS_WEBHOOK_KEY;
    if (!webhookKey) {
      console.error("Missing DODO_PAYMENTS_WEBHOOK_KEY");
      return res.status(500).send("Server config error");
    }

    const payload = req.body;
    
    // Convert headers to a standard object with string values
    const headers: Record<string, string> = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (Array.isArray(value)) {
        headers[key.toLowerCase()] = value[0];
      } else if (typeof value === 'string') {
        headers[key.toLowerCase()] = value;
      }
    }

    let event;
    try {
      event = dodoClient.webhooks.unwrap(payload, { headers, key: webhookKey });
    } catch (err: any) {
      console.error("Webhook verification failed:", err);
      return res.status(400).send("Webhook verification failed");
    }

    console.log("Dodo webhook event received:", event.type);
    
    const { db } = await import('./src/lib/firebase.js');
    const { doc, updateDoc, setDoc } = await import('firebase/firestore');

    const handlePremiumActivation = async (metadata: any, subscriptionId: string, paymentId: string) => {
      const { userId, planId } = metadata || {};
      if (!userId || !planId) {
        console.warn("No userId or planId in metadata", metadata);
        return;
      }

      const planDurationMap: Record<string, number> = {
        daily: 1,
        weekly: 7,
        monthly: 30,
        yearly: 365,
        lifetime: 36500
      };

      const subDays = planDurationMap[planId] || 0;
      const expirationDate = new Date(Date.now() + subDays * 24 * 60 * 60 * 1000);

      // Save order record
      const orderId = subscriptionId || paymentId || \`dodo_\${Date.now()}\`;
      await setDoc(doc(db, 'orders', orderId), {
        userId,
        planId,
        paymentId,
        subscriptionId,
        status: 'completed',
        provider: 'dodo',
        createdAt: new Date().toISOString()
      }, { merge: true });

      // Update user premium status
      await updateDoc(doc(db, 'users', userId), {
        premiumStatus: 'active',
        premiumPlan: 'buywise_premium_' + planId,
        premiumSince: new Date().toISOString(),
        premiumExpiration: expirationDate.toISOString(),
      });
      console.log(\`Activated premium \${planId} for user \${userId}\`);
    };

    switch (event.type) {
      case 'payment.succeeded': {
        const payment = event.data;
        // For one-time payments (lifetime)
        if (payment.metadata && payment.metadata.userId) {
          await handlePremiumActivation(payment.metadata, '', payment.payment_id);
        }
        break;
      }
      case 'subscription.active':
      case 'subscription.renewed': {
        const subscription = event.data;
        if (subscription.metadata && subscription.metadata.userId) {
          await handlePremiumActivation(subscription.metadata, subscription.subscription_id, '');
        }
        break;
      }
      case 'subscription.failed':
      case 'subscription.expired':
      case 'subscription.cancelled': {
        const subscription = event.data;
        if (subscription.metadata && subscription.metadata.userId) {
           await updateDoc(doc(db, 'users', subscription.metadata.userId), {
              premiumStatus: 'inactive'
           });
           console.log(\`Deactivated premium for user \${subscription.metadata.userId} due to \${event.type}\`);
        }
        break;
      }
      default:
        console.log(\`Unhandled webhook event type: \${event.type}\`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
`;

code = code.replace("const app = express();", "const app = express();\n" + replacement);

fs.writeFileSync('server.ts', code, 'utf8');
