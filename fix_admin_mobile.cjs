const fs = require('fs');
let admin = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// We will add a mobile select drop-down next to the "Admin Console" title in the main area header, or below it.
const headerMatch = '<header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">';
const mobileSelect = `
          {/* Mobile Tab Selector */}
          <div className="w-full md:hidden mb-4">
            <select 
              value={activeTab} 
              onChange={(e) => setActiveTab(e.target.value as any)}
              className="w-full bg-[#111] border border-white/10 rounded-xl p-3 text-white text-sm font-bold uppercase tracking-widest focus:border-[#FF3B30] transition-colors outline-none"
            >
              {adminTabsList.map(tab => (
                <option key={tab.id} value={tab.id} className="bg-[#111]">{tab.label}</option>
              ))}
            </select>
          </div>
`;

if (admin.includes(headerMatch)) {
  admin = admin.replace(headerMatch, headerMatch + mobileSelect);
  fs.writeFileSync('src/components/AdminPanel.tsx', admin);
  console.log("Added mobile tab selector to AdminPanel");
} else {
  console.log("Could not find header in AdminPanel");
}
