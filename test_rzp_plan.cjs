const Razorpay = require("razorpay");
const rzp = new Razorpay({ key_id: "rzp_live_TbyVDY5G9vydHU", key_secret: "i9ikPzegcMDaiaxqj16yl1nQ" });
rzp.plans.fetch("plan_TbmNWzRVUXZQt0").then(console.log).catch(console.error);
