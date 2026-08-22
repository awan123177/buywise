const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// 1. Remove from planDurationMap
code = code.replace(/planDurationMap: Record<string, number> = \{\s*daily: 1,\s*weekly: 7,\s*monthly: 30,\s*yearly: 365,\s*lifetime: 36500\s*\}/g,
`planDurationMap: Record<string, number> = {
        monthly: 30,
        yearly: 365,
        lifetime: 36500
      }`);

// 2. Remove from planDaysMap
code = code.replace(/planDaysMap: Record<string, number> = \{\s*daily: 1,\s*weekly: 7,\s*monthly: 30,\s*yearly: 365,\s*lifetime: 36500\s*\}/g,
`planDaysMap: Record<string, number> = {
        monthly: 30,
        yearly: 365,
        lifetime: 36500
      }`);

// 3. Remove daily and weekly from the legacy plans object (around line 959)
// It starts with `daily: { ... },` and `weekly: { ... },`
code = code.replace(/daily: \{\s*name: "Daily Pass",\s*duration: "1 Day",\s*days: 1,\s*priceInr: 10,\s*amountPaise: 1000,\s*\},\s*weekly: \{\s*name: "Weekly Pass",\s*duration: "7 Days",\s*days: 7,\s*priceInr: 30,\s*amountPaise: 3000,\s*\},/g, '');

// 4. Update dodoPlanMap
code = code.replace(/const dodoPlanMap: Record<string, string> = \{[\s\S]*?\};/g, 
`const dodoPlanMap: Record<string, string> = {
  monthly: 'pdt_0NIsfvmdNk8MOUZDAPwFC',
  yearly: 'pdt_0NIsgR5Ig7OyWQ7hFPPO9',
  lifetime: 'pdt_0NIsgAgxtmImcGR7BFMmx'
};`);

// 5. Chatbot string replacement 1
code = code.replace(/Weekly Pass \(₹30\), Monthly Elite \(₹100\), Forever Founder \(₹700\)/g, 
`Monthly Elite (₹100), Yearly Pro (₹500), Forever Founder (₹700)`);

// 6. Chatbot string replacement 2
code = code.replace(/lowerInput\.includes\("weekly"\) \|\| /g, '');

// 7. planMap around line 4575
code = code.replace(/const planMap: Record<string, number> = \{\s*'buywise_premium_daily': 1,\s*'buywise_premium_weekly': 7,\s*'buywise_premium_monthly': 30,\s*'buywise_premium_yearly': 365,\s*'buywise_founder_forever': 36500,/g,
`const planMap: Record<string, number> = {
          'buywise_premium_monthly': 30,
          'buywise_premium_yearly': 365,
          'buywise_founder_forever': 36500,`);

fs.writeFileSync('server.ts', code, 'utf8');
