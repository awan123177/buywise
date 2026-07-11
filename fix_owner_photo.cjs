const fs = require('fs');

// Update OwnerPage.tsx to bust cache
let ownerPage = fs.readFileSync('src/components/OwnerPage.tsx', 'utf8');
ownerPage = ownerPage.replace('src="/founder.png?v=6"', 'src={`/founder.png?v=${Date.now()}`}');
fs.writeFileSync('src/components/OwnerPage.tsx', ownerPage);

// Add 'founder' tab to AdminPanel
let adminPanel = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');
adminPanel = adminPanel.replace(
  "{ id: 'settings', label: 'System Settings', icon: Settings, group: 'Advanced' },",
  "{ id: 'settings', label: 'System Settings', icon: Settings, group: 'Advanced' },\n    { id: 'founder', label: 'Owner Photo', icon: Upload, group: 'Management' },"
);
adminPanel = adminPanel.replace(
  "const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'users' | 'products' | 'flights' | 'coins' | 'referrals' | 'premium' | 'giftcards' | 'telegram' | 'ai' | 'analytics' | 'settings'>('overview');",
  "const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'users' | 'products' | 'flights' | 'coins' | 'referrals' | 'premium' | 'giftcards' | 'telegram' | 'ai' | 'analytics' | 'settings' | 'founder'>('overview');"
);

fs.writeFileSync('src/components/AdminPanel.tsx', adminPanel);
