const axios = require('axios');
const liveKey = "oifh8lpKKT4i55Oe.EZmQVh9nPJjveuRqUM4cjpoG4rMQX77zRhlERL2xKYLFrJmi";

async function fetchProducts() {
  try {
    const res = await axios.get('https://live.dodopayments.com/products', {
      headers: { 'Authorization': `Bearer ${liveKey}` }
    });
    console.log(JSON.stringify(res.data, null, 2));
  } catch(e) {
    console.error("Error:", e.response?.data || e.message);
  }
}
fetchProducts();
EOF
node dodo_live_check_final.cjs
