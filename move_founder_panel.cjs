const fs = require('fs');

let adminPanel = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// The Founder Photo Panel code block:
const founderPanelRegex = /\{\/\* Founder Photo Panel \*\/\}[\s\S]*?\{\/\* Quick Actions Panel \*\/\}/;

const match = adminPanel.match(founderPanelRegex);
if (match) {
  const founderPanelCode = match[0];
  // Remove it from settings
  adminPanel = adminPanel.replace(founderPanelCode, '{/* Quick Actions Panel */}');

  // Add the founder panel as a new activeTab block
  const founderTabBlock = `
      {activeTab === 'founder' && (
        <div className="space-y-6">
          <div className="mb-6">
            <h2 className="text-2xl font-black uppercase tracking-widest text-white flex items-center gap-2">
              <Upload className="text-[#FF3B30]" /> Owner Photo
            </h2>
            <p className="text-sm text-white/50">Change the owner/founder photo. The new photo will appear instantly across the app.</p>
          </div>
          <div className="max-w-2xl">
            ${founderPanelCode.replace('{/* Quick Actions Panel */}', '')}
          </div>
        </div>
      )}
`;
  
  // Insert it before settings block
  adminPanel = adminPanel.replace("{activeTab === 'settings' && (", founderTabBlock + "\n      {activeTab === 'settings' && (");

  // Fix the fallback condition
  adminPanel = adminPanel.replace(
    "activeTab !== 'giftcards' && activeTab !== 'settings' && (",
    "activeTab !== 'giftcards' && activeTab !== 'settings' && activeTab !== 'founder' && ("
  );

  fs.writeFileSync('src/components/AdminPanel.tsx', adminPanel);
  console.log("Moved founder panel!");
} else {
  console.log("Could not find founder panel block.");
}
