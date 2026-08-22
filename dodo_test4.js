import DodoPayments from 'dodopayments';
try {
  delete process.env.DODO_PAYMENTS_API_KEY;
  const client = new DodoPayments("my_key", "live_mode");
  console.log("Success string args");
} catch(e) {
  console.log("Error string:", e.message);
}
