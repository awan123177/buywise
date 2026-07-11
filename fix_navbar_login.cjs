const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

// Hide Live Users on xl, show on 2xl
code = code.replace(
  'className="text-right hidden xl:block border-r border-white/5 pr-8"',
  'className="text-right hidden 2xl:block border-r border-white/5 pr-8 shrink-0"'
);

// Hide Status on xl, show on 2xl
code = code.replace(
  'className="text-right hidden xl:block"',
  'className="text-right hidden 2xl:block shrink-0"'
);

// Add shrink-0 to Currency block
code = code.replace(
  'className="hidden lg:flex items-center gap-4 border-r border-white/5 pr-8 relative"',
  'className="hidden lg:flex items-center gap-4 border-r border-white/5 pr-8 relative shrink-0"'
);

// Make the nav right-side container more resilient
code = code.replace(
  'className="flex items-center gap-4 md:gap-8"',
  'className="flex items-center gap-3 md:gap-6 shrink-0"'
);

// Shorten SIGN_IN WITH GOOGLE to SIGN IN
code = code.replace(
  '<span className="text-[10px] font-black uppercase tracking-widest group-hover:text-black hidden sm:block">SIGN_IN WITH GOOGLE</span>',
  '<span className="text-[10px] font-black uppercase tracking-widest group-hover:text-black hidden sm:block">SIGN IN</span>'
);

// Add shrink-0 to the button
code = code.replace(
  'className="h-10 md:h-12 px-4 md:px-6 border border-white/10 rounded-lg group overflow-hidden bg-white/5 cursor-pointer flex items-center gap-2 md:gap-3 transition-colors hover:bg-white hover:text-black hover:border-white"',
  'className="h-10 md:h-12 px-4 md:px-6 border border-white/10 rounded-lg group overflow-hidden bg-white/5 cursor-pointer flex items-center gap-2 md:gap-3 transition-colors hover:bg-white hover:text-black hover:border-white shrink-0"'
);

// Also check GooeyNav container to allow shrinking if needed
code = code.replace(
  'className="hidden xl:flex items-center space-x-0 border-l border-r border-white/5 h-full overflow-visible"',
  'className="hidden xl:flex items-center space-x-0 border-l border-r border-white/5 h-full overflow-visible shrink overflow-x-auto no-scrollbar"'
);

fs.writeFileSync('src/components/Navbar.tsx', code);
