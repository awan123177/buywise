const fs = require('fs');
let code = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');

// Find the start of setupUser
const setupUserStartIdx = code.indexOf('const setupUser = (sessionUser: any, token: string) => {');
if (setupUserStartIdx === -1) {
    console.error('setupUser start not found');
    process.exit(1);
}

// Find the end of setupUser. We can search for the end by looking for the next declaration inside useEffect.
const nextDeclIdx = code.indexOf('const handleActivatedEvent = () => {', setupUserStartIdx);
if (nextDeclIdx === -1) {
    console.error('nextDeclIdx not found');
    process.exit(1);
}

// The setupUser function ends just before nextDeclIdx
const setupUserCode = code.substring(setupUserStartIdx, nextDeclIdx).trim();

// Remove setupUser from inside useEffect
code = code.replace(setupUserCode, '');

// Now we need to define unsubPremium and fallbackInterval as refs
const useEffectStartIdx = code.indexOf('useEffect(() => {');
if (useEffectStartIdx === -1) {
    console.error('useEffectStartIdx not found');
    process.exit(1);
}

const letUnsubPremium = 'let unsubPremium: any = null;\n    let fallbackInterval: any = null;';
code = code.replace(letUnsubPremium, '');

// Replace unsubPremium with unsubPremiumRef.current inside setupUserCode
let newSetupUserCode = setupUserCode.replace(/unsubPremium/g, 'unsubPremiumRef.current');
newSetupUserCode = newSetupUserCode.replace(/fallbackInterval/g, 'fallbackIntervalRef.current');

// Insert refs and setupUser before useEffect
const insertBeforeUseEffect = `
  const unsubPremiumRef = React.useRef<any>(null);
  const fallbackIntervalRef = React.useRef<any>(null);

  ${newSetupUserCode}
`;

code = code.slice(0, useEffectStartIdx) + insertBeforeUseEffect + '\n  ' + code.slice(useEffectStartIdx);

// Also need to replace the cleanup in useEffect to use refs
code = code.replace(/if\(unsubPremium\) supabase.removeChannel\(unsubPremium\);/g, 'if(unsubPremiumRef.current) supabase.removeChannel(unsubPremiumRef.current);');
code = code.replace(/if \(fallbackInterval\) clearInterval\(fallbackInterval\);/g, 'if (fallbackIntervalRef.current) clearInterval(fallbackIntervalRef.current);');

fs.writeFileSync('src/contexts/AuthContext.tsx', code);
console.log('Fixed src/contexts/AuthContext.tsx');
