const fs = require('fs');

let code = fs.readFileSync('src/server/gamificationDb.ts', 'utf8');

const oldCode = `    if (!dbData.deals) {
      dbData.deals = [];
    }`;

const newCode = `    if (!dbData.deals) {
      dbData.deals = [];
    }
    
    const hasLehenga = dbData.deals.find(d => d.id === 'deal_lehenga_choli');
    if (!hasLehenga) {
      dbData.deals.push({
        "id": "deal_lehenga_choli",
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
      });
      saveDatabase();
    }`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('src/server/gamificationDb.ts', code);
