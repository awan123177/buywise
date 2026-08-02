const fs = require('fs');
let serverCode = fs.readFileSync('server.ts', 'utf-8');

const injection = `
      // --- NEW POWERFUL SEARCH: LOCAL DEALS MATCHING ---
      try {
        const supabase = getSupabaseClient();
        if (supabase) {
          const { data: supaDeals } = await supabase.from('deals').select('*');
          if (supaDeals && Array.isArray(supaDeals)) {
            const queryWords = specs.cleanQuery.toLowerCase().split(' ').filter(w => w.length > 2);
            supaDeals.forEach(deal => {
              const dealTitle = (deal.title || '').toLowerCase();
              let matchScore = 0;
              queryWords.forEach(w => {
                if (dealTitle.includes(w)) matchScore++;
              });
              if (matchScore > 0 && matchScore >= Math.min(queryWords.length, 2)) {
                candidates.push({
                  title: deal.title,
                  price: deal.discount_price || deal.price || "₹0",
                  old_price: deal.original_price || null,
                  thumbnail: deal.image_url || getProductCategoryPhoto(deal.title),
                  link: deal.deal_url,
                  source: deal.store || "Verified Partner",
                  rating: 4.9,
                  reviews: 800,
                  delivery: "Fast Delivery via BuyWise",
                  brand: specs.brand ? specs.brand.toUpperCase() : "VERIFIED",
                  features: ["Verified Affiliate Deal", "BuyWise Guarantee"],
                  isOriginalLink: false,
                });
              }
            });
          }
        }
      } catch (e) {
        console.error("Supabase search integration error:", e);
      }
`;

serverCode = serverCode.replace(
  "// --- NEW POWERFUL SEARCH: LOCAL DEALS MATCHING ---",
  injection + "\n      // --- NEW POWERFUL SEARCH: LOCAL DEALS MATCHING ---"
);

fs.writeFileSync('server.ts', serverCode, 'utf-8');
console.log("Patched Supabase search engine!");
