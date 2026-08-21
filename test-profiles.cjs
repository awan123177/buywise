const fs = require('fs');
const db = JSON.parse(fs.readFileSync('data_store.json', 'utf8'));
for (const [userId, profile] of Object.entries(db.profiles)) {
  if (profile.coins === undefined) {
    console.log("Missing coins for user", userId);
  }
}
console.log("Done");
