const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldSubVerify = `        // Verify Subscription (Prepaid or Auto-Renewing)
        // @ts-ignore
        const response = await playDeveloper.purchases.subscriptions.get({
          packageName,
          subscriptionId: productId,
          token
        });
        
        const sub = response.data;
        const now = Date.now();
        const expiry = parseInt(sub.expiryTimeMillis || '0', 10);
        
        // 1 = Payment pending, 0 = Active
        if (sub.paymentState === 1) {
          return res.status(200).json({ success: true, verified: false, pending: true, message: "Purchase is pending" });
        }
        
        if (expiry > now) {
          entitlementVerified = true;
          expiryTimeMillis = expiry;
          acknowledgmentState = sub.acknowledgementState;
          
          if (acknowledgmentState === 0) {
             // Acknowledge the subscription if not already
             await playDeveloper.purchases.subscriptions.acknowledge({
                packageName,
                subscriptionId: productId,
                token
             });
          }
        } else {
          return res.status(200).json({ success: true, verified: false, message: "Subscription expired" });
        }`;

const newSubVerify = `        // Verify Subscription using subscriptionsv2
        // @ts-ignore
        const response = await playDeveloper.purchases.subscriptionsv2.get({
          packageName,
          token
        });
        
        const sub = response.data;
        const now = Date.now();
        
        if (sub.subscriptionState === 'SUBSCRIPTION_STATE_PENDING') {
          return res.status(200).json({ success: true, verified: false, pending: true, message: "Purchase is pending" });
        }
        
        let maxExpiry = 0;
        let isAcknowledged = true;
        
        if (sub.lineItems && sub.lineItems.length > 0) {
            for (const item of sub.lineItems) {
                if (item.expiryTime) {
                    const itemExpiry = new Date(item.expiryTime).getTime();
                    if (itemExpiry > maxExpiry) {
                        maxExpiry = itemExpiry;
                    }
                }
                if (item.acknowledgementState === 'ACKNOWLEDGEMENT_STATE_PENDING') {
                    isAcknowledged = false;
                }
            }
        }
        
        if (maxExpiry > now || sub.subscriptionState === 'SUBSCRIPTION_STATE_ACTIVE') {
          entitlementVerified = true;
          expiryTimeMillis = maxExpiry > now ? maxExpiry : null;
          
          if (!isAcknowledged) {
             await playDeveloper.purchases.subscriptions.acknowledge({
                packageName,
                subscriptionId: productId,
                token
             });
          }
        } else {
          return res.status(200).json({ success: true, verified: false, message: "Subscription expired" });
        }`;

if (code.includes(oldSubVerify.substring(0, 100))) {
    code = code.replace(oldSubVerify, newSubVerify);
    fs.writeFileSync('server.ts', code);
    console.log("Updated server.ts subscription verification successfully.");
} else {
    console.log("Could not find the target code in server.ts");
}
