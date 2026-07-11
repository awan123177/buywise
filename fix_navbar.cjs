const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

// I added an extra </div>. I need to remove one.
code = code.replace(
  `              {currency} <ChevronDown size={12} />\n            </button>\n          </div>\n          </div>`,
  `              {currency} <ChevronDown size={12} />\n            </button>\n          </div>`
);

fs.writeFileSync('src/components/Navbar.tsx', code);
