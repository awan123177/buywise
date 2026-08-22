const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldHandle = `    const handlePremiumActivation = async (metadata: any, subscriptionId: string, paymentId: string) => {
      const { userId, planId } = metadata || {};
      if (!userId || !planId) {
        console.warn("No userId or planId in metadata", metadata);
        return;
      }

      const planDurationMap: Record<string, number> = {
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
        premiumPlan: planId === 'lifetime' ? 'buywise_founder_forever' : 'buywise_premium_' + planId,
        premiumSince: new Date().toISOString(),
        premiumExpiration: expirationDate.toISOString(),
      });
      console.log(\`Activated premium \${planId} for user \${userId}\`);
    };`;

const newHandle = `    const handlePremiumActivation = async (metadata: any, subscriptionId: string, paymentId: string) => {
      const { userId, planId } = metadata || {};
      if (!userId || !planId) {
        console.warn("No userId or planId in metadata", metadata);
        return;
      }

      const planDurationMap: Record<string, number> = {
        monthly: 30,
        yearly: 365,
        lifetime: 36500
      };

      const subDays = planDurationMap[planId] || 0;
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
              id: subscriptionId || paymentId || \`dodo_\${Date.now()}\`,
              user_id: userId,
              plan_id: planId,
              payment_id: paymentId,
              subscription_id: subscriptionId,
              status: 'active',
              provider: 'dodo'
            });
         } catch(e) {
            console.error("Supabase webhook update failed", e);
         }
      }

      // 2. Firebase Secondary (No rollback if this fails)
      try {
        const admin = await import('firebase-admin');
        if (admin.apps.length) {
          const dbRef = admin.firestore();
          const orderId = subscriptionId || paymentId || \`dodo_\${Date.now()}\`;
          await dbRef.collection('orders').doc(orderId).set({
            userId, planId, paymentId, subscriptionId,
            status: 'completed', provider: 'dodo', createdAt: new Date().toISOString()
          }, { merge: true });

          await dbRef.collection('users').doc(userId).set({
            premiumStatus: 'active',
            premiumPlan: planId === 'lifetime' ? 'buywise_founder_forever' : 'buywise_premium_' + planId,
            premiumSince: new Date().toISOString(),
            premiumExpiration: expirationDate.toISOString(),
          }, { merge: true });
        }
      } catch(e) {
        console.error("Firebase secondary webhook update failed", e.message);
      }

      // 3. Update memory state so the app works synchronously
      try {
         const { activateUserPremium } = await import('./src/server/gamificationDb.ts');
         activateUserPremium(userId, "unknown@buywise.in", "User", subDays, planId);
      } catch(e) {
         console.error("Memory update failed", e.message);
      }

      console.log(\`Activated premium \${planId} for user \${userId}\`);
    };`;

if (code.includes(oldHandle)) {
  code = code.replace(oldHandle, newHandle);
  fs.writeFileSync('server.ts', code, 'utf8');
  console.log("Successfully patched webhook handler");
} else {
  console.log("Could not find old handler to patch");
}
