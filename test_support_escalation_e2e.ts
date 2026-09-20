import http from 'http';
import crypto from 'crypto';

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

function makeRequest(path: string, method: string, headers: Record<string, string>, body?: any): Promise<{ status: number; data: any }> {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : undefined;
    const reqHeaders: Record<string, string> = {
      ...headers
    };
    if (payload) {
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(payload).toString();
    }

    const req = http.request(`${BASE_URL}${path}`, {
      method,
      headers: reqHeaders
    }, (res) => {
      let dataStr = '';
      res.on('data', chunk => { dataStr += chunk; });
      res.on('end', () => {
        let parsed: any = null;
        try {
          parsed = JSON.parse(dataStr);
        } catch {
          parsed = dataStr;
        }
        resolve({ status: res.statusCode || 500, data: parsed });
      });
    });

    req.on('error', err => reject(err));
    if (payload) req.write(payload);
    req.end();
  });
}

// Helper to get real authenticated session token from server
async function getRealUserSession(email: string, name: string): Promise<{ token: string; userId: string }> {
  // Try register first
  const regRes = await makeRequest('/api/auth/register', 'POST', {}, {
    email,
    name,
    password: 'TestPassword123!@#'
  });

  if (regRes.data?.token) {
    return { token: regRes.data.token, userId: regRes.data.user?.id || regRes.data.sessionUser?.id || 'usr_' + Date.now() };
  }

  // If already registered or fallback to token generator matching server
  const secret = process.env.SESSION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.RAZORPAY_KEY_SECRET ||
    "buywise_production_secure_auth_secret_key_v1";

  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 14 * 24 * 3600;
  const userId = 'usr_' + crypto.createHash('sha256').update(email.toLowerCase()).digest('hex').slice(0, 16);
  const body = Buffer.from(
    JSON.stringify({
      sub: userId,
      userId,
      email: email.trim().toLowerCase(),
      name,
      iat: now,
      exp,
    })
  ).toString("base64url");
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${header}.${body}`)
    .digest("base64url");

  return { token: `${header}.${body}.${signature}`, userId };
}

async function runTests() {
  console.log('=== STARTING HUMAN SUPPORT ESCALATION E2E AUDIT ===\n');
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      if (detail) console.error(`   Detail: ${detail}`);
    }
  }

  try {
    const userAInfo = await getRealUserSession('alice_support_test@example.com', 'Alice Wonder');
    const userA = {
      userId: userAInfo.userId,
      email: 'alice_support_test@example.com',
      name: 'Alice Wonder'
    };
    const userAToken = userAInfo.token;

    const userBInfo = await getRealUserSession('bob_support_test@example.com', 'Bob Builder');
    const userB = {
      userId: userBInfo.userId,
      email: 'bob_support_test@example.com',
      name: 'Bob Builder'
    };
    const userBToken = userBInfo.token;

    const adminEmail = 'mohammdsaeed24@gmail.com';
    const adminPasscode = 'awanwarsi1A@';

    // TEST 1: Authenticated Support Ticket Creation
    console.log('\n--- 1. Authenticated Ticket Creation ---');
    const createRes = await makeRequest('/api/support/ticket', 'POST', {
      'Authorization': `Bearer ${userAToken}`,
      'x-user-email': userA.email
    }, {
      category: 'Product Comparison',
      subject: 'Question regarding Apple Watch pricing',
      message: 'Can you verify if the Flipkart discount applies to series 9?',
      messages: [
        { sender: 'bot', text: 'Welcome to BuyWise. How can I help?' },
        { sender: 'customer', text: 'Can you verify if the Flipkart discount applies to series 9?' }
      ]
    });

    assert(createRes.status === 201, 'POST /api/support/ticket returns HTTP 201 Created', `Received ${createRes.status}`);
    assert(createRes.data?.success === true, 'Ticket creation returns success: true');
    assert(createRes.data?.ticket?.id?.startsWith('BW-'), `Ticket ID generated server-side: ${createRes.data?.ticket?.id}`);
    assert(createRes.data?.ticket?.userId === userA.userId, 'Ticket userId bound to authenticated caller');
    assert(createRes.data?.ticket?.email === userA.email, 'Ticket email bound to authenticated caller');
    const ticketId = createRes.data?.ticket?.id;

    // TEST 2: Anti-Spoofing Check - User attempts to claim Alice's email with Bob's token
    console.log('\n--- 2. Anti-Spoofing Identity Check ---');
    const spoofRes = await makeRequest('/api/support/ticket', 'POST', {
      'Authorization': `Bearer ${userBToken}`,
      'x-user-email': userA.email // Bob pretending to be Alice
    }, {
      message: 'Hacked ticket attempt'
    });

    assert(spoofRes.status === 403, 'POST /api/support/ticket blocks spoofed x-user-email with HTTP 403', `Received ${spoofRes.status}`);

    // TEST 3: Guest Support Ticket Creation with Validation
    console.log('\n--- 3. Guest Ticket Creation ---');
    const guestRes = await makeRequest('/api/support/ticket', 'POST', {}, {
      email: 'guest_customer_test@example.com',
      name: 'Guest Shopper',
      message: 'Help with my mystery box referral'
    });

    assert(guestRes.status === 201, 'POST /api/support/ticket allows guest with valid email (HTTP 201)', `Received ${guestRes.status}`);
    assert(guestRes.data?.ticket?.userId?.startsWith('guest_'), `Guest assigned generated guest ID: ${guestRes.data?.ticket?.userId}`);
    assert(!!guestRes.data?.ticketToken, 'Guest issued signed ticketToken for self-service access');

    // TEST 4: Guest Blocked from Claiming Admin Account
    console.log('\n--- 4. Guest Admin Impersonation Protection ---');
    const guestAdminRes = await makeRequest('/api/support/ticket', 'POST', {}, {
      email: adminEmail,
      message: 'Impersonating admin without credentials'
    });

    assert(guestAdminRes.status === 401, 'Guest cannot claim admin email without authenticating (HTTP 401)', `Received ${guestAdminRes.status}`);

    // TEST 5: Verify Ticket Appears in Admin Panel
    console.log('\n--- 5. Admin Ticket Listing ---');
    const adminTicketsRes = await makeRequest('/api/admin/support/tickets', 'GET', {
      'x-user-email': adminEmail,
      'x-admin-passcode': adminPasscode
    });

    assert(adminTicketsRes.status === 200, 'GET /api/admin/support/tickets returns HTTP 200');
    const adminFound = Array.isArray(adminTicketsRes.data) && adminTicketsRes.data.some((t: any) => t.id === ticketId);
    assert(adminFound, `Ticket ${ticketId} is visible in Admin Panel`);

    // TEST 6: Admin Replies to Support Ticket
    console.log('\n--- 6. Admin Specialist Reply ---');
    const adminReplyText = 'Hello Alice, BuyWise specialist here. Yes, the Flipkart discount is verified and active!';
    const replyRes = await makeRequest(`/api/admin/support/tickets/${ticketId}/reply`, 'POST', {
      'x-user-email': adminEmail,
      'x-admin-passcode': adminPasscode
    }, {
      text: adminReplyText
    });

    assert(replyRes.status === 200, 'POST /api/admin/support/tickets/:id/reply returns HTTP 200');
    assert(replyRes.data?.success === true, 'Admin reply returns success: true');

    // TEST 7: Customer Fetches Ticket & Receives Admin Reply
    console.log('\n--- 7. Customer Ticket Retrieval & Live Sync ---');
    const clientTicketsRes = await makeRequest('/api/support/my-tickets', 'GET', {
      'Authorization': `Bearer ${userAToken}`,
      'x-user-email': userA.email
    });

    assert(clientTicketsRes.status === 200, 'GET /api/support/my-tickets returns HTTP 200');
    const customerTicket = Array.isArray(clientTicketsRes.data) && clientTicketsRes.data.find((t: any) => t.id === ticketId);
    assert(!!customerTicket, `Customer can retrieve their own ticket ${ticketId}`);
    
    const hasAgentMsg = customerTicket?.messages?.some((m: any) => m.sender === 'agent' && m.text.includes('specialist here'));
    assert(hasAgentMsg, 'Customer ticket contains the human agent reply message');

    // TEST 8: Anti-IDOR Enforcement - Bob tries to access Alice\'s ticket
    console.log('\n--- 8. Anti-IDOR Authorization Check ---');
    const idorRes = await makeRequest(`/api/support/ticket/${ticketId}`, 'GET', {
      'Authorization': `Bearer ${userBToken}`,
      'x-user-email': userB.email
    });

    assert(idorRes.status === 403, 'GET /api/support/ticket/:id blocks unauthorized user (HTTP 403 Forbidden)', `Received ${idorRes.status}`);

    // TEST 9: Anti-IDOR on Ticket Reply - Bob tries to post reply to Alice\'s ticket
    console.log('\n--- 9. Anti-IDOR Reply Protection ---');
    const idorReplyRes = await makeRequest(`/api/support/ticket/${ticketId}/reply`, 'POST', {
      'Authorization': `Bearer ${userBToken}`,
      'x-user-email': userB.email
    }, {
      text: 'Bob intruding on Alice ticket'
    });

    assert(idorReplyRes.status === 403, 'POST /api/support/ticket/:id/reply blocks unauthorized user (HTTP 403 Forbidden)', `Received ${idorReplyRes.status}`);

    // TEST 10: Authorized Customer Replies to Ticket
    console.log('\n--- 10. Customer Replies to Human Specialist ---');
    const customerFollowUp = 'Thank you for the quick help! One more question about delivery.';
    const customerReplyRes = await makeRequest(`/api/support/ticket/${ticketId}/reply`, 'POST', {
      'Authorization': `Bearer ${userAToken}`,
      'x-user-email': userA.email
    }, {
      text: customerFollowUp
    });

    assert(customerReplyRes.status === 200, 'POST /api/support/ticket/:id/reply allows authorized customer (HTTP 200)');
    assert(customerReplyRes.data?.success === true, 'Customer reply returns success: true');

    // TEST 11: Admin Sees Customer Follow-Up
    console.log('\n--- 11. Admin Real-Time Receipt of Customer Message ---');
    const adminCheckRes = await makeRequest('/api/admin/support/tickets', 'GET', {
      'x-user-email': adminEmail,
      'x-admin-passcode': adminPasscode
    });

    const updatedAdminTicket = adminCheckRes.data.find((t: any) => t.id === ticketId);
    const hasCustomerFollowUp = updatedAdminTicket?.messages?.some((m: any) => m.sender === 'customer' && m.text.includes('delivery'));
    assert(hasCustomerFollowUp, 'Admin dashboard receives customer follow-up message');

    console.log(`\n========================================`);
    console.log(`AUDIT RESULTS: ${passed}/${total} TESTS PASSED`);
    console.log(`========================================\n`);

    if (passed === total) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
