const urls = [
  "https://www.flipkart.com/apple-iphone-15-black-128-gb/p/itm6ac6485515ae4?pid=MOBGTAGPTB3VS24W",
  "https://www.amazon.in/gp/product/B0H7JS5HP2/ref=ox_sc_act_image_1?smid=AUHUIAHGSR283&psc=1"
];

for (const urlStr of urls) {
  const urlObj = new URL(urlStr);
  const pathParts = urlObj.pathname.split('/').filter(Boolean);
  
  // Let's see what parts we get
  console.log(urlStr, pathParts);
}
