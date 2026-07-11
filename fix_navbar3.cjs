const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

code = code.replace(
  `            </AnimatePresence>\n          </div>\n          <div className="text-right hidden xl:block border-r border-white/5 pr-8">`,
  `            </AnimatePresence>\n          </div>\n          </div>\n          <div className="text-right hidden xl:block border-r border-white/5 pr-8">`
);

fs.writeFileSync('src/components/Navbar.tsx', code);
