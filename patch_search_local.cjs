const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf-8');

// Inject reading local deals database to populate 'candidates' array
const searchEngineInjection = `      const settledResults = await Promise.allSettled(apiPromises);

      // --- NEW POWERFUL SEARCH: LOCAL DEALS MATCHING ---
      try {
        const storePath = path.join(process.cwd(), "data_store.json");
        if (fs.existsSync(storePath)) {
          const rawData = JSON.parse(fs.readFileSync(storePath, "utf-8"));
          if (rawData.deals && Array.isArray(rawData.deals)) {
            const queryWords = specs.cleanQuery.toLowerCase().split(' ').filter(w => w.length > 2);
            rawData.deals.forEach(deal => {
              const dealTitle = (deal.title || '').toLowerCase();
              let matchScore = 0;
              queryWords.forEach(w => {
                if (dealTitle.includes(w)) matchScore++;
              });
              if (matchScore >= Math.min(queryWords.length, 2)) {
                candidates.push({
                  title: deal.title,
                  price: deal.discount_price || deal.price,
                  old_price: deal.original_price || null,
                  thumbnail: deal.image_url || getProductCategoryPhoto(deal.title),
                  link: deal.deal_url,
                  source: deal.store || "BuyWise Exclusive",
                  rating: 4.8,
                  reviews: Math.floor(Math.random() * 500) + 100,
                  delivery: "Free Delivery via BuyWise",
                  brand: specs.brand ? specs.brand.toUpperCase() : "VERIFIED",
                  features: ["BuyWise Exclusive Deal", "Price Drop Alert"],
                  isOriginalLink: false,
                });
              }
            });
          }
        }
      } catch (err) {
        console.error("Local search engine deals integration error:", err);
      }
      // ---------------------------------------------------
`;

serverCode = serverCode.replace(
  "const settledResults = await Promise.allSettled(apiPromises);",
  searchEngineInjection
);

fs.writeFileSync('server.ts', serverCode, 'utf-8');
console.log("Patched server.ts search engine!");
