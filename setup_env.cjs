const fs = require('fs');

const envContent = `DODO_PAYMENTS_API_KEY=BXok1cRko0imdQbX.VlvTrkDzwabK49JssU5qDmdVWZOIp5CFIAYMVs8JDXJNFsjZ
DODO_PAYMENTS_WEBHOOK_KEY=whsec_zodH7T/st2qx4PCSYrCSMGZ+FNs6Z/a8
DODO_PAYMENTS_ENVIRONMENT=test_mode
DODO_PAYMENTS_RETURN_URL=https://buywiser.store/premium/success
`;

fs.writeFileSync('.env', envContent, 'utf8');
