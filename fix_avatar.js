import fs from 'fs';

let content = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

const target = `                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const url = window.prompt("Enter new avatar URL (e.g. from dicebear or image link):", user.photoURL || "");
                      if (url) {
                        updateAvatar(url);
                      }
                    }}
                    title={\`Change Avatar\`}
                    className="w-10 h-10 md:w-12 md:h-12 border border-white/10 rounded-full p-0 group overflow-hidden bg-transparent relative shadow-[0_0_15px_rgba(0,0,0,0.5)] cursor-pointer"
                  >
                    <img src={user.photoURL || undefined} alt="avatar" className="w-full h-full object-cover transition-all absolute inset-0" />
                    <div className="absolute inset-0 bg-[#FF3B30]/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-bold text-white tracking-widest uppercase">EDIT</span>
                    </div>
                  </motion.button>`;

const replacement = `                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const url = window.prompt("Enter new avatar URL (e.g. from dicebear or image link):", user.photoURL || "");
                      if (url) {
                        updateAvatar(url);
                      }
                    }}
                    title={\`Change Avatar\`}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full p-[2px] group overflow-hidden relative cursor-pointer bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.5)] hover:shadow-[0_0_20px_rgba(236,72,153,0.8)] transition-all"
                  >
                    <div className="w-full h-full rounded-full overflow-hidden relative bg-[#111]">
                      <img src={user.photoURL || undefined} alt="avatar" className="w-full h-full object-cover transition-all absolute inset-0 z-10" />
                      <div className="absolute inset-0 bg-[#FF3B30]/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        <span className="text-[10px] font-bold text-white tracking-widest uppercase">EDIT</span>
                      </div>
                    </div>
                  </motion.button>`;

// use simple replace replacing spaces with \s+ to match safely
const regex = /<motion\.button[\s\S]*?className="w-10 h-10 md:w-12 md:h-12 border border-white\/10 rounded-full p-0 group overflow-hidden bg-transparent relative shadow-\[0_0_15px_rgba\(0,0,0,0\.5\)\] cursor-pointer"[\s\S]*?<\/motion\.button>/m;

content = content.replace(regex, replacement);
fs.writeFileSync('src/components/Navbar.tsx', content);
console.log('Fixed avatar in Navbar.tsx');
