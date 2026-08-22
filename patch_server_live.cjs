const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// 1. Fix Supabase Client Initialization
code = code.replace(
  `const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;\n  if (!url || !key || url.includes("placeholder") || key.includes("placeholder")) {`,
  `const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;\n  if (!url || !key || url.includes("placeholder") || key.includes("placeholder") || !url.startsWith("http")) {`
);

// 2. Fix Firebase Secondary Initialization error
code = code.replace(
  `if (((admin as any).apps || (admin.default as any).apps).length) {`,
  `if (((admin as any).apps?.length) || ((admin.default as any)?.apps?.length)) {`
);

// 3. Update Dodo Plan Map to support both Live and Test mode (or just use live ids if in live mode)
const oldMapStr = `const dodoPlanMap: Record<string, string> = {
  monthly: 'pdt_0Nlt1WQA2BzUbLbetJ4pm',
  yearly: 'pdt_0Nlt1WS3rbm20BWDim4ZQ',
  lifetime: 'pdt_0Nlt1WTtCUeiKeKnQRwsP'
};`;

const newMapStr = `const getDodoPlanMap = () => {
  const isLive = process.env.DODO_PAYMENTS_ENVIRONMENT === 'live_mode';
  if (isLive) {
    return {
      monthly: 'pdt_0NlsfvmdNk8MOUZDAPwFC',
      yearly: 'pdt_0NlsgR5lg7OyWQ7hPFPO9',
      lifetime: 'pdt_0NlsgAgxtmImcGR7BFMmx'
    };
  }
  return {
    monthly: 'pdt_0Nlt1WQA2BzUbLbetJ4pm',
    yearly: 'pdt_0Nlt1WS3rbm20BWDim4ZQ',
    lifetime: 'pdt_0Nlt1WTtCUeiKeKnQRwsP'
  };
};`;

code = code.replace(oldMapStr, newMapStr);

// 4. Update the places that use dodoPlanMap
code = code.replace(`if (!planId || !dodoPlanMap[planId]) {`, `const dodoPlanMap = getDodoPlanMap();\n    if (!planId || !dodoPlanMap[planId]) {`);
code = code.replace(`const productId = dodoPlanMap[planId];`, `const productId = dodoPlanMap[planId];`);

fs.writeFileSync('server.ts', code);
