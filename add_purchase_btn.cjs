const fs = require('fs');
let code = fs.readFileSync('src/components/Premium.tsx', 'utf8');

const anchor = '{/* Manual Verification Schedule */}';
const btnCode = `
        <div className="max-w-2xl mx-auto w-full pt-8">
          <button
            onClick={handlePurchase}
            className="w-full py-4 bg-gradient-to-r from-red-600 to-[#FF3B30] text-white text-xs font-black uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-red-500/20 hover:scale-[1.02] transition-transform"
          >
             Proceed to Purchase via Google Play
          </button>
        </div>
`;

code = code.replace(anchor, btnCode);
fs.writeFileSync('src/components/Premium.tsx', code);
