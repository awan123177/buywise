import re

with open('server.ts', 'r') as f:
    text = f.read()

replacement = """    let verifiedPlanId = 'monthly';
    
    if (razorpay_order_id) {
       if (paymentInfo.amount !== 70000) {
           return res.status(400).json({ error: "Invalid payment amount for Founder plan." });
       }
       const orderInfo = await razorpay.orders.fetch(razorpay_order_id);
       if (orderInfo.notes?.userId !== userId && paymentInfo.notes?.userId !== userId) {
           return res.status(403).json({ error: "Payment ownership mismatch." });
       }
       verifiedPlanId = 'lifetime';
    } else if (razorpay_subscription_id) {
       const subInfo = await razorpay.subscriptions.fetch(razorpay_subscription_id);
       if (subInfo.notes?.userId !== userId && paymentInfo.notes?.userId !== userId) {
           return res.status(403).json({ error: "Subscription ownership mismatch." });
       }
       if (subInfo.plan_id === 'plan_TbmPgmNfCSSWfk') {
           verifiedPlanId = 'yearly';
       } else if (subInfo.plan_id === 'plan_TbmNWzRVUXZQt0') {
           verifiedPlanId = 'monthly';
       } else {
           return res.status(400).json({ error: "Unrecognized Razorpay plan ID." });
       }
    } else {
       return res.status(400).json({ error: "Missing order or subscription ID." });
    }"""

text = re.sub(
    r"    let verifiedPlanId = 'monthly';.*?    } else \{\n       return res\.status\(400\)\.json\(\{ error: \"Missing order or subscription ID\.\" \}\);\n    \}",
    replacement,
    text,
    flags=re.DOTALL
)

with open('server.ts', 'w') as f:
    f.write(text)
