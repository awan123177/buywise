const fs = require('fs');
['src/components/StaticPage.tsx', 'src/components/FounderPage.tsx', 'src/components/Home.tsx'].forEach(file => {
   let code = fs.readFileSync(file, 'utf8');
   code = code.replace(/\/founder.jpg(\?v=10)?/g, '/api/founder-image');
   fs.writeFileSync(file, code);
});
console.log("Updated founder image URLs");
