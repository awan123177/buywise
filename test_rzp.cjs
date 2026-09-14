const Razorpay = require("razorpay");
const rzp = new Razorpay({ key_id: "rzp_live_TbyVDY5G9vydHU", key_secret: "i9ikPzegcMDaiaxqj16yl1nQ" });
rzp.subscriptions.fetch("sub_TbymcvAqrhqA8u").then(console.log).catch(console.error);
