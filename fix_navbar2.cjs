const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

code = code.replace(
  `              </AnimatePresence>\n          </div>\n          \n          {user ? (`,
  `              </AnimatePresence>\n          </div>\n          </div>\n          \n          {user ? (`
);

fs.writeFileSync('src/components/Navbar.tsx', code);
