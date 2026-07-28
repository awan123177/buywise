const fs = require('fs');
let code = fs.readFileSync('src/components/ProductPage.tsx', 'utf-8');
code = code.replace(
  /<img src=\{img\} alt="thumbnail" className="w-full h-full object-cover" \/>/g,
  '<img src={img} onError={(e) => { (e.target as any).src = "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&auto=format&fit=crop&q=60"; }} alt="thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />'
);
fs.writeFileSync('src/components/ProductPage.tsx', code);
