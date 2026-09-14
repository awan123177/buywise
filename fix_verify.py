import re

with open('server.ts', 'r') as f:
    text = f.read()

replacement = """    const razorpay = getRazorpayInstance();
    const paymentInfo = await razorpay.payments.fetch(razorpay_payment_id);
    
    if (paymentInfo.status !== 'captured' && paymentInfo.status !== 'authorized') {
      return res.json({ verified: false, status: paymentInfo.status });
    }

    let verifiedPlanId = 'monthly';
    
    if (razorpay_order_id) {
       if (paymentInfo.amount !== 70000) {
           return res.status(400).json({ error: "Invalid payment amount for Founder plan." });
       }
       verifiedPlanId = 'lifetime';
    } else if (razorpay_subscription_id) {
       const subInfo = await razorpay.subscriptions.fetch(razorpay_subscription_id);
       if (subInfo.plan_id === 'plan_TbmPgmNfCSSWfk') {
           verifiedPlanId = 'yearly';
       } else if (subInfo.plan_id === 'plan_TbmNWzRVUXZQt0') {
           verifiedPlanId = 'monthly';
       } else {
           return res.status(400).json({ error: "Unrecognized Razorpay plan ID." });
       }
    } else {
       return res.status(400).json({ error: "Missing order or subscription ID." });
    }

    const referenceId = razorpay_subscription_id || razorpay_order_id || razorpay_payment_id;"""

text = re.sub(
    r"    const razorpay = getRazorpayInstance\(\);\n    const paymentInfo = await razorpay.payments.fetch\(razorpay_payment_id\);.*?const referenceId = razorpay_subscription_id \|\| razorpay_order_id \|\| razorpay_payment_id;",
    replacement,
    text,
    flags=re.DOTALL
)

with open('server.ts', 'w') as f:
    f.write(text)
