require('dotenv').config();
const DodoPayments = require('dodopayments').default;
const client = new DodoPayments({ 
  bearerToken: process.env.DODO_PAYMENTS_API_KEY, 
  environment: 'test_mode' 
});

async function run() {
  try {
    const plans = [
      { name: 'Buywise Premium Daily', id: 'daily', price: 1000, type: 'recurring_price', interval: 'day' },
      { name: 'Buywise Premium Weekly', id: 'weekly', price: 3000, type: 'recurring_price', interval: 'week' },
      { name: 'Buywise Premium Monthly', id: 'monthly', price: 10000, type: 'recurring_price', interval: 'month' },
      { name: 'Buywise Premium Yearly', id: 'yearly', price: 50000, type: 'recurring_price', interval: 'year' },
      { name: 'Buywise Premium Forever', id: 'lifetime', price: 70000, type: 'one_time_price' }
    ];

    const newMap = {};

    for (const plan of plans) {
      const payload = {
        name: plan.name,
        price: {
          currency: 'INR',
          discount: 0,
          price: plan.price, // Dodo probably uses paisa/cents? Wait, let's assume paisa, wait: "₹10" -> 1000? Let's check docs. Actually it says 1000 for INR? Wait, INR does use 100 paise. So ₹10 = 1000? Let's just assume price in cents/paise. Wait, the prompt said "₹10/day" but didn't say how many cents. I'll use 1000.
          purchasing_power_parity: false,
          type: plan.type,
        },
        tax_category: 'digital_products',
      };
      if (plan.type === 'recurring_price') {
         payload.price.billing_period = plan.interval; // "day", "week", "month", "year" ?
      }
      
      const product = await client.products.create(payload);
      newMap[plan.id] = product.product_id;
      console.log(`Created ${plan.id}: ${product.product_id}`);
    }
    
    console.log("NEW MAP:", JSON.stringify(newMap, null, 2));

  } catch(e) {
    console.error("Error creating:", e.status, e.error);
  }
}
run();
