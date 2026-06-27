import fs from 'fs';
const content = fs.readFileSync('src/server/gamificationDb.ts', 'utf8');

const startIndex = content.indexOf('const INITIAL_DEALS: Deal[] = [');
const endIndex = content.indexOf('];', startIndex) + 2;

const replacement = `const INITIAL_DEALS: Deal[] = [
  {
    id: "deal_samsung_s24_ultra",
    title: "Samsung S24 Ultra",
    category: "mobiles",
    oldPrice: 129999,
    newPrice: 99999,
    discountPercent: 23,
    thumbnail: "https://api.dicebear.com/7.x/identicon/svg?seed=samsungs24",
    source: "Amazon.in",
    link: "https://amazon.in/dp/B0CSYF8Z98",
    isBestSeller: true,
    isEditorPick: true,
    isFlashDeal: true,
    views: 125,
    saves: 45,
    purchases: 12,
    createdAt: new Date().toISOString(),
    timeRemaining: "12h 00m"
  }
];`;

const fixed = content.slice(0, startIndex) + replacement + content.slice(endIndex);
fs.writeFileSync('src/server/gamificationDb.ts', fixed);
console.log('Fixed deals');
