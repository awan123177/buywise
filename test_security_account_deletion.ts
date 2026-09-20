import axios from "axios";

const BASE_URL = "http://localhost:3000/api";

async function runSecurityTests() {
  console.log("================================================================");
  console.log("🔒 RUNNING BUYWISE SECURITY AUDIT: ACCOUNT DELETION & AUTH TESTS");
  console.log("================================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} ${detail ? `(${detail})` : ""}`);
      failed++;
    }
  }

  // -------------------------------------------------------------
  // Test 1: Deletion with NO token but forged x-user-id & x-user-email
  // -------------------------------------------------------------
  try {
    const res = await axios.post(
      `${BASE_URL}/account/delete`,
      {},
      {
        headers: {
          "x-user-id": "victim_user_123",
          "x-user-email": "victim@example.com",
        },
        validateStatus: () => true,
      }
    );
    assert(
      res.status === 401,
      "Test 1: Unauthenticated request with forged headers must return 401 Unauthorized",
      `Received status ${res.status}: ${JSON.stringify(res.data)}`
    );
  } catch (e: any) {
    assert(false, "Test 1: Unauthenticated request threw error", e.message);
  }

  // -------------------------------------------------------------
  // Test 2: Deletion with invalid / garbage Bearer token
  // -------------------------------------------------------------
  try {
    const res = await axios.post(
      `${BASE_URL}/account/delete`,
      {},
      {
        headers: {
          Authorization: "Bearer invalid_garbage_token_12345",
          "x-user-id": "victim_user_123",
        },
        validateStatus: () => true,
      }
    );
    assert(
      res.status === 401,
      "Test 2: Request with forged/invalid token must return 401 Unauthorized",
      `Received status ${res.status}: ${JSON.stringify(res.data)}`
    );
  } catch (e: any) {
    assert(false, "Test 2: Request with invalid token threw error", e.message);
  }

  // -------------------------------------------------------------
  // Test 3: Log in as User Alice to obtain real server-signed token
  // -------------------------------------------------------------
  let aliceToken = "";
  let aliceUserId = "";
  try {
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: "alice_audit_test@buywiser.store",
      password: "TestPassword123!",
    });
    assert(
      loginRes.status === 200 && loginRes.data.token,
      "Test 3: Alice acquires server-signed token via /api/auth/login"
    );
    aliceToken = loginRes.data.token;
    aliceUserId = loginRes.data.user.id;
  } catch (e: any) {
    assert(false, "Test 3: Alice login failed", e.message);
  }

  // -------------------------------------------------------------
  // Test 4: Alice attempts deletion with her token, but spoofed x-user-id header
  // -------------------------------------------------------------
  try {
    const res = await axios.post(
      `${BASE_URL}/account/delete`,
      {},
      {
        headers: {
          Authorization: `Bearer ${aliceToken}`,
          "x-user-id": "bob_victim_id_999", // Spoofed ID
        },
        validateStatus: () => true,
      }
    );
    assert(
      res.status === 403,
      "Test 4: Alice attempting deletion with spoofed x-user-id must be rejected with 403 Forbidden",
      `Received status ${res.status}: ${JSON.stringify(res.data)}`
    );
  } catch (e: any) {
    assert(false, "Test 4: Spoofed x-user-id threw error", e.message);
  }

  // -------------------------------------------------------------
  // Test 5: Alice attempts deletion with her token, but spoofed x-user-email header
  // -------------------------------------------------------------
  try {
    const res = await axios.post(
      `${BASE_URL}/account/delete`,
      {},
      {
        headers: {
          Authorization: `Bearer ${aliceToken}`,
          "x-user-email": "bob_victim@example.com", // Spoofed Email
        },
        validateStatus: () => true,
      }
    );
    assert(
      res.status === 403,
      "Test 5: Alice attempting deletion with spoofed x-user-email must be rejected with 403 Forbidden",
      `Received status ${res.status}: ${JSON.stringify(res.data)}`
    );
  } catch (e: any) {
    assert(false, "Test 5: Spoofed x-user-email threw error", e.message);
  }

  // -------------------------------------------------------------
  // Test 6: Gamification profile delete endpoint with forged headers
  // -------------------------------------------------------------
  try {
    const res = await axios.post(
      `${BASE_URL}/gamification/profile/delete`,
      {},
      {
        headers: {
          "x-user-id": "victim_target_user",
          "x-user-email": "victim_target@example.com",
        },
        validateStatus: () => true,
      }
    );
    assert(
      res.status === 401,
      "Test 6: /api/gamification/profile/delete with forged headers must return 401 Unauthorized",
      `Received status ${res.status}: ${JSON.stringify(res.data)}`
    );
  } catch (e: any) {
    assert(false, "Test 6: Profile delete threw error", e.message);
  }

  // -------------------------------------------------------------
  // Test 7: Support tickets endpoint with forged headers
  // -------------------------------------------------------------
  try {
    const res = await axios.get(`${BASE_URL}/support/my-tickets`, {
      headers: {
        "x-user-email": "victim_user@example.com", // Spoofed without token
      },
      validateStatus: () => true,
    });
    assert(
      res.status === 401,
      "Test 7: /api/support/my-tickets without server-trusted token must return 401 Unauthorized",
      `Received status ${res.status}: ${JSON.stringify(res.data)}`
    );
  } catch (e: any) {
    assert(false, "Test 7: Support tickets check threw error", e.message);
  }

  // -------------------------------------------------------------
  // Test 8: Support tickets endpoint with Alice's token and spoofed Bob email
  // -------------------------------------------------------------
  try {
    const res = await axios.get(`${BASE_URL}/support/my-tickets`, {
      headers: {
        Authorization: `Bearer ${aliceToken}`,
        "x-user-email": "bob_victim@example.com",
      },
      validateStatus: () => true,
    });
    assert(
      res.status === 403,
      "Test 8: /api/support/my-tickets with spoofed email header must return 403 Forbidden",
      `Received status ${res.status}: ${JSON.stringify(res.data)}`
    );
  } catch (e: any) {
    assert(false, "Test 8: Support tickets spoof check threw error", e.message);
  }

  // -------------------------------------------------------------
  // Test 9: Create support ticket for Bob, then Alice attempts to reply to Bob's ticket
  // -------------------------------------------------------------
  let bobTicketId = "tkt_test_" + Date.now();
  try {
    await axios.post(`${BASE_URL}/support/ticket`, {
      id: bobTicketId,
      name: "Bob Victim",
      email: "bob_support_test@example.com",
      subject: "Bob's Private Issue",
      message: "Confidential customer details",
    });

    // Alice attempts to reply to Bob's ticket using Alice's valid token
    const replyRes = await axios.post(
      `${BASE_URL}/support/ticket/${bobTicketId}/reply`,
      { text: "Alice maliciously replying" },
      {
        headers: {
          Authorization: `Bearer ${aliceToken}`,
        },
        validateStatus: () => true,
      }
    );
    assert(
      replyRes.status === 403,
      "Test 9: Alice cannot reply to Bob's ticket (Anti-IDOR enforcement returns 403)",
      `Received status ${replyRes.status}: ${JSON.stringify(replyRes.data)}`
    );
  } catch (e: any) {
    assert(false, "Test 9: Cross-user ticket reply check threw error", e.message);
  }

  // -------------------------------------------------------------
  // Test 10: Legitimate authenticated deletion with Alice's valid token
  // -------------------------------------------------------------
  try {
    const res = await axios.post(
      `${BASE_URL}/account/delete`,
      {},
      {
        headers: {
          Authorization: `Bearer ${aliceToken}`,
        },
        validateStatus: () => true,
      }
    );
    assert(
      res.status === 200 && res.data.success === true,
      "Test 10: Legitimate authenticated deletion with Alice's valid token succeeds",
      `Received: ${JSON.stringify(res.data)}`
    );
  } catch (e: any) {
    assert(false, "Test 10: Legitimate deletion threw error", e.message);
  }

  // -------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------
  console.log("================================================================");
  console.log(`AUDIT TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("================================================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runSecurityTests();
