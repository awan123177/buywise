const DodoPayments = require('dodopayments').default;
const dodoClient = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY || 'test_sk_943c5b8b9dc49b7beea87f711be5521956e18f8e02d8da09d17ed6',
  environment: 'test_mode'
});
async function run() {
  try {
     const session = await dodoClient.checkoutSessions.retrieve('cks_0Nlv3T1IdxRJhmW5HKOLa');
     console.log("Session payment_status:", session.payment_status);
     console.log("Session status:", session.status);
     console.log("Session JSON:", JSON.stringify(session, null, 2));
  } catch(e) {
     console.error(e);
  }
}
run();
