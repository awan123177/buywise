const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

// Add Sun/Moon imports
code = code.replace("LogOut, ShieldCheck, Menu, X, Plane, Flame, Trophy, ChevronDown, Scan, Bot, Gift }", "LogOut, ShieldCheck, Menu, X, Plane, Flame, Trophy, ChevronDown, Scan, Bot, Gift, Sun, Moon }");

// Add theme state
if (!code.includes('const [isDark, setIsDark]')) {
  code = code.replace(
    "const [showAvatarModal, setShowAvatarModal] = useState(false);",
    `const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      return savedTheme ? savedTheme === 'dark' : true;
    }
    return true;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);`
  );
}

// Add the button next to the currency dropdown
if (!code.includes('onClick={() => setIsDark(!isDark)}')) {
  code = code.replace(
    `<div className="hidden lg:flex flex-col items-end border-r border-white/5 pr-8 relative">`,
    `<div className="hidden lg:flex items-center gap-4 border-r border-white/5 pr-8 relative">
            <button 
              onClick={() => setIsDark(!isDark)}
              className="text-white/50 hover:text-white transition-colors mr-2"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="flex flex-col items-end">`
  );
  code = code.replace(
    `              {currency} <ChevronDown size={12} />\n            </button>\n          </div>`,
    `              {currency} <ChevronDown size={12} />\n            </button>\n          </div>\n          </div>`
  );
}

fs.writeFileSync('src/components/Navbar.tsx', code);
