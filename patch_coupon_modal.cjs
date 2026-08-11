const fs = require('fs');
let code = fs.readFileSync('src/components/CouponRewardModal.tsx', 'utf-8');

// replace the button section to add USE COUPON
code = code.replace(
  /<button\n\s*onClick=\{onClose\}\n\s*className="text-\[10px\] text-white\/40 hover:text-white uppercase tracking-widest transition-colors font-bold"\n\s*>\n\s*Close\n\s*<\/button>/,
  `
            <button
              onClick={() => {
                onClose();
                window.location.href = '/premium';
              }}
              className="w-full py-4 bg-[#FF3B30] hover:bg-red-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              USE COUPON
            </button>
            <button
              onClick={onClose}
              className="text-[10px] text-white/40 hover:text-white uppercase tracking-widest transition-colors font-bold"
            >
              Close
            </button>
  `
);

fs.writeFileSync('src/components/CouponRewardModal.tsx', code);
