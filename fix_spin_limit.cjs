const fs = require('fs');
let code = fs.readFileSync('src/server/gamificationDb.ts', 'utf8');

code = code.replace(
  `  const todayStr = new Date().toISOString().split("T")[0];\n  if (profile.lastSpinDate === todayStr) {\n    return { success: false, reward: "", coinsAwarded: 0, message: "You have already spun the wheel today!" };\n  }\n\n  profile.lastSpinDate = todayStr;`,
  `  // Removed daily limit so users can spin multiple times\n  // const todayStr = new Date().toISOString().split("T")[0];\n  // if (profile.lastSpinDate === todayStr) {\n  //   return { success: false, reward: "", coinsAwarded: 0, message: "You have already spun the wheel today!" };\n  // }\n  // profile.lastSpinDate = todayStr;`
);

fs.writeFileSync('src/server/gamificationDb.ts', code);
console.log("Removed spin daily limit.");
