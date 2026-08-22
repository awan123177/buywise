import DodoPayments from 'dodopayments';
try {
  const client = new DodoPayments(undefined, "live_mode");
  console.log("Success with undefined string");
} catch(e) {
  console.log("Error with undefined string:", e.message);
}
