import DodoPayments from 'dodopayments';
try {
  const client = new DodoPayments({ environment: 'live_mode' });
  console.log("Success with undefined bearerToken object");
} catch(e) {
  console.log("Error:", e.message);
}
