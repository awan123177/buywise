const DodoPayments = require('dodopayments').default;
const dodoClient = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY || 'test_sk_943c5b8b9dc49b7beea87f711be5521956e18f8e02d8da09d17ed6',
  environment: 'test_mode'
});
async function run() {
  try {
     const payments = await dodoClient.payments.list({ limit: 5 });
     console.log("Recent payments:", JSON.stringify(payments.items, null, 2));
  } catch(e) {
     console.error(e);
  }
}
run();
