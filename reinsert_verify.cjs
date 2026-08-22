const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const verificationEndpoint = `
app.post("/api/payments/verify", getUserContext, async (req: any, res: any) => {
  try {
    const userId = req.userContext?.userId || req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { session_id, payment_id, subscription_id } = req.body;
    if (!session_id && !payment_id && !subscription_id) {
       return res.status(400).json({ error: "Missing checkout parameters" });
    }

    let planId = null;
    let isSuccess = false;
    let subId = subscription_id || '';
    let payId = payment_id || '';

    if (session_id) {
       const sess = await dodoClient.checkoutSessions.retrieve(session_id);
       if (sess.metadata?.planId) planId = sess.metadata.planId;
       
       if (sess.payment_status === 'succeeded' || sess.payment_status === 'paid') {
          isSuccess = true;
          payId = sess.payment_id || payId;
       }
       if (sess.subscription_data?.subscription_id) {
          subId = sess.subscription_data.subscription_id;
       }
    } 
    
    if (subId && !isSuccess) {
       const sub = await dodoClient.subscriptions.retrieve(subId);
       if (sub.status === 'active' || sub.status === 'trialing') {
          isSuccess = true;
       }
       if (sub.metadata?.planId) planId = sub.metadata.planId;
    } 
    
    if (payId && !isSuccess) {
       const pay = await dodoClient.payments.retrieve(payId);
       if (pay.status === 'succeeded') {
          isSuccess = true;
       }
       if (pay.metadata?.planId) planId = pay.metadata.planId;
    }

    if (!isSuccess) {
       return res.json({ verified: false, status: 'pending' });
    }
    
    if (!planId) {
      planId = 'monthly';
    }

    const planDurationMap: Record<string, number> = {
      monthly: 30,
      yearly: 365,
      lifetime: 36500
    };
    const subDays = planDurationMap[planId] || 30;
    const expirationDate = new Date(Date.now() + subDays * 24 * 60 * 60 * 1000);

    // 1. Supabase Authoritative Update
    const supabaseClient = getSupabaseClient();
    if (supabaseClient) {
       try {
          await supabaseClient.from('profiles').update({
            premium: true,
            premium_expiry: expirationDate.toISOString(),
            active_plan_id: planId,
            active_plan_name: planId === 'lifetime' ? 'buywise_founder_forever' : 'buywise_premium_' + planId
          }).eq('id', userId);
          
          await supabaseClient.from('subscriptions').upsert({
            id: subId || payId || session_id || \`dodo_\${Date.now()}\`,
            user_id: userId,
            plan_id: planId,
            payment_id: payId,
            subscription_id: subId,
            status: 'active',
            provider: 'dodo'
          });
       } catch(e) { console.error("Verify endpoint supabase error", e); }
    }

    // 2. Firebase Secondary
    try {
      const admin = await import('firebase-admin');
      if (((admin as any).apps || (admin.default as any).apps).length) {
        const dbRef = ((admin as any).firestore || (admin.default as any).firestore)();
        const orderId = subId || payId || session_id || \`dodo_\${Date.now()}\`;
        await dbRef.collection('orders').doc(orderId).set({
          userId, planId, paymentId: payId, subscriptionId: subId,
          status: 'completed', provider: 'dodo', createdAt: new Date().toISOString()
        }, { merge: true });
        await dbRef.collection('users').doc(userId).set({
          premiumStatus: 'active',
          premiumPlan: planId === 'lifetime' ? 'buywise_founder_forever' : 'buywise_premium_' + planId,
          premiumSince: new Date().toISOString(),
          premiumExpiration: expirationDate.toISOString(),
        }, { merge: true });
      }
    } catch(e: any) { console.error("Firebase secondary verify error", e.message); }

    // 3. Update memory state
    try {
       const { activateUserPremium } = await import('./src/server/gamificationDb.ts');
       activateUserPremium(userId, "unknown@buywise.in", req.userContext?.name || "User", subDays, planId);
    } catch(e: any) { console.error("Memory verify error", e.message); }

    res.json({ verified: true, status: 'success' });
  } catch (error: any) {
    console.error("Dodo verify error:", error.message);
    res.status(500).json({ error: "Verification failed." });
  }
});
`;

code = code.replace(/app\.get\("\/api\/receipts\/:receiptId",/g, verificationEndpoint + '\napp.get("/api/receipts/:receiptId",');
fs.writeFileSync('server.ts', code);
