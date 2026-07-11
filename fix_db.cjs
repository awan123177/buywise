const fs = require('fs');
let db = JSON.parse(fs.readFileSync('data_store.json', 'utf8'));
if (db.profiles) {
  for (const id in db.profiles) {
    if (db.profiles[id].email === 'mohammdsaeed24@gmail.com') {
      db.profiles[id].isPremium = true;
      db.profiles[id].premiumExpiry = '2099-12-31T00:00:00.000Z';
    }
  }
}
fs.writeFileSync('data_store.json', JSON.stringify(db, null, 2));
