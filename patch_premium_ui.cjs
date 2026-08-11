const fs = require('fs');
let code = fs.readFileSync('src/components/Premium.tsx', 'utf8');

const t1 = `    if ((window as any).AndroidBillingBridge) {
      (window as any).AndroidBillingBridge.startPurchase(productId);
    } else {
      toast.error("Premium purchases are available through the Buywise Android app.");
    }`;
const r1 = `    if (typeof window !== 'undefined' && (window as any).AndroidBillingBridge) {
      (window as any).AndroidBillingBridge.startPurchase(productId);
    } else {
      toast.error("Premium payments are currently under development.\\nGoogle Play payment integration is being completed.\\nPremium purchases will be available soon.", { icon: '🚧', duration: 6000 });
    }`;

const t2 = `              <button 
                onClick={(e) => { 
                  e.stopPropagation();
                  setSelectedPlan(plan.id as any);
                  // setShowPayment(true);
                }}
                className={\`w-full py-3.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-xl relative z-10 overflow-hidden group \${
                  selectedPlan === plan.id 
                    ? plan.id === 'lifetime' 
                      ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-black shadow-lg shadow-yellow-500/20'
                      : 'bg-gradient-to-r from-red-600 to-[#FF3B30] text-white shadow-lg shadow-red-500/20'
                    : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                }\`}
              >
                <span className="relative z-10">Select Plan</span>`;
const r2 = `              <button 
                onClick={(e) => { 
                  e.stopPropagation();
                  setSelectedPlan(plan.id as any);
                  if (typeof window !== 'undefined' && !(window as any).AndroidBillingBridge) {
                    toast.error("Premium payments are currently under development.\\nGoogle Play payment integration is being completed.\\nPremium purchases will be available soon.", { icon: '🚧', duration: 6000 });
                  }
                }}
                className={\`w-full py-3.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-xl relative z-10 overflow-hidden group \${
                  selectedPlan === plan.id 
                    ? plan.id === 'lifetime' 
                      ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-black shadow-lg shadow-yellow-500/20'
                      : 'bg-gradient-to-r from-red-600 to-[#FF3B30] text-white shadow-lg shadow-red-500/20'
                    : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                }\`}
              >
                <span className="relative z-10">{typeof window !== 'undefined' && (window as any).AndroidBillingBridge ? "Select Plan" : "COMING SOON"}</span>`;

const t3 = `        <div className="max-w-2xl mx-auto w-full pt-8">
          <button
            onClick={handlePurchase}
            className="w-full py-4 bg-gradient-to-r from-red-600 to-[#FF3B30] text-white text-xs font-black uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-red-500/20 hover:scale-[1.02] transition-transform"
          >
             Proceed to Purchase via Google Play
          </button>
        </div>`;
const r3 = `        <div className="max-w-2xl mx-auto w-full pt-8">
          <button
            onClick={handlePurchase}
            className="w-full py-4 bg-gradient-to-r from-red-600 to-[#FF3B30] text-white text-xs font-black uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-red-500/20 hover:scale-[1.02] transition-transform flex flex-col items-center justify-center gap-1"
          >
             <span>{typeof window !== 'undefined' && (window as any).AndroidBillingBridge ? "Proceed to Purchase via Google Play" : "PREMIUM PAYMENTS COMING SOON"}</span>
             {typeof window !== 'undefined' && !(window as any).AndroidBillingBridge && (
               <span className="text-[9px] text-white/70 normal-case tracking-normal font-medium mt-1">Google Play Billing integration is currently being completed.</span>
             )}
          </button>
        </div>`;

code = code.replace(t1, r1);
code = code.replace(t2, r2);
code = code.replace(t3, r3);

fs.writeFileSync('src/components/Premium.tsx', code);
console.log("Patched Premium.tsx");
