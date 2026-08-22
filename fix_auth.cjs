const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Insert google auth endpoint
const newRoute = `
app.post('/api/auth/google', async (req: any, res: any) => {
  try {
    const { token, email: clientEmail, name: clientName, uid: clientUid, photo: clientPhoto } = req.body;
    let email = clientEmail;
    let name = clientName;
    let picture = clientPhoto;
    let uid = clientUid;

    let adminApp;
    try {
      const admin = await import('firebase-admin');
      if (process.env.FIREBASE_PRIVATE_KEY) {
        if (!admin.apps.length) {
          admin.initializeApp({
            credential: admin.credential.cert({
              projectId: process.env.FIREBASE_PROJECT_ID,
              clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
              privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\\\n/g, '\\n'),
            })
          });
        }
        const decodedToken = await admin.auth().verifyIdToken(token);
        email = decodedToken.email || email;
        name = decodedToken.name || name;
        picture = decodedToken.picture || picture;
        uid = decodedToken.uid || uid;
      }
    } catch(e) {
      console.warn("Firebase admin verification skipped or failed", e.message);
    }

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // 1. Stable internal ID by email
    const { getOrCreateProfile } = await import('./src/server/gamificationDb.ts');
    
    // Check Supabase
    let buywiseUserId = uid; // default to firebase uid if no supabase
    const supabaseClient = getSupabaseClient();
    if (supabaseClient) {
      const { data: existingProfiles } = await supabaseClient.from('profiles').select('*').eq('email', email);
      if (existingProfiles && existingProfiles.length > 0) {
         buywiseUserId = existingProfiles[0].id;
      } else {
         // Create stable ID if new
         buywiseUserId = 'bw_' + crypto.randomUUID().replace(/-/g, '');
      }
    }

    // 2. Memory Check (Prevent duplicates by email)
    const profile = getOrCreateProfile(buywiseUserId, email, name);
    buywiseUserId = profile.userId; // Lock to existing in-memory ID if it existed

    // 3. Supabase Authoritative
    if (supabaseClient) {
      const profileData = {
        id: buywiseUserId,
        email: email,
        full_name: name,
        avatar_url: picture,
        google_provider_id: uid,
        last_login: new Date().toISOString()
      };
      await supabaseClient.from('profiles').upsert(profileData);
    }

    // 4. Firebase Secondary
    try {
      const admin = await import('firebase-admin');
      if (admin.apps.length) {
         await admin.firestore().collection('users').doc(buywiseUserId).set({
           email,
           full_name: name,
           avatar_url: picture,
           google_provider_id: uid,
           last_login: new Date().toISOString()
         }, { merge: true });
      }
    } catch(e) {
      console.error("Firebase secondary sync failed:", e.message);
    }

    res.json({
      success: true,
      sessionUser: {
        id: buywiseUserId,
        email,
        displayName: name,
        user_metadata: { full_name: name, avatar_url: picture }
      },
      token: "session_token_" + buywiseUserId
    });
  } catch (error: any) {
    console.error("Auth google error", error);
    res.status(401).json({ error: "Unauthorized" });
  }
});
`;

if (!code.includes("app.post('/api/auth/google'")) {
  code = code.replace("app.post('/api/webhooks/dodo'", newRoute + "\n\n  app.post('/api/webhooks/dodo'");
}

fs.writeFileSync('server.ts', code, 'utf8');
