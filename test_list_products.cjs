require('dotenv').config();
const DodoPayments = require('dodopayments').default;
const client = new DodoPayments({ 
  bearerToken: process.env.DODO_PAYMENTS_API_KEY, 
  environment: process.env.DODO_PAYMENTS_ENVIRONMENT || 'test_mode' 
});
async function run() {
  try {
    const products = await client.products.list();
    console.log(JSON.stringify(products, null, 2));
  } catch(e) {
    console.error(e);
  }
}
run();
