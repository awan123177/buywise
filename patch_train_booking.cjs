const fs = require('fs');
let code = fs.readFileSync('src/components/TravelSearch/TrainSearch.tsx', 'utf-8');

code = code.replace(
  /const handleBook = \(bookingLink: string\) => {[\s\S]*?setTimeout\(\(\) => {[\s\S]*?window.open\(affiliateUrl, '_blank', 'noopener,noreferrer'\);[\s\S]*?}, 1500\);\n  };/,
  `const handleBook = (bookingLink: string) => {
    toast.success('Redirecting to Google Search...', { duration: 3000 });
    
    setTimeout(() => {
      window.open(bookingLink || \`https://www.google.com/search?q=book+train+from+\${origin}+to+\${destination}\`, '_blank', 'noopener,noreferrer');
    }, 1500);
  };`);

fs.writeFileSync('src/components/TravelSearch/TrainSearch.tsx', code);
