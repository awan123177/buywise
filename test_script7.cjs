const DodoPayments = require('dodopayments').default;
const dodoClient = new DodoPayments({ bearerToken: 'test_fake_key_123', environment: 'test_mode' });
async function run() {
  try {
    const session = await dodoClient.checkoutSessions.create({
      product_cart: [{ product_id: 'pdt_0NIseugD37hZhQ7eR9Igx', quantity: 1 }],
      customer: { email: 'test@example.com', name: 'Test User' },
      return_url: 'https://buywiser.store/premium/success',
      metadata: { userId: '123', planId: 'daily', source: "buywise" }
    });
  } catch (err) {
    console.error(err.status, err.error);
  }
}
run();
