import fs from 'fs';

let code = fs.readFileSync('server.ts', 'utf8');

const replacement = `      // Add debug logging
      trainDB.forEach(t => {
         console.log(\`Train Number: \${t.train_number}\`);
         console.log(\`Available Classes: \${t.classes.map(c => c.travel_class).join(', ')}\`);
         t.classes.forEach(c => {
             console.log(\`Fare returned by provider: \${c.price || 'N/A'}\`);
             console.log(\`Displayed Fare: \${c.price || 'Fare unavailable for this class'}\`);
             if (!c.price) console.log(\`Missing Fare: \${c.travel_class}\`);
         });
      });

      return res.json({ trains: trainDB });`;

code = code.replace(/\/\/\s*Add debug logging[\s\S]*?return res\.json\(\{ trains: trainDB \}\);/, replacement);

fs.writeFileSync('server.ts', code);
