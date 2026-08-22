const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const newMap = JSON.parse(fs.readFileSync('new_map.json', 'utf8'));

// The old map looks like this:
/*
const dodoPlanMap: Record<string, string> = {
  daily: 'pdt_0NIseugD37hZhQ7eR9Igx',
  weekly: 'pdt_0NIsfcBlkdpPpZOZpBUncF',
  monthly: 'pdt_0NIsfvmdNk8MOUZDAPwFC',
  yearly: 'pdt_0NIsgR5Ig7OyWQ7hFPPO9',
  lifetime: 'pdt_0NIsgAgxtmImcGR7BFMmx'
};
*/

code = code.replace(/const dodoPlanMap: Record<string, string> = \{[\s\S]*?\};/, `const dodoPlanMap: Record<string, string> = {
  daily: '${newMap.daily}',
  weekly: '${newMap.weekly}',
  monthly: '${newMap.monthly}',
  yearly: '${newMap.yearly}',
  lifetime: '${newMap.lifetime}'
};`);

fs.writeFileSync('server.ts', code, 'utf8');
