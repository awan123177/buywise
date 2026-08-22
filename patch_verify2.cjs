const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const anchor = 'app.post(\'/api/payments/dodo/checkout\'';
const pos = code.indexOf(anchor);
if (pos !== -1) {
  const insertCode = `
  app.post("/api/gamification/premium/verify-test", getUserContext, async (req: any, res: any) => {
    const { userId } = req.userContext;
    try {
      const storePath = path.join(process.cwd(), "data_store.json");
      if (!fs.existsSync(storePath)) return res.json({ success: false, reason: "No data store" });
      const raw = JSON.parse(fs.readFileSync(storePath, "utf-8"));
      const pending = raw.pendingCheckouts?.[userId];
      
      if (!pending) {
         return res.json({ success: false, reason: "No pending checkout found." });
      }

      const sessionStatus = await dodoClient.checkoutSessions.retrieve(pending.sessionId);
      
      if (sessionStatus.payment_status === "succeeded" || sessionStatus.payment_status === "complete") {
         const planId = pending.planId;
         const planDurationMap: Record<string, number> = {
           monthly: 30,
           yearly: 365,
           lifetime: 36500
         };
         const subDays = planDurationMap[planId] || 0;
         const expirationDate = new Date(Date.now() + subDays * 24 * 60 * 60 * 1000);

         const supabaseClient = getSupabaseClient();
         if (supabaseClient) {
            await supabaseClient.from('profiles').update({
              premium: true,
              premium_expiry: expirationDate.toISOString(),
              active_plan_id: planId,
              active_plan_name: planId === 'lifetime' ? 'buywise_founder_forever' : 'buywise_premium_' + planId
            }).eq('id', userId);
         }
         
         const profile = getOrCreateProfile(userId, "", "");
         profile.isPremium = true;
         profile.premiumExpiry = expirationDate.toISOString();
         profile.activePlanId = planId;
         
         delete raw.pendingCheckouts[userId];
         fs.writeFileSync(storePath, JSON.stringify(raw, null, 2));

         return res.json({ success: true, verified: true });
      }
      return res.json({ success: true, verified: false, status: sessionStatus.payment_status });
    } catch(e) {
      console.error("Manual test verify error:", e);
      return res.status(500).json({ error: "Verification failed." });
    }
  });

  `;
  code = code.substring(0, pos) + insertCode + code.substring(pos);
  fs.writeFileSync('server.ts', code);
  console.log("Inserted!");
} else {
  console.log("Anchor not found");
}
