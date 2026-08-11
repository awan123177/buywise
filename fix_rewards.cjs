const fs = require('fs');
let code = fs.readFileSync('src/components/RewardsHub.tsx', 'utf8');

const anchor = 'const refreshProfileAndCoupons = async () => {';
const redeemFunction = `
  const handleRedeemCoupon = async () => {
    if (coins < 1000) {
      toast.error("You need 1000 coins to generate a coupon.");
      return;
    }
    const toastId = toast.loading("Generating coupon...");
    try {
      const res = await api.post("/gamification/redeem-coupon", {});
      if (res.success && res.coupon) {
         toast.success("Coupon generated successfully!");
         refreshProfileAndCoupons();
      } else {
         toast.error(res.error || "Failed to generate coupon");
      }
    } catch(e) {
      toast.error("Failed to generate coupon");
    } finally {
      toast.dismiss(toastId);
    }
  };
`;

if (!code.includes('handleRedeemCoupon')) {
    code = code.replace(anchor, redeemFunction + '\n  ' + anchor);
    fs.writeFileSync('src/components/RewardsHub.tsx', code);
    console.log("Added handleRedeemCoupon");
}
