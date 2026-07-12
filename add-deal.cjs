const fs = require('fs');
let data = JSON.parse(fs.readFileSync('data_store.json', 'utf8'));

const newDeal = {
  "id": "deal_lehenga_choli_" + Date.now(),
  "title": "Woman's Yellow Lehenga Choli",
  "category": "fashion",
  "oldPrice": 17500,
  "newPrice": 12075,
  "discountPercent": Math.round(((17500 - 12075) / 17500) * 100),
  "thumbnail": "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcROnLRAd4DZUxG_FaW2ObrKYsmBwt30teuEkSwCkAhMuh5o_9CGq3PcORYZiZ8V63noKzdyp5B7hHt4_ILznQmZxpjhCJEImQXMZDx5sS9dDtb8pXUp-GXW",
  "source": "Amazon.in",
  "link": "https://www.amazon.in/gp/product/B0H7JS5HP2?smid=AUHUIAHGSR283&psc=1&linkCode=ll2&tag=buywiseind0f8-21&linkId=5446649d81e1fa2ea9f549a1783aad99&ref_=as_li_ss_tl",
  "isBestSeller": true,
  "isEditorPick": true,
  "isFlashDeal": true,
  "views": 25,
  "saves": 10,
  "purchases": 2,
  "createdAt": new Date().toISOString(),
  "timeRemaining": "24h 00m"
};

data.deals.push(newDeal);
fs.writeFileSync('data_store.json', JSON.stringify(data, null, 2));
console.log('Added deal');
