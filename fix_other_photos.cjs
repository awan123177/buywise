const fs = require('fs');

let home = fs.readFileSync('src/components/Home.tsx', 'utf8');
home = home.replace('src="/founder.png?v=6"', 'src={`/founder.png?v=${Date.now()}`}');
fs.writeFileSync('src/components/Home.tsx', home);

let staticPage = fs.readFileSync('src/components/StaticPage.tsx', 'utf8');
staticPage = staticPage.replace('src="/founder.png?v=6"', 'src={`/founder.png?v=${Date.now()}`}');
fs.writeFileSync('src/components/StaticPage.tsx', staticPage);

