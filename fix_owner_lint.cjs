const fs = require('fs');
let code = fs.readFileSync('src/components/OwnerPage.tsx', 'utf8');

// Fix ease
code = code.replace(
  'ease: [0.25, 0.1, 0.25, 1]',
  'ease: "easeOut"'
);

// Remove unused imports
code = code.replace(
  "import { BadgeCheck, Github, Instagram, Linkedin, Twitter, ArrowRight, Sparkles, Target, Zap, Shield, Globe, Users, ShoppingBag, Youtube, Mail, Crown } from 'lucide-react';",
  "import { Github, Instagram, Twitter, ArrowRight, Target, Youtube, Mail, Crown } from 'lucide-react';"
);

// remove Ferrofluid import
code = code.replace(
  "import Ferrofluid from './Ferrofluid';\n",
  ""
);

fs.writeFileSync('src/components/OwnerPage.tsx', code);
