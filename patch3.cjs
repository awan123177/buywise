const fs = require('fs');
let code = fs.readFileSync('src/components/CompareProducts.tsx', 'utf-8');
code = code.replace(
  /<img \n                      src=\{product\.thumbnail\} /g,
  '<img \n                      onError={(e) => { (e.target as any).src = "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&auto=format&fit=crop&q=60"; }}\n                      src={product.thumbnail} '
);
code = code.replace(
  /<img src=\{item\.thumbnail\} alt="" className="w-full h-full object-contain mix-blend-screen" referrerPolicy="no-referrer" \/>/g,
  '<img src={item.thumbnail} onError={(e) => { (e.target as any).src = "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&auto=format&fit=crop&q=60"; }} alt="" className="w-full h-full object-contain mix-blend-screen" referrerPolicy="no-referrer" />'
);
fs.writeFileSync('src/components/CompareProducts.tsx', code);
