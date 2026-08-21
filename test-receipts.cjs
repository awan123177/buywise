const fs = require('fs');
const db = JSON.parse(fs.readFileSync('data_store.json', 'utf8'));
if (!db.receipts) {
  console.log("No receipts array");
  process.exit(0);
}
let missing = 0;
for (const receipt of db.receipts) {
  if (receipt.totalAmount === undefined) {
    missing++;
    console.log("Missing totalAmount on receipt:", receipt.receiptId);
  }
}
console.log("Missing totalAmount count:", missing);
