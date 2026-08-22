import { createClient } from '@supabase/supabase-js';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

async function migrateData() {
  console.log("Starting migration to Supabase (Primary) and Firebase (Secondary)...");

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase credentials missing in environment variables.");
  }
  const supabase = createClient(supabaseUrl, supabaseKey);

  let firestore: any = null;
  if (process.env.FIREBASE_PRIVATE_KEY) {
    try {
      if (!((admin as any).apps || (admin as any).default?.apps)?.length) {
        const init = ((admin as any).initializeApp || (admin as any).default?.initializeApp);
        const cred = ((admin as any).credential || (admin as any).default?.credential);
        init({
          credential: cred.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          })
        });
      }
      firestore = ((admin as any).firestore || (admin as any).default?.firestore)();
      console.log("Firebase Admin initialized successfully.");
    } catch(e: any) {
      console.warn("Failed to initialize Firebase Admin:", e.message);
    }
  } else {
    console.warn("No FIREBASE_PRIVATE_KEY provided, skipping Firebase secondary sync.");
  }

  const dbPath = path.join(process.cwd(), 'data_store.json');
  if (!fs.existsSync(dbPath)) {
    console.log("No data_store.json found. Nothing to migrate.");
    return;
  }

  const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

  // 1. Migrate Profiles
  console.log(`Migrating ${Object.keys(dbData.profiles || {}).length} profiles...`);
  for (const userId of Object.keys(dbData.profiles || {})) {
    const p = dbData.profiles[userId];
    
    // Supabase
    const { error: supaErr } = await supabase.from('profiles').upsert({
      id: p.userId,
      email: p.email,
      full_name: p.name,
      buywise_coins: p.coins,
      premium: !!p.isPremium,
      premium_expiry: p.premiumExpiry || null,
      active_plan_id: p.activePlanId || null,
      active_plan_name: p.activePlanName || null,
      created_at: p.createdAt || new Date().toISOString(),
      last_login: p.lastLoginDate ? new Date(p.lastLoginDate).toISOString() : null,
      referral_code: p.referralCode || null
    }, { onConflict: 'id' });

    if (supaErr) {
      console.error(`Supabase profile upsert failed for ${p.userId}:`, supaErr.message);
    }

    // Firebase Secondary
    if (firestore) {
      try {
        await firestore.collection('users').doc(p.userId).set({
          ...p
        }, { merge: true });
      } catch (e: any) {
        console.error(`Firebase profile sync failed for ${p.userId}:`, e.message);
      }
    }
  }

  // 2. Migrate Transactions
  console.log(`Migrating ${dbData.transactions?.length || 0} transactions...`);
  for (const t of dbData.transactions || []) {
    await supabase.from('transactions').upsert({
      id: t.id,
      user_id: t.userId,
      amount: t.amount,
      type: t.type,
      source: t.source,
      description: t.description,
      created_at: t.timestamp || new Date().toISOString()
    }, { onConflict: 'id' });
  }

  console.log("Migration complete!");
}

migrateData().catch(console.error);
