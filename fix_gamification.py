import re

with open('server.ts', 'r') as f:
    text = f.read()

replacement = """  app.get("/api/gamification/profile", getUserContext, async (req: any, res: any) => {
    const { userId, email, name } = req.userContext;
    try {
      const profile = getOrCreateProfile(userId, email, name);
      
      const supabaseClient = getSupabaseClient();
      if (supabaseClient) {
         try {
             const { data } = await supabaseClient.from('profiles').select('premium, premium_expiry, active_plan_id, active_plan_name').eq('id', userId).single();
             if (data) {
                 const isLife = data.active_plan_id === 'lifetime' || data.active_plan_name === 'Forever Founder';
                 const expiry = data.premium_expiry ? new Date(data.premium_expiry).getTime() : 0;
                 const isValid = isLife || (!isNaN(expiry) && expiry > Date.now());
                 
                 if (data.premium && isValid) {
                     profile.isPremium = true;
                     profile.premiumExpiry = data.premium_expiry;
                     profile.activePlanId = data.active_plan_id;
                     profile.activePlanName = data.active_plan_name;
                 } else if (!isValid && profile.isPremium && !isLife) {
                     profile.isPremium = false;
                 }
             }
         } catch(e) {
             console.error("Error syncing premium from supabase:", e);
         }
      }

      const multiplier = getUserCoinMultiplier(userId);
      res.json({
        ...profile,
        multiplier
      });"""

text = re.sub(
    r'  app\.get\("/api/gamification/profile", getUserContext, \(req: any, res: any\) => \{\n    const \{ userId, email, name \} = req\.userContext;\n    try \{\n      const profile = getOrCreateProfile\(userId, email, name\);\n      const multiplier = getUserCoinMultiplier\(userId\);\n      res\.json\(\{\n        \.\.\.profile,\n        multiplier\n      \}\);',
    replacement,
    text,
    flags=re.DOTALL
)

with open('server.ts', 'w') as f:
    f.write(text)
