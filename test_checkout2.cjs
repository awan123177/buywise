require('dotenv').config();
const DodoPayments = require('dodopayments').default;
const client = new DodoPayments({ 
  bearerToken: process.env.DODO_PAYMENTS_API_KEY, 
  environment: 'test_mode' 
});
async function run() {
  try {
    const session = await client.checkoutSessions.create({
      product_cart: [{ product_id: 'pdt_0Nlt1WLwbeEemk5UX3URr', quantity: 1 }],
      customer: { email: 'test@example.com', name: 'Test User' },
      return_url: 'https://buywiser.store/premium/success',
      metadata: { userId: '123', planId: 'daily', source: "buywise" }
    });
    console.log("SUCCESS!", session.checkout_url);
  } catch(e) {
    console.error(e.status, e.error);
  }
}
run();
