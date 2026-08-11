const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// Remove premiumRequests state
code = code.replace(/const \[premiumRequests, setPremiumRequests\] = useState<any\[\]>\(\[\]\);\n/, '');

// The premium requests section is likely between `{/* Premium Requests */}` and the end of `{/* Active Premium Subscriptions */}`
const startRegex = /\{\/\* Premium Requests \*\/\}/;
// find where it ends...
const endRegex = /<h3 className="font-bold text-white uppercase tracking-widest text-xs border-b border-white\/10 pb-2">Manual Generate<\/h3>/;
let startIdx = code.search(startRegex);
let endIdx = code.search(endRegex);

if (startIdx !== -1 && endIdx !== -1) {
    // We need to keep Manual Generate
    // Let's remove from startIdx to endIdx - some padding
    let pre = code.substring(0, startIdx);
    // Find the nearest opening div or something before Manual Generate?
    // Actually, "Manual Generate" is inside a card. We should just replace the whole section safely.
    // Let's find exactly the JSX blocks.
}
