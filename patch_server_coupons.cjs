const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const endpoints = `
  // --- COUPON SYSTEM ---
  
  app.get("/api/gamification/coupons", getUserContext, (req: any, res: any) => {
    try {
      const db = require('./src/server/gamificationDb.ts');
      const coupons = db.getUserCoupons(req.user.uid);
      res.json({ success: true, coupons });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post("/api/gamification/coupons/validate", getUserContext, (req: any, res: any) => {
    try {
      const { code, planId } = req.body;
      const db = require('./src/server/gamificationDb.ts');
      const result = db.validateCoupon(req.user.uid, code, planId);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ valid: false, error: e.message });
    }
  });

  app.post("/api/gamification/coupons/redeem", getUserContext, (req: any, res: any) => {
    try {
      const { code, planId } = req.body;
      const db = require('./src/server/gamificationDb.ts');
      const result = db.redeemCoupon(req.user.uid, code, planId);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.get("/api/gamification/admin/coupons", adminAuth, (req: any, res: any) => {
    try {
      const db = require('./src/server/gamificationDb.ts');
      res.json({ success: true, coupons: db.getAllCoupons() });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post("/api/gamification/admin/coupons/update", adminAuth, (req: any, res: any) => {
    try {
      const { couponId, updates } = req.body;
      const db = require('./src/server/gamificationDb.ts');
      const result = db.updateCouponSettings(couponId, updates);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post("/api/gamification/admin/coupons/generate", adminAuth, (req: any, res: any) => {
    try {
      const { userId, discountPercent } = req.body;
      const db = require('./src/server/gamificationDb.ts');
      const coupon = db.generateCouponForUser(userId, discountPercent || 10);
      res.json({ success: true, coupon });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

`;

code = code.replace(
  /  \/\/ --- HUMAN SUPPORT SYSTEM ---/g,
  endpoints + '  // --- HUMAN SUPPORT SYSTEM ---'
);

fs.writeFileSync('server.ts', code);
