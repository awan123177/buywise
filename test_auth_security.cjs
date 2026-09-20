// test_auth_security.js
// Automated security verification suite for BuyWise authentication & admin authorization

const http = require('http');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(body);
        } catch (e) {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          rawBody: body,
          data: json
        });
      });
    });
    req.on('error', reject);
    if (data) {
      if (typeof data === 'string') {
        req.write(data);
      } else {
        req.write(JSON.stringify(data));
      }
    }
    req.end();
  });
}

async function runTests() {
  console.log("==================================================");
  console.log("STARTING BUYWISE AUTHENTICATION & ADMIN SECURITY AUDIT");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  // TEST 1: Unauthenticated request to protected admin endpoint
  {
    console.log("[1] Testing unauthenticated access to /api/admin/stats...");
    const res = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/stats',
      method: 'GET'
    });
    assert(res.statusCode === 403, `Expected 403 Forbidden, got ${res.statusCode}`);
  }

  // TEST 2: Normal customer login returns secure token and HttpOnly cookie
  let customerToken = '';
  let customerCookie = '';
  {
    console.log("\n[2] Testing customer login via /api/auth/login...");
    const res = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'customer_alice@example.com', password: 'password123' });

    assert(res.statusCode === 200, `Expected 200 OK, got ${res.statusCode}`);
    assert(res.data && res.data.success && res.data.token, "Login returned success and token");
    customerToken = res.data.token;

    const setCookie = res.headers['set-cookie'];
    assert(Array.isArray(setCookie) && setCookie.length > 0, "Set-Cookie header present");
    customerCookie = setCookie ? setCookie[0] : '';
    assert(customerCookie.includes('buywise_session='), "Cookie name is buywise_session");
    assert(customerCookie.toLowerCase().includes('httponly'), "Cookie enforces HttpOnly");
    assert(customerCookie.toLowerCase().includes('samesite=lax'), "Cookie enforces SameSite=Lax");
  }

  // TEST 3: Normal customer attempting to access admin route using customer token
  {
    console.log("\n[3] Testing customer token accessing /api/admin/stats...");
    const res = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/stats',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${customerToken}`
      }
    });
    assert(res.statusCode === 403, `Expected 403 Forbidden for non-admin token, got ${res.statusCode}`);
  }

  // TEST 4: Normal customer attempting to elevate privilege by spoofing headers
  {
    console.log("\n[4] Testing privilege escalation attack (spoofing x-admin-email, x-admin-passcode, role)...");
    const res = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/stats',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${customerToken}`,
        'x-admin-email': 'mohammdsaeed24@gmail.com',
        'x-admin-passcode': 'fake_passcode_123',
        'x-user-id': 'admin',
        'x-user-email': 'mohammdsaeed24@gmail.com',
        'role': 'admin'
      }
    });
    assert(res.statusCode === 403, `Expected 403 Forbidden for spoofed headers, got ${res.statusCode}`);
  }

  // TEST 5: Forged/Tampered token attack
  {
    console.log("\n[5] Testing forged JWT signature attack...");
    // Split customer token and change payload
    const parts = customerToken.split('.');
    let forgedToken = '';
    if (parts.length === 3) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
      payload.role = 'admin';
      payload.isAdmin = true;
      payload.email = 'mohammdsaeed24@gmail.com';
      const forgedPayload = Buffer.from(JSON.stringify(payload)).toString('base64').replace(/=/g, '');
      forgedToken = `${parts[0]}.${forgedPayload}.${parts[2]}`; // Tampered with old signature
    } else {
      forgedToken = customerToken + "tampered";
    }

    const res = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/stats',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${forgedToken}`
      }
    });
    assert(res.statusCode === 403, `Expected 403 Forbidden for forged signature, got ${res.statusCode}`);
  }

  // TEST 6: Unauthorized Admin Login Attempt (Invalid passcode)
  {
    console.log("\n[6] Testing /api/admin/login with invalid credentials...");
    const res = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'mohammdsaeed24@gmail.com', passcode: 'wrong_password' });

    assert(res.statusCode === 401, `Expected 401 Unauthorized for bad admin credentials, got ${res.statusCode}`);
  }

  // TEST 7: Legitimate Admin Login via server-side /api/admin/login
  let adminToken = '';
  let adminCookie = '';
  {
    console.log("\n[7] Testing legitimate admin login via /api/admin/login...");
    const res = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'mohammdsaeed24@gmail.com', passcode: 'awanwarsi1A@' });

    assert(res.statusCode === 200, `Expected 200 OK for admin login, got ${res.statusCode}`);
    assert(res.data && res.data.success && res.data.token, "Admin login returned token");
    adminToken = res.data.token;

    const setCookie = res.headers['set-cookie'];
    assert(Array.isArray(setCookie) && setCookie.length > 0, "Admin Set-Cookie header present");
    adminCookie = setCookie ? setCookie[0] : '';
    assert(adminCookie.includes('buywise_admin_session='), "Cookie name is buywise_admin_session");
    assert(adminCookie.toLowerCase().includes('httponly'), "Admin cookie enforces HttpOnly");
    assert(adminCookie.toLowerCase().includes('samesite=lax'), "Admin cookie enforces SameSite=Lax");
  }

  // TEST 8: Admin Verify endpoint /api/admin/verify
  {
    console.log("\n[8] Testing /api/admin/verify with valid admin session...");
    const res = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/verify',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    assert(res.statusCode === 200, `Expected 200 OK on admin verify, got ${res.statusCode}`);
    assert(res.data && res.data.success && res.data.admin && res.data.admin.email === 'mohammdsaeed24@gmail.com', "Admin verify returned correct identity");
  }

  // TEST 9: Admin accessing protected admin endpoints (/api/admin/stats, /api/admin/support/tickets)
  {
    console.log("\n[9] Testing authorized access to /api/admin/stats & support tickets...");
    const resStats = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/stats',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    assert(resStats.statusCode === 200, `Expected 200 OK on /api/admin/stats, got ${resStats.statusCode}`);

    const resTickets = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/support/tickets',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    assert(resTickets.statusCode === 200, `Expected 200 OK on /api/admin/support/tickets, got ${resTickets.statusCode}`);
  }

  // TEST 10: Admin Logout and Token Revocation
  {
    console.log("\n[10] Testing Admin Logout and Token Revocation...");
    const resLogout = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/logout',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    assert(resLogout.statusCode === 200, `Expected 200 OK on /api/admin/logout, got ${resLogout.statusCode}`);

    // Try using the revoked admin token
    const resAfter = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/stats',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    assert(resAfter.statusCode === 403, `Expected 403 Forbidden after admin token revoked, got ${resAfter.statusCode}`);
  }

  // TEST 11: Customer Logout and Token Revocation
  {
    console.log("\n[11] Testing Customer Logout and Token Revocation...");
    const resLogout = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/logout',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${customerToken}`
      }
    });
    assert(resLogout.statusCode === 200, `Expected 200 OK on /api/auth/logout, got ${resLogout.statusCode}`);

    // Verify revoked customer token cannot call protected user endpoint
    const resAfter = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/gamification/premium-daily/claim',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${customerToken}`,
        'Content-Type': 'application/json'
      }
    });
    assert(resAfter.statusCode === 401, `Expected 401 Unauthorized after customer token revoked, got ${resAfter.statusCode}`);
  }

  // TEST 12: Anti-IDOR & Identity Spoofing Protection on Support Tickets
  {
    console.log("\n[12] Testing Anti-IDOR and Identity Spoofing Protection...");
    // Login as user Bob
    const resBob = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'bob@example.com', password: 'password123' });

    const bobToken = resBob.data.token;

    // Bob tries to spoof x-user-email as Alice
    const resSpoof = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/support/my-tickets',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${bobToken}`,
        'x-user-email': 'alice@example.com'
      }
    });
    assert(resSpoof.statusCode === 403, `Expected 403 Forbidden when spoofing x-user-email header, got ${resSpoof.statusCode}`);
  }

  console.log("\n==================================================");
  console.log(`AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error("Test execution error:", err);
  process.exit(1);
});
