const fs = require('fs');
let code = fs.readFileSync('src/components/DealsPage.tsx', 'utf-8');
code = code.replace(
  /<img src=\{deal\.thumbnail\} alt=\{deal\.title\} className="w-full h-full object-contain filter group-hover:scale-105 transition-transform" referrerPolicy="no-referrer" \/>/g,
  '<img src={deal.thumbnail} onError={(e) => { (e.target as any).src = "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&auto=format&fit=crop&q=60"; }} alt={deal.title} className="w-full h-full object-contain filter group-hover:scale-105 transition-transform" referrerPolicy="no-referrer" />'
);
fs.writeFileSync('src/components/DealsPage.tsx', code);
