require('dotenv').config();
const DodoPayments = require('dodopayments').default;
const dodoClient = new DodoPayments({ bearerToken: process.env.DODO_PAYMENTS_API_KEY, environment: process.env.DODO_PAYMENTS_ENVIRONMENT || 'test_mode' });
async function run() {
  try {
    const session = await dodoClient.checkoutSessions.create({
      product_cart: [{ product_id: 'pdt_0NIseugD37hZhQ7eR9Igx', quantity: 1 }],
      customer: { email: 'test@example.com', name: 'Test User' },
      return_url: 'https://buywiser.store/premium/success',
      metadata: { userId: '123', planId: 'daily', source: "buywise" }
    });
    console.log("Success", session.checkout_url);
  } catch (err) {
    console.error("Error creating session:", err);
    console.error(JSON.stringify(err, null, 2));
  }
}
run();
