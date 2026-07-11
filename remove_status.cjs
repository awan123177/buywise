const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

code = code.replace(
  /<div className="text-right hidden 2xl:block border-r border-white\/5 pr-8 shrink-0">[\s\S]*?<\/div>\n          <\/div>/g,
  ''
);

code = code.replace(
  /<div className="text-right hidden 2xl:block shrink-0">[\s\S]*?<\/div>\n          <\/div>/g,
  ''
);

fs.writeFileSync('src/components/Navbar.tsx', code);
