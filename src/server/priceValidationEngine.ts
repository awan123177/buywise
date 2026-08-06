/**
 * BuyWise Price & Store Validation Engine
 * Ensures 100% genuine pricing from trusted Indian marketplaces & official brand stores.
 * Blocks fake prices (e.g., ₹5,000 for iPhone 17 Pro Max), scam websites, and outlier deals.
 */

export interface StoreTrustInfo {
  name: string;
  trustScore: number; // 0 to 100
  isTrusted: boolean;
  isOfficialBrandStore?: boolean;
}

export interface PriceValidationResult {
  isValid: boolean;
  numericPrice: number;
  formattedPrice: string;
  trustScore: number;
  marketMedianPrice?: number;
  rejectionReason?: string;
  acceptanceReason?: string;
}

// Trusted Store Registry with Trust Scores
const TRUSTED_STORES: Record<string, number> = {
  "amazon": 98,
  "amazon india": 98,
  "amazon.in": 98,
  "flipkart": 98,
  "croma": 96,
  "reliance digital": 96,
  "jiomart": 95,
  "vijay sales": 95,
  "tata cliq": 95,
  "tata cliq luxury": 96,
  "meesho": 92,
  "myntra": 94,
  "ajio": 94,
  "nykaa": 94,
  "nykaa man": 94,
  "apple": 99,
  "apple store": 99,
  "samsung": 99,
  "samsung store": 99,
  "oneplus": 98,
  "dell": 98,
  "hp": 98,
  "lenovo": 98,
  "asus": 98,
  "boat": 95,
  "sony": 98,
  "lg": 98,
  "nike": 96,
  "adidas": 96,
  "puma": 96,
  "poorvika": 90,
  "sangeetha": 90,
  "bhavani": 88,
  "shoppers stop": 93,
  "lifestyle": 93,
  "decathlon": 95,
};

// Domain / Keywords Blocklist
const BANNED_DOMAINS_AND_KEYWORDS = [
  "cheap-deals", "free-coupons", "replica", "scam", "phishing",
  "super-discount-shop", "fast-cash", "cheap-iphone", "fake-store",
  "coupon-spam", "pirate", "cracked", "unverified-seller", ".xyz", ".top", ".click", ".win"
];

/**
 * Get Store Trust Score (0 - 100)
 */
export function getStoreTrustScore(storeNameStr: string, linkUrl?: string): StoreTrustInfo {
  const cleanStore = (storeNameStr || "").toLowerCase().trim();
  const cleanUrl = (linkUrl || "").toLowerCase().trim();

  // Check blocklist
  for (const banned of BANNED_DOMAINS_AND_KEYWORDS) {
    if (cleanStore.includes(banned) || cleanUrl.includes(banned)) {
      return {
        name: storeNameStr || "Unknown Store",
        trustScore: 0,
        isTrusted: false
      };
    }
  }

  // Exact or Partial Match in Trusted Stores Registry
  for (const [knownStore, score] of Object.entries(TRUSTED_STORES)) {
    if (cleanStore.includes(knownStore) || cleanUrl.includes(knownStore)) {
      return {
        name: storeNameStr,
        trustScore: score,
        isTrusted: score >= 70,
        isOfficialBrandStore: score >= 98
      };
    }
  }

  // If domain is major e-commerce or official site
  if (cleanUrl.includes(".in") || cleanUrl.includes(".com")) {
    return {
      name: storeNameStr || "Verified Marketplace",
      trustScore: 75,
      isTrusted: true
    };
  }

  return {
    name: storeNameStr || "Unverified Store",
    trustScore: 40,
    isTrusted: false
  };
}

/**
 * Parse string price into numeric integer (e.g. "₹1,44,900" -> 144900)
 */
export function parseNumericPrice(priceVal: string | number | null | undefined): number {
  if (priceVal === null || priceVal === undefined) return 0;
  if (typeof priceVal === 'number') return Math.max(0, Math.round(priceVal));
  
  const str = String(priceVal).trim();
  const cleanStr = str.replace(/[^0-9.]/g, '');
  if (!cleanStr) return 0;
  
  let num = parseFloat(cleanStr);
  if (isNaN(num)) return 0;

  // Convert USD ($ symbol or USD string) to INR (~85 INR per USD)
  if (str.includes('$') || str.toLowerCase().includes('usd')) {
    num = num * 85;
  }

  return Math.round(num);
}

/**
 * Estimate expected market baseline price for product categories & queries
 */
export function getExpectedMarketPrice(productTitle: string, brand?: string): number {
  const q = (productTitle || "").toLowerCase();
  const b = (brand || "").toLowerCase();

  // Flagship iPhones
  if (q.includes("iphone 17 pro max") || q.includes("iphone 16 pro max") || q.includes("iphone 15 pro max") || q.includes("iphone 14 pro max")) {
    return 144900;
  }
  if (q.includes("iphone 17 pro") || q.includes("iphone 16 pro") || q.includes("iphone 15 pro") || q.includes("iphone 14 pro")) {
    return 119900;
  }
  if (q.includes("iphone 17 plus") || q.includes("iphone 16 plus") || q.includes("iphone 15 plus") || q.includes("iphone 14 plus") || q.includes("iphone 17 air")) {
    return 79900;
  }
  if (q.includes("iphone 17") || q.includes("iphone 16") || q.includes("iphone 15") || q.includes("iphone 14")) {
    return 69900;
  }
  if (q.includes("iphone 13") || q.includes("iphone 12") || q.includes("iphone se")) {
    return 48900;
  }
  if (q.includes("iphone") || b.includes("apple") && q.includes("phone")) {
    return 64900;
  }

  // Samsung Galaxy Flagships
  if (q.includes("s25 ultra") || q.includes("s24 ultra") || q.includes("s23 ultra") || q.includes("z fold")) {
    return 129999;
  }
  if (q.includes("s25+") || q.includes("s24+") || q.includes("s25 plus") || q.includes("s24 plus") || q.includes("z flip")) {
    return 89999;
  }
  if (q.includes("s25") || q.includes("s24") || q.includes("s23 fe") || q.includes("s23")) {
    return 64999;
  }
  if (q.includes("galaxy a5") || q.includes("galaxy a3") || q.includes("galaxy m5") || q.includes("galaxy f5")) {
    return 28999;
  }
  if (q.includes("galaxy m") || q.includes("galaxy f") || q.includes("galaxy a1")) {
    return 14999;
  }

  // Google Pixel
  if (q.includes("pixel 9 pro") || q.includes("pixel 8 pro") || q.includes("pixel 7 pro")) return 99999;
  if (q.includes("pixel 9") || q.includes("pixel 8") || q.includes("pixel 7") || q.includes("pixel 8a") || q.includes("pixel 7a")) return 52999;

  // OnePlus
  if (q.includes("oneplus 13") || q.includes("oneplus 12") || q.includes("oneplus 11")) return 64999;
  if (q.includes("oneplus nord") || q.includes("nord 4") || q.includes("nord ce")) return 27999;

  // Mid-Range & Other Phones
  if (q.includes("nothing phone") || q.includes("iqoo") || q.includes("vivo x") || q.includes("oppo reno") || q.includes("realme gt") || q.includes("xiaomi 14")) {
    return 39999;
  }
  if (q.includes("redmi note") || q.includes("realme") || q.includes("poco") || q.includes("moto g") || q.includes("motorola edge")) {
    return 18999;
  }
  if (q.includes("smartphone") || q.includes("mobile phone") || q.includes("5g phone") || q.includes("phone")) {
    return 24999;
  }

  // Laptops / MacBooks
  if (q.includes("macbook pro")) return 169900;
  if (q.includes("macbook air") || q.includes("macbook")) return 99900;
  if (q.includes("alienware") || q.includes("rog zephyrus") || q.includes("legion pro") || q.includes("msi raider")) return 149900;
  if (q.includes("gaming laptop") || q.includes("rog") || q.includes("tuf gaming") || q.includes("victus") || q.includes("nitro")) return 69900;
  if (q.includes("thinkpad") || q.includes("xps") || q.includes("spectre") || q.includes("zenbook") || q.includes("yoga")) return 89900;
  if (q.includes("laptop") || q.includes("notebook")) return 48900;

  // Tablets & iPads
  if (q.includes("ipad pro")) return 99900;
  if (q.includes("ipad air")) return 59900;
  if (q.includes("ipad")) return 34900;
  if (q.includes("galaxy tab")) return 45900;
  if (q.includes("tablet") || q.includes("tab")) return 18900;

  // Cameras & Photography
  if (q.includes("sony alpha") || q.includes("eos r") || q.includes("nikon z") || q.includes("a7 iv") || q.includes("a7s")) return 189900;
  if (q.includes("gopro") || q.includes("dji pocket") || q.includes("insta360")) return 38900;
  if (q.includes("camera") || q.includes("dslr") || q.includes("mirrorless")) return 64900;

  // Headphones & Audio
  if (q.includes("airpods max")) return 59900;
  if (q.includes("wh-1000xm5") || q.includes("wh-1000xm4") || q.includes("quietcomfort") || q.includes("momentum 4")) return 26990;
  if (q.includes("airpods pro") || q.includes("galaxy buds 3 pro") || q.includes("wf-1000xm5")) return 21900;
  if (q.includes("airpods") || q.includes("galaxy buds")) return 13900;
  if (q.includes("boat rockerz") || q.includes("noise earbuds") || q.includes("boult") || q.includes("realme buds")) return 1699;
  if (q.includes("headphones") || q.includes("earbuds") || q.includes("earphones") || q.includes("headset")) return 2999;

  // Smartwatches
  if (q.includes("apple watch ultra")) return 89900;
  if (q.includes("apple watch") || q.includes("galaxy watch")) return 32900;
  if (q.includes("garmin") || q.includes("fitbit")) return 24900;
  if (q.includes("smartwatch") || q.includes("watch")) return 2499;

  // TVs & Home Entertainment
  if (q.includes("oled tv") || q.includes("qled tv") || q.includes("65 inch") || q.includes("75 inch")) return 119900;
  if (q.includes("55 inch tv") || q.includes("50 inch tv") || q.includes("4k tv")) return 42990;
  if (q.includes("tv") || q.includes("television")) return 21990;

  // Shoes & Apparel
  if (q.includes("air jordan") || q.includes("yeezy") || q.includes("air max") || q.includes("ultraboost")) return 12995;
  if (q.includes("shoes") || q.includes("sneakers") || q.includes("footwear")) return 4499;

  // General Heuristic Fallbacks based on descriptors
  if (q.includes("pro max") || q.includes("ultra") || q.includes("fold")) return 89900;
  if (q.includes("pro") || q.includes("flagship")) return 49900;
  if (q.includes("air") || q.includes("mini") || q.includes("plus")) return 29900;

  return 3999; // Default fallback for unspecified general products
}

/**
 * Validate price against market average and outlier thresholds
 */
export function validateProductPrice(
  productTitle: string,
  priceVal: string | number,
  storeName: string,
  linkUrl?: string,
  peerPrices: number[] = []
): PriceValidationResult {
  const numericPrice = parseNumericPrice(priceVal);
  const formattedPrice = `₹${numericPrice.toLocaleString('en-IN')}`;
  const storeTrust = getStoreTrustScore(storeName, linkUrl);

  // Reject invalid / non-positive price
  if (numericPrice <= 0) {
    return {
      isValid: false,
      numericPrice: 0,
      formattedPrice: "₹0",
      trustScore: storeTrust.trustScore,
      rejectionReason: "Invalid or zero price"
    };
  }

  // Reject store if trust score is below 50
  if (storeTrust.trustScore < 50) {
    return {
      isValid: false,
      numericPrice,
      formattedPrice,
      trustScore: storeTrust.trustScore,
      rejectionReason: `Untrusted store (${storeName}) with trust score ${storeTrust.trustScore}`
    };
  }

  const titleLower = productTitle.toLowerCase();
  
  // Check if item is an accessory (case, cover, tempered glass, cable, adapter)
  const isAccessory = titleLower.includes("case") || 
                      titleLower.includes("cover") || 
                      titleLower.includes("protector") || 
                      titleLower.includes("skin") || 
                      titleLower.includes("cable") || 
                      titleLower.includes("adapter") || 
                      titleLower.includes("charger") || 
                      titleLower.includes("strap") || 
                      titleLower.includes("toy") || 
                      titleLower.includes("pouch") ||
                      titleLower.includes("sleeve");

  const isRefurbished = titleLower.includes("refurbished") || titleLower.includes("used") || titleLower.includes("renewed");

  // Determine market baseline
  let marketPrice = getExpectedMarketPrice(productTitle);

  // If peer prices exist from other trusted stores, compute peer median
  if (peerPrices.length > 0) {
    const validPeers = peerPrices.filter(p => p > 0).sort((a, b) => a - b);
    if (validPeers.length > 0) {
      const mid = Math.floor(validPeers.length / 2);
      const peerMedian = validPeers.length % 2 !== 0 ? validPeers[mid] : Math.round((validPeers[mid - 1] + validPeers[mid]) / 2);
      marketPrice = peerMedian > 0 ? peerMedian : marketPrice;
    }
  }

  // OUTLIER DETECTION FOR HIGH VALUE ELECTRONICS (Phones, Laptops, Cameras, TVs)
  if (marketPrice >= 15000 && !isAccessory && !isRefurbished) {
    const minAcceptablePrice = Math.round(marketPrice * 0.40); // Max 60% discount off market baseline
    if (numericPrice < minAcceptablePrice) {
      console.log(`[Price Outlier Blocked] Title: "${productTitle}", Store: "${storeName}", Price: ${formattedPrice}, Market Baseline: ₹${marketPrice.toLocaleString('en-IN')}, Min Acceptable: ₹${minAcceptablePrice.toLocaleString('en-IN')} (REJECTED AS FAKE PRICE)`);
      return {
        isValid: false,
        numericPrice,
        formattedPrice,
        trustScore: storeTrust.trustScore,
        marketMedianPrice: marketPrice,
        rejectionReason: `Unrealistic low price (${formattedPrice}) for ${productTitle}. Genuine market average is ₹${marketPrice.toLocaleString('en-IN')}.`
      };
    }
  }

  // General outlier detection: price < 25% of market price or > 300% of market price
  if (marketPrice >= 2000 && !isAccessory) {
    if (numericPrice < Math.round(marketPrice * 0.25)) {
      return {
        isValid: false,
        numericPrice,
        formattedPrice,
        trustScore: storeTrust.trustScore,
        marketMedianPrice: marketPrice,
        rejectionReason: `Unrealistic low price detected (${formattedPrice} vs expected market average ₹${marketPrice.toLocaleString('en-IN')})`
      };
    }
    if (numericPrice > Math.round(marketPrice * 3.5)) {
      return {
        isValid: false,
        numericPrice,
        formattedPrice,
        trustScore: storeTrust.trustScore,
        marketMedianPrice: marketPrice,
        rejectionReason: `Excessive price outlier (${formattedPrice} vs market baseline ₹${marketPrice.toLocaleString('en-IN')})`
      };
    }
  }

  return {
    isValid: true,
    numericPrice,
    formattedPrice,
    trustScore: storeTrust.trustScore,
    marketMedianPrice: marketPrice,
    acceptanceReason: `Genuine listing from ${storeTrust.name} (Trust Score: ${storeTrust.trustScore})`
  };
}
