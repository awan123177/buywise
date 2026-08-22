import DodoPayments from 'dodopayments';
try {
  const client = new DodoPayments("my_key", "live_mode");
  console.log("Success with string arguments");
} catch(e) {
  console.log("Error with string arguments:", e.message);
}
try {
  const client2 = new DodoPayments({ bearerToken: "my_key", environment: "live_mode" });
  console.log("Success with object arguments");
} catch(e) {
  console.log("Error with object arguments:", e.message);
}
