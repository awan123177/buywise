const fs = require('fs');
let code = fs.readFileSync('src/main.tsx', 'utf8');
const unregisterCode = `
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then(registration => {
    registration.unregister();
  }).catch(error => {
    console.error(error.message);
  });
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for(let registration of registrations) {
      registration.unregister();
    }
  });
}
`;
if (!code.includes('serviceWorker')) {
  code = code + '\n' + unregisterCode;
  fs.writeFileSync('src/main.tsx', code);
}
