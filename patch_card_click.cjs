const fs = require('fs');
let code = fs.readFileSync('src/components/Premium.tsx', 'utf8');

const t = `              <button 
                onClick={(e) => { 
                  e.stopPropagation();
                  setSelectedPlan(plan.id as any);
                  // setShowPayment(true);
                }}`;
const r = `              <button 
                onClick={(e) => { 
                  e.stopPropagation();
                  setSelectedPlan(plan.id as any);
                  if (typeof window !== 'undefined' && !(window as any).AndroidBillingBridge) {
                    toast.error("Premium payments are currently under development.\\nGoogle Play payment integration is being completed.\\nPremium purchases will be available soon.", { icon: '🚧', duration: 6000 });
                  }
                }}`;
code = code.replace(t, r);
fs.writeFileSync('src/components/Premium.tsx', code);
