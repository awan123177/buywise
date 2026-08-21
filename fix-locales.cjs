const fs = require('fs');

function makeSafe(file, patterns) {
    if (!fs.existsSync(file)) return;
    let code = fs.readFileSync(file, 'utf8');
    for (const [from, to] of patterns) {
        code = code.split(from).join(to);
    }
    fs.writeFileSync(file, code);
    console.log("Patched", file);
}

makeSafe('src/components/Home.tsx', [
    ['savingsStats.totalUsers.toLocaleString()', '(savingsStats.totalUsers || 14502).toLocaleString()']
]);

makeSafe('src/components/Receipt.tsx', [
    ['receipt.amount.toLocaleString()', '(receipt.amount || 0).toLocaleString()'],
    ['receipt.tax.toLocaleString()', '(receipt.tax || 0).toLocaleString()'],
    ['receipt.totalAmount.toLocaleString()', '(receipt.totalAmount || 0).toLocaleString()']
]);

makeSafe('src/components/MyReceipts.tsx', [
    ['receipt.totalAmount.toLocaleString()', '(receipt.totalAmount || 0).toLocaleString()']
]);

makeSafe('src/components/ScannerPage.tsx', [
    ['scanResult.lowestPrice.toLocaleString()', '(scanResult.lowestPrice || 0).toLocaleString()'],
    ['scanResult.highestPrice.toLocaleString()', '(scanResult.highestPrice || 0).toLocaleString()'],
    ['scanResult.lowestPriceEver.toLocaleString()', '(scanResult.lowestPriceEver || 0).toLocaleString()'],
    ['scanResult.highestPriceEver.toLocaleString()', '(scanResult.highestPriceEver || 0).toLocaleString()']
]);

makeSafe('src/components/Navbar.tsx', [
    ['coins.toLocaleString()', '(coins || 0).toLocaleString()']
]);

makeSafe('src/components/AdminPanel.tsx', [
    ['stats.totalSearches?.toLocaleString()', '(stats.totalSearches || 0).toLocaleString()'],
    ['scan.lowestPrice?.toLocaleString()', '(scan.lowestPrice || 0).toLocaleString()']
]);

makeSafe('src/components/AdminApkManager.tsx', [
    ['item.value.toLocaleString()', '(item.value || 0).toLocaleString()']
]);

