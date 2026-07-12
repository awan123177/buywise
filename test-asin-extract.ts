const urls = [
  "https://www.amazon.in/gp/product/B0H7JS5HP2/ref=ox_sc_act_image_1?smid=AUHUIAHGSR283&psc=1",
  "https://amazon.com/dp/B0H7JS5HP2",
  "https://www.amazon.co.uk/Some-Product-Name/dp/B0H7JS5HP2/ref=sr_1_1"
];

for (const u of urls) {
  const match = u.match(/\/(?:dp|product|asin|ASIN|o\/ASIN)\/([A-Z0-9]{10})/);
  console.log(match ? match[1] : null);
}
