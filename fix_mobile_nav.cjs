const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

code = code.replace(
  "{ label: 'PREM', icon: <Diamond size={18} />, onClick: () => navigate('/premium') },",
  "{ label: 'PREM', icon: <Diamond size={18} />, onClick: () => navigate('/premium') },\n            { label: 'USER', icon: <User size={18} />, onClick: () => user ? setShowAvatarModal(true) : openLogin() },"
);

fs.writeFileSync('src/components/Navbar.tsx', code);
