const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Fix req.userEmail to req.userContext.email
code = code.replace(/let email = req\.userEmail \|\| "user_" \+ userId \+ "@example\.com";/, 
`let email = req.userContext?.email || "user_" + userId + "@example.com";`);

code = code.replace(/let name = "BuyWise User";/, 
`let name = req.userContext?.name || "BuyWise User";`);

// Save session info
const sessionCreationRegex = /const session = await dodoClient\.checkoutSessions\.create\([\s\S]*?\}\);/g;
const match = code.match(sessionCreationRegex);
if (match) {
  const replacement = match[0] + `\n
    // Optional: save to local db to track initiated sessions
    const { db } = await import('./src/lib/firebase.js');
    const { doc, setDoc } = await import('firebase/firestore');
    await setDoc(doc(db, 'orders', session.session_id), {
      userId,
      planId,
      productId,
      status: 'initiated',
      provider: 'dodo',
      createdAt: new Date().toISOString()
    }, { merge: true });`;
  code = code.replace(sessionCreationRegex, replacement);
}

// Make webhook idempotent
const webhookStartRegex = /const { db } = await import\('\.\/src\/lib\/firebase\.js'\);\n    const { doc, updateDoc, setDoc } = await import\('firebase\/firestore'\);\n/g;
const webhookStartMatch = code.match(webhookStartRegex);

if (webhookStartMatch) {
  const idempotentReplacement = `const { db } = await import('./src/lib/firebase.js');
    const { doc, updateDoc, setDoc, getDoc } = await import('firebase/firestore');

    // Idempotency check
    const eventId = event.webhook_event_id || event.event_id || \`dodo_\${Date.now()}\`;
    const eventRef = doc(db, 'webhook_events', eventId);
    const eventSnap = await getDoc(eventRef);
    if (eventSnap.exists()) {
       console.log("Event already processed:", eventId);
       return res.json({ received: true, cached: true });
    }
    await setDoc(eventRef, {
       type: event.type,
       processedAt: new Date().toISOString()
    });
`;
  code = code.replace(webhookStartRegex, idempotentReplacement);
}

fs.writeFileSync('server.ts', code, 'utf8');
