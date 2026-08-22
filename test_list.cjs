const DodoPayments = require('dodopayments').default;
const dodoClient = new DodoPayments({ bearerToken: 'test' });
console.log(Object.keys(dodoClient.products));
