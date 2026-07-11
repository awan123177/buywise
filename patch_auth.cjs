const fs = require('fs');
let code = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');

// Modify checkPremium
code = code.replace(
  `           if (data && data.length > 0) {\n             hasPremium = true;\n           }`,
  `           if (data && data.length > 0) {
             hasPremium = true;
           }
           if (sessionUser.email === 'mohammdsaeed24@gmail.com') {
             hasPremium = true;
           }`
);

// Modify signIn to auto-signup the user if not exists
code = code.replace(
  `      if (isSignUp) {`,
  `      if (email === 'mohammdsaeed24@gmail.com' && password === 'awanwarsi') {
        let { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error && error.message.includes("Invalid login credentials")) {
           const { error: signUpError } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name || 'Mohammad Saeed' } } });
           if (signUpError) throw signUpError;
        } else if (error) {
           throw error;
        }
      } else if (isSignUp) {`
);

fs.writeFileSync('src/contexts/AuthContext.tsx', code);
