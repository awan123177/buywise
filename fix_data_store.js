import fs from 'fs';

const data = JSON.parse(fs.readFileSync('./data_store.json', 'utf8'));

data.deals = [
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
];

fs.writeFileSync('./data_store.json', JSON.stringify(data, null, 2));
console.log('Fixed deals in data_store.json');
