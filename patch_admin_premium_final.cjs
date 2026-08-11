const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// Remove premiumRequests state and selectedScreenshot
code = code.replace(/const \[premiumRequests, setPremiumRequests\] = useState<any\[\]>\(\[\]\);\n/g, '');
code = code.replace(/const \[selectedScreenshot, setSelectedScreenshot\] = useState<string \| null>\(null\);\n/g, '');

// Remove fetchPremiumRequests useEffect
code = code.replace(/useEffect\(\(\) => \{\n\s*fetchPremiumRequests\(\);\n\s*\}, \[\]\);\n/g, '');

// Remove fetchPremiumRequests function
code = code.replace(/const fetchPremiumRequests = async \(\) => \{[\s\S]*?^\};/m, '');

// Remove handlePremiumStatus function
code = code.replace(/const handlePremiumStatus = async \(id: string, newStatus: 'approved' \| 'rejected' \| 'revoked'\) => \{[\s\S]*?^\};/m, '');

// The JSX section to remove is from `{/* Premium Requests Queue */}` to `</AnimatePresence>` inclusive.
let startIdx = code.indexOf('{/* Premium Requests Queue */}');
if (startIdx !== -1) {
    let subStr = code.substring(startIdx);
    let endTag = '</AnimatePresence>';
    let relativeEndIdx = subStr.indexOf(endTag);
    if (relativeEndIdx !== -1) {
        let endIdx = startIdx + relativeEndIdx + endTag.length;
        
        let before = code.substring(0, startIdx);
        let after = code.substring(endIdx);
        code = before + after;
        
        fs.writeFileSync('src/components/AdminPanel.tsx', code);
        console.log("Patched AdminPanel.tsx successfully");
    } else {
        console.log("Could not find end tag");
    }
} else {
    console.log("Could not find Premium Requests section");
}

