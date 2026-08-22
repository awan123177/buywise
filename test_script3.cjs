const DodoPayments = require('dodopayments').default;
const dodoClient = new DodoPayments({ bearerToken: 'BXok1cRko0imdQbX.VlvTrkDzwabK49JssU5qDmdVWZOIp5CFIAYMVs8JDXJNFsjZ', environment: 'test_mode' });
console.log(dodoClient);
