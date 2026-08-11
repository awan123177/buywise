const fs = require('fs');
let code = fs.readFileSync('src/components/RewardsHub.tsx', 'utf8');

const spinToWinSectionEnd = `              <div className="space-y-6">
`;

const couponsSection = `
                {/* Generated Coupons */}
                <div className="bg-[#1C1917]/85 backdrop-blur-xl p-8 rounded-3xl border border-[#EF4444]/15 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-black text-white uppercase tracking-tight">Your Coupons</h3>
                      <p className="text-xs text-white/50">Redeem coins for Premium discount codes</p>
                    </div>
                    <button 
                      onClick={handleRedeemCoupon}
                      className="px-4 py-2 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors border border-yellow-500/20 flex items-center gap-2"
                    >
                      <Ticket size={14} />
                      Redeem 1000 Coins
                    </button>
                  </div>
                  
                  {coupons.length === 0 ? (
                    <div className="text-center py-8 text-white/30 text-xs uppercase tracking-widest font-bold">
                      No coupons generated yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {coupons.map((coupon, idx) => (
                        <div key={idx} className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex items-center justify-between">
                          <div>
                            <div className="text-sm font-bold text-white font-mono">{coupon.code}</div>
                            <div className="text-[10px] text-white/40 uppercase tracking-wider mt-1">Generated: {new Date(coupon.createdAt).toLocaleDateString()}</div>
                          </div>
                          <div className="bg-red-500/10 text-red-500 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">
                            Valid
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
`;

if (!code.includes('Your Coupons')) {
    code = code.replace(spinToWinSectionEnd, spinToWinSectionEnd + couponsSection);
    fs.writeFileSync('src/components/RewardsHub.tsx', code);
    console.log("Coupons UI injected");
}
