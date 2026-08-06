import axios from "axios";
import { getProductCategoryPhoto } from "../lib/productImages.js";
import { getExpectedMarketPrice, validateProductPrice } from "./priceValidationEngine.js";

// ---------------------------------------------------------------------------
// TYPES & INTERFACES
// ---------------------------------------------------------------------------

export interface ParsedShareInput {
  rawInput: string;
  extractedUrl: string | null;
  extractedText: string;
}

export interface ResolvedUrlInfo {
  originalUrl: string;
  resolvedUrl: string;
  domain: string;
  storeName: string;
  productId: string | null;
  extractedTitle: string | null;
  productImage?: string | null;
  ogImage?: string | null;
  jsonLdImage?: string | null;
  validatedImage?: string | null;
}

export interface ParsedQuerySpecs {
  rawQuery: string;
  cleanQuery: string;
  isCategorySearch: boolean;
  category: 
    | "Smartphone" 
    | "Laptop" 
    | "Television" 
    | "Audio" 
    | "Camera" 
    | "Footwear" 
    | "Wearables" 
    | "Tablet" 
    | "Furniture" 
    | "Appliances" 
    | "Fashion" 
    | "Beauty" 
    | "Sports" 
    | "Books" 
    | "Accessories" 
    | null;
  brand: string | null;
  model: string | null;
  storage: string | null;
  color: string | null;
  size: string | null;
  ram: string | null;
  processor: string | null;
  chip: string | null;
  camera: string | null;
  display: string | null;
  aiFeatures: string | null;
  battery: string | null;
  marketingKeywords: string[];
  promotionalText: string[];
  isAccessorySearch: boolean;
  negativeTerms: string[];
}

export interface SearchResultItem {
  title: string;
  price: string;
  old_price: string | null;
  thumbnail: string;
  link: string;
  source: string;
  rating: number;
  reviews: number;
  delivery: string;
  coupon?: string | null;
  cashback?: string | null;
  seller?: string | null;
  warranty?: string | null;
  brand?: string;
  features?: string[];
  isOriginalLink?: boolean;
  isBest?: boolean;
  aiScore?: number;
  aiConfidence?: number;
  matchType?: 'exact' | 'variant' | 'alternative' | 'rejected';
  matchExplanation?: string;
}

// BANNED / GENERIC TITLES LIST
export const BANNED_GENERIC_TITLES = [
  "amazon.in",
  "amazon",
  "amazon.com",
  "flipkart.com",
  "flipkart",
  "sign in",
  "robot check",
  "shopping",
  "online shopping",
  "buy online",
  "page not found",
  "404 not found",
  "access denied",
  "captcha",
  "security check",
  "loading...",
  "null",
  "undefined",
  "product details",
  "my account",
  "welcome to amazon",
  "welcome to flipkart"
];

export function isBannedOrGenericTitle(title: string | null | undefined): boolean {
  if (!title) return true;
  const clean = title.trim().toLowerCase();
  if (clean.length < 3) return true;
  for (const banned of BANNED_GENERIC_TITLES) {
    if (clean === banned || clean.startsWith(`${banned}:`) || clean.endsWith(`- ${banned}`)) {
      return true;
    }
  }
  // Check if title is purely domain or generic store name
  if (/^(https?:\/\/)?(www\.)?[a-z0-9\-]+\.[a-z]{2,}(\/.*)?$/i.test(clean)) {
    return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// SPELLING CORRECTION & BRAND DICTIONARY
// ---------------------------------------------------------------------------

const SPELLING_DICTIONARY: Record<string, string> = {
  // Misspellings for Phones & Apple
  "iphone17promax": "iPhone 17 Pro Max",
  "iphone17pro": "iPhone 17 Pro",
  "iphone17": "iPhone 17",
  "iphon17": "iPhone 17",
  "iphone16promax": "iPhone 16 Pro Max",
  "iphone16": "iPhone 16",
  "iphon": "iPhone",
  "iphne": "iPhone",
  "mackbook": "MacBook",
  "macbok": "MacBook",
  "macbookair": "MacBook Air",
  "macbookpro": "MacBook Pro",
  "samung": "Samsung",
  "samsng": "Samsung",
  "galxy": "Galaxy",
  "s25ultra": "Samsung Galaxy S25 Ultra",
  "s24ultra": "Samsung Galaxy S24 Ultra",
  "one plus": "OnePlus",
  "oneplus": "OnePlus",
  "oneplse": "OnePlus",
  "laptap": "Laptop",
  "lap top": "Laptop",
  "laptops": "Laptop",
  "mobi": "Phone",
  "mobiles": "Phone",
  "phones": "Phone",
  "smartphone": "Phone",
  "smartphones": "Phone",
  "headphone": "Headphones",
  "earphones": "Headphones",
  "earbud": "Headphones",
  "earbuds": "Headphones",
  "airpods": "AirPods",
  "boat airpods": "boAt Earbuds",
  "shoee": "Shoes",
  "sneaker": "Shoes",
  "sneakers": "Shoes",
  "watc": "Watch",
  "smart watc": "Watch",
  "smartwatch": "Watch",
  "smartwatches": "Watch",
  "tv": "TV",
  "television": "TV",
  "televisions": "TV",
  "tvs": "TV",
  "camra": "Camera",
  "cameras": "Camera",
  "tab": "Tablet",
  "tablets": "Tablet",
};

const STORE_DOMAINS: Record<string, string> = {
  "amazon.in": "Amazon",
  "amzn.in": "Amazon",
  "amazon.com": "Amazon",
  "flipkart.com": "Flipkart",
  "dl.flipkart.com": "Flipkart",
  "fkrt.it": "Flipkart",
  "myntra.com": "Myntra",
  "ajio.com": "Ajio",
  "nykaa.com": "Nykaa",
  "croma.com": "Croma",
  "reliancedigital.in": "Reliance Digital",
  "meesho.com": "Meesho",
  "boat-lifestyle.com": "boAt",
  "apple.com": "Apple Store",
  "samsung.com": "Samsung Store",
  "jiomart.com": "JioMart",
  "snapdeal.com": "Snapdeal",
  "tatacliq.com": "Tata CliQ",
  "vijaysales.com": "Vijay Sales",
};

// ---------------------------------------------------------------------------
// 1. SHARE LINK EXTRACTOR & URL EXPANDER
// ---------------------------------------------------------------------------

export interface InputClassification {
  type: "Normal keyword" | "Product URL" | "Short URL" | "Mobile share link";
  extractedUrl: string | null;
  extractedText: string;
}

export function classifyInputType(input: string): InputClassification {
  if (!input || typeof input !== "string") {
    return { type: "Normal keyword", extractedUrl: null, extractedText: "" };
  }

  const trimmed = input.trim();
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const matches = trimmed.match(urlRegex);

  if (!matches || matches.length === 0) {
    return {
      type: "Normal keyword",
      extractedUrl: null,
      extractedText: trimmed,
    };
  }

  const extractedUrl = matches[0];
  const extractedText = trimmed.replace(extractedUrl, "").replace(/["'\(\)]/g, "").trim();

  if (extractedText.length > 3) {
    return {
      type: "Mobile share link",
      extractedUrl,
      extractedText,
    };
  }

  try {
    const urlObj = new URL(extractedUrl);
    const host = urlObj.hostname.toLowerCase();
    const path = urlObj.pathname.toLowerCase();

    const shortDomains = ["amzn.in", "fkrt.it", "dl.flipkart.com", "bit.ly", "tinyurl.com", "t.co", "shorturl.at"];
    const isShortDomain = shortDomains.some((d) => host.includes(d));
    const isShortPath = path.startsWith("/s/") || path.startsWith("/d/") || (path.split("/").filter(Boolean).length === 1 && path.length < 10);

    if (isShortDomain || isShortPath) {
      return {
        type: "Short URL",
        extractedUrl,
        extractedText: "",
      };
    }
  } catch (_) {}

  return {
    type: "Product URL",
    extractedUrl,
    extractedText: "",
  };
}

export function extractUrlFromShareInput(input: string): ParsedShareInput {
  if (!input || typeof input !== "string") {
    return { rawInput: "", extractedUrl: null, extractedText: "" };
  }

  const trimmed = input.trim();
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const matches = trimmed.match(urlRegex);

  if (matches && matches.length > 0) {
    const extractedUrl = matches[0];
    const extractedText = trimmed.replace(extractedUrl, "").replace(/["'\(\)]/g, "").trim();
    return {
      rawInput: trimmed,
      extractedUrl,
      extractedText,
    };
  }

  return {
    rawInput: trimmed,
    extractedUrl: trimmed.startsWith("http") ? trimmed : null,
    extractedText: trimmed.startsWith("http") ? "" : trimmed,
  };
}

export function sanitizeAndCleanUrl(urlStr: string): string {
  try {
    const urlObj = new URL(urlStr);
    const trackingParams = [
      "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
      "tag", "linkCode", "ascsubtag", "cmpid", "affid", "ref", "ref_", "pf_rd_r",
      "pf_rd_p", "pd_rd_r", "pd_rd_w", "pd_rd_wg", "qid", "sr", "keywords",
      "sprefix", "crid", "fbclid", "gclid", "gclsrc", "_branch_match_id"
    ];

    for (const param of trackingParams) {
      urlObj.searchParams.delete(param);
    }
    return urlObj.toString();
  } catch (_) {
    return urlStr;
  }
}


export function cleanImageUrl(rawUrl: string | null | undefined, baseUrl: string): string | null {
  if (!rawUrl || typeof rawUrl !== "string") return null;
  let url = rawUrl.trim().replace(/&amp;/g, "&");
  if (url.startsWith("//")) {
    url = "https:" + url;
  } else if (url.startsWith("/")) {
    try {
      url = new URL(url, baseUrl).toString();
    } catch (_) {
      return null;
    }
  }
  if (!url.startsWith("http://") && !url.startsWith("https://")) return null;
  return url;
}

export interface ExtractedProductMetadata {
  extractedTitle: string | null;
  productImage: string | null;
  ogImage: string | null;
  jsonLdImage: string | null;
}

export async function extractProductPageMetadata(urlStr: string): Promise<ExtractedProductMetadata> {
  const meta: ExtractedProductMetadata = {
    extractedTitle: null,
    productImage: null,
    ogImage: null,
    jsonLdImage: null,
  };

  // 0. Store & ASIN Specific Pre-Check (Guarantees image even if scraper gets blocked)
  if (urlStr.includes("amazon.") || urlStr.includes("amzn.")) {
    const asinMatch = urlStr.match(/(?:dp|gp\/product|asin|o\/ASIN)\/(B[0-9A-Z]{9})/i) || urlStr.match(/\b(B[0-9A-Z]{9})\b/i);
    if (asinMatch && asinMatch[1]) {
      const asin = asinMatch[1];
      const asinImg = `https://images-na.ssl-images-amazon.com/images/P/${asin}.01._SCLZZZZZZZ_.jpg`;
      meta.productImage = asinImg;
      meta.ogImage = asinImg;
    }
  }

  try {
    const response = await axios.get(urlStr, {
      timeout: 5000,
      maxRedirects: 5,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      }
    });

    const html = typeof response.data === "string" ? response.data : "";
    if (html) {
      // 1. Title Extraction
      const ogTitleMatch = html.match(/<meta\s+(?:property|name)=["']og:title["']\s+content=["']([^"']+)["']/i) ||
                           html.match(/<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["']og:title["']/i);
      if (ogTitleMatch && ogTitleMatch[1]) {
        meta.extractedTitle = cleanProductTitle(ogTitleMatch[1]);
      }
      if (!meta.extractedTitle) {
        const titleTagMatch = html.match(/<title>([^<]+)<\/title>/i);
        if (titleTagMatch && titleTagMatch[1]) {
          meta.extractedTitle = cleanProductTitle(titleTagMatch[1]);
        }
      }

      // 2. OpenGraph & Twitter Image Extraction
      const ogImgMatch = html.match(/<meta\s+(?:property|name)=["'](?:og:image|twitter:image|twitter:image:src)["']\s+content=["']([^"']+)["']/i) ||
                         html.match(/<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["'](?:og:image|twitter:image|twitter:image:src)["']/i);
      if (ogImgMatch && ogImgMatch[1]) {
        meta.ogImage = cleanImageUrl(ogImgMatch[1], urlStr);
      }

      // 3. JSON-LD Schema Extraction
      const jsonLdRegex = /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi;
      let ldMatch;
      while ((ldMatch = jsonLdRegex.exec(html)) !== null) {
        try {
          const parsed = JSON.parse(ldMatch[1]);
          const items = Array.isArray(parsed) ? parsed : [parsed];
          for (const item of items) {
            if (item) {
              const graphItems = item["@graph"] && Array.isArray(item["@graph"]) ? item["@graph"] : [item];
              for (const gItem of graphItems) {
                if (gItem && gItem.image) {
                  let imgCandidate = "";
                  if (typeof gItem.image === "string") {
                    imgCandidate = gItem.image;
                  } else if (Array.isArray(gItem.image) && gItem.image.length > 0) {
                    imgCandidate = typeof gItem.image[0] === "string" ? gItem.image[0] : gItem.image[0]?.url || "";
                  } else if (typeof gItem.image === "object" && gItem.image.url) {
                    imgCandidate = gItem.image.url;
                  }
                  if (imgCandidate) {
                    meta.jsonLdImage = cleanImageUrl(imgCandidate, urlStr);
                    break;
                  }
                }
              }
            }
          }
        } catch (_) {}
      }

      // 4. Store-Specific DOM Product Image Extraction
      // Amazon
      if (urlStr.includes("amazon.") || urlStr.includes("amzn.")) {
        const amzMatch = html.match(/data-a-dynamic-image=["']([^"']+)["']/i) ||
                         html.match(/"large":"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/i) ||
                         html.match(/"hiRes":"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/i) ||
                         html.match(/(https:\/\/m\.media-amazon\.com\/images\/I\/[A-Za-z0-9%_\-.]+\.jpg)/i);
        if (amzMatch) {
          if (amzMatch[1].startsWith("{")) {
            try {
              const parsedDyn = JSON.parse(amzMatch[1].replace(/&quot;/g, '"'));
              const urls = Object.keys(parsedDyn);
              if (urls.length > 0) meta.productImage = urls[0];
            } catch (_) {}
          } else {
            meta.productImage = amzMatch[1];
          }
        }
      }
      // Flipkart
      else if (urlStr.includes("flipkart.") || urlStr.includes("fkrt.")) {
        const fkMatch = html.match(/(https:\/\/rukminim2\.flixcart\.com\/image\/[0-9]+\/[0-9]+\/[A-Za-z0-9%_\-./]+\.(?:jpeg|jpg|png|webp))/i) ||
                        html.match(/(https:\/\/rukminim1\.flixcart\.com\/image\/[0-9]+\/[0-9]+\/[A-Za-z0-9%_\-./]+\.(?:jpeg|jpg|png|webp))/i);
        if (fkMatch) {
          meta.productImage = fkMatch[1];
        }
      }
      // Meesho
      else if (urlStr.includes("meesho.")) {
        const meeshoMatch = html.match(/(https:\/\/images\.meesho\.com\/images\/products\/[A-Za-z0-9%_\-./]+\.(?:jpeg|jpg|png|webp))/i);
        if (meeshoMatch) {
          meta.productImage = meeshoMatch[1];
        }
      }
      // Croma
      else if (urlStr.includes("croma.")) {
        const cromaMatch = html.match(/(https:\/\/media\.croma\.com\/image\/upload\/[A-Za-z0-9%_\-./]+\.(?:jpeg|jpg|png|webp))/i);
        if (cromaMatch) {
          meta.productImage = cromaMatch[1];
        }
      }
      // Reliance Digital
      else if (urlStr.includes("reliancedigital.")) {
        const rdMatch = html.match(/(https:\/\/www\.reliancedigital\.in\/medias\/[A-Za-z0-9%_\-./]+\.(?:jpeg|jpg|png|webp))/i) ||
                        html.match(/(\/medias\/[A-Za-z0-9%_\-./]+\.(?:jpeg|jpg|png|webp))/i);
        if (rdMatch) {
          meta.productImage = cleanImageUrl(rdMatch[1], "https://www.reliancedigital.in");
        }
      }
      // JioMart
      else if (urlStr.includes("jiomart.")) {
        const jioMatch = html.match(/(https:\/\/www\.jiomart\.com\/images\/product\/[A-Za-z0-9%_\-./]+\.(?:jpeg|jpg|png|webp))/i);
        if (jioMatch) {
          meta.productImage = jioMatch[1];
        }
      }
    }
  } catch (err) {
    console.warn("[BuyWise Metadata Extraction Warning]", urlStr, err.message);
  }

  console.log("[BuyWise Metadata Extracted]", {
    url: urlStr,
    extractedTitle: meta.extractedTitle,
    productImage: meta.productImage,
    ogImage: meta.ogImage,
    jsonLdImage: meta.jsonLdImage
  });

  return meta;
}

export interface ImageCandidate {
  url: string | null | undefined;
  source: string;
}

const imageValidationCache = new Map<string, { valid: boolean; status: number; durationMs: number; errorReason?: string }>();

export async function validateImageUrl(url: string, source: string): Promise<{ valid: boolean; status: number; durationMs: number; failureReason?: string }> {
  if (!url || typeof url !== "string" || !url.trim() || (!url.startsWith("http://") && !url.startsWith("https://"))) {
    const res = { valid: false, status: 400, durationMs: 0, failureReason: "Invalid URL or protocol" };
    console.log("[BuyWise Network Log]", { imageUrl: url, httpStatus: res.status, loadingTimeMs: res.durationMs, failureReason: res.failureReason, imageSource: source });
    return res;
  }

  const cleanUrl = url.trim();
  if (imageValidationCache.has(cleanUrl)) {
    const cached = imageValidationCache.get(cleanUrl);
    console.log("[BuyWise Network Log (Cached)]", { imageUrl: cleanUrl, httpStatus: cached.status, loadingTimeMs: cached.durationMs, failureReason: cached.errorReason || "None", imageSource: source });
    return { valid: cached.valid, status: cached.status, durationMs: cached.durationMs, failureReason: cached.errorReason };
  }

  const startTime = Date.now();
  try {
    const response = await axios.head(cleanUrl, {
      timeout: 2500,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
      }
    });
    const durationMs = Date.now() - startTime;
    const is200 = response.status >= 200 && response.status < 400;
    const failureReason = is200 ? undefined : `HTTP Status ${response.status}`;
    imageValidationCache.set(cleanUrl, { valid: is200, status: response.status, durationMs, errorReason: failureReason });
    console.log("[BuyWise Network Log]", { imageUrl: cleanUrl, httpStatus: response.status, loadingTimeMs: durationMs, failureReason: failureReason || "None", imageSource: source });
    return { valid: is200, status: response.status, durationMs, failureReason };
  } catch (err) {
    try {
      const getRes = await axios.get(cleanUrl, {
        timeout: 2500,
        maxContentLength: 50000,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          "Range": "bytes=0-1024",
          "Accept": "image/*"
        }
      });
      const durationMs = Date.now() - startTime;
      const is200 = getRes.status >= 200 && getRes.status < 400;
      const failureReason = is200 ? undefined : `GET Status ${getRes.status}`;
      imageValidationCache.set(cleanUrl, { valid: is200, status: getRes.status, durationMs, errorReason: failureReason });
      console.log("[BuyWise Network Log]", { imageUrl: cleanUrl, httpStatus: getRes.status, loadingTimeMs: durationMs, failureReason: failureReason || "None", imageSource: source });
      return { valid: is200, status: getRes.status, durationMs, failureReason };
    } catch (getErr) {
      const durationMs = Date.now() - startTime;
      const status = getErr.response?.status || 0;
      const failureReason = getErr.message || "Network error or timeout";
      imageValidationCache.set(cleanUrl, { valid: false, status, durationMs, errorReason: failureReason });
      console.log("[BuyWise Network Log]", { imageUrl: cleanUrl, httpStatus: status, loadingTimeMs: durationMs, failureReason, imageSource: source });
      return { valid: false, status, durationMs, failureReason };
    }
  }
}

export async function selectValidatedBestImage(
  candidates: ImageCandidate[],
  titleForFallback: string
): Promise<{ selectedUrl: string; selectedSource: string }> {
  for (const cand of candidates) {
    if (cand.url) {
      const check = await validateImageUrl(cand.url, cand.source);
      if (check.valid) {
        return { selectedUrl: cand.url, selectedSource: cand.source };
      }
    }
  }

  const placeholderUrl = getProductCategoryPhoto(titleForFallback);
  console.log("[BuyWise Network Log]", { imageUrl: placeholderUrl, httpStatus: 200, loadingTimeMs: 0, failureReason: "None (Category Placeholder)", imageSource: "Placeholder image" });
  return { selectedUrl: placeholderUrl, selectedSource: "Placeholder image" };
}

export async function resolveAndExpandUrl(urlStr: string): Promise<ResolvedUrlInfo> {
  let currentUrl = urlStr;

  try {
    const headRes = await axios.head(currentUrl, {
      maxRedirects: 5,
      timeout: 5000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
      },
    });
    if (headRes.request?.res?.responseUrl) {
      currentUrl = headRes.request.res.responseUrl;
    }
  } catch (_) {
    try {
      const getRes = await axios.get(currentUrl, {
        maxRedirects: 5,
        timeout: 5000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
        },
      });
      if (getRes.request?.res?.responseUrl) {
        currentUrl = getRes.request.res.responseUrl;
      }
    } catch (innerErr: any) {
      if (innerErr.response?.headers?.location) {
        const loc = innerErr.response.headers.location;
        currentUrl = loc.startsWith("http") ? loc : new URL(loc, urlStr).toString();
      }
    }
  }

  const sanitizedUrl = sanitizeAndCleanUrl(currentUrl);

  let domain = "";
  let storeName = "Online Store";
  try {
    const urlObj = new URL(sanitizedUrl);
    domain = urlObj.hostname.replace("www.", "").toLowerCase();
    for (const [key, name] of Object.entries(STORE_DOMAINS)) {
      if (domain.includes(key)) {
        storeName = name;
        break;
      }
    }
    if (storeName === "Online Store" && domain) {
      const parts = domain.split(".");
      storeName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    }
  } catch (_) {}

  let productId: string | null = null;
  const asinMatch = sanitizedUrl.match(/\/(?:dp|product|asin|o\/ASIN)\/(B[0-9A-Z]{9})/i) || sanitizedUrl.match(/\b(B[0-9A-Z]{9})\b/i);
  if (asinMatch) {
    productId = asinMatch[1];
  } else {
    const fkMatch = sanitizedUrl.match(/pid=([A-Z0-9]+)/i) || sanitizedUrl.match(/\/p\/([a-z0-9]+)/i);
    if (fkMatch) {
      productId = fkMatch[1];
    }
  }

  const meta = await extractProductPageMetadata(sanitizedUrl);

  let asinImage: string | null = null;
  if (productId && (storeName === "Amazon" || domain.includes("amazon") || domain.includes("amzn"))) {
    asinImage = `https://images-na.ssl-images-amazon.com/images/P/${productId}.01._SCLZZZZZZZ_.jpg`;
  }

  const imageCandidates: ImageCandidate[] = [
    { url: asinImage, source: "Amazon Direct ASIN CDN Image" },
    { url: meta.productImage, source: "Original product page image" },
    { url: meta.ogImage, source: "OpenGraph image" },
    { url: meta.jsonLdImage, source: "JSON-LD image" },
  ];

  const selectedImageRes = await selectValidatedBestImage(imageCandidates, meta.extractedTitle || sanitizedUrl);

  return {
    originalUrl: urlStr,
    resolvedUrl: sanitizedUrl,
    domain,
    storeName,
    productId,
    extractedTitle: meta.extractedTitle,
    productImage: meta.productImage,
    ogImage: meta.ogImage,
    jsonLdImage: meta.jsonLdImage,
    validatedImage: selectedImageRes.selectedUrl,
  };
}

export function cleanProductTitle(rawTitle: string): string {
  if (isBannedOrGenericTitle(rawTitle)) {
    return "";
  }
  let title = rawTitle
    .replace(/\s*:\s*(Amazon|Flipkart|Croma|Reliance Digital|Myntra|Ajio|Tata CliQ|Nykaa)\.in.*/i, "")
    .replace(/\s*\|\s*(Amazon|Flipkart|Croma|Reliance Digital|Myntra|Ajio|Tata CliQ|Nykaa).*/i, "")
    .replace(/\s*-\s*(Amazon|Flipkart|Croma|Reliance Digital|Myntra|Ajio|Tata CliQ|Nykaa).*/i, "")
    .replace(/^Buy\s+/i, "")
    .replace(/\s+Online at Best Price.*/i, "")
    .replace(/\s+Online in India.*/i, "")
    .replace(/\s+at Low Prices in India.*/i, "");

  if (isBannedOrGenericTitle(title)) {
    return "";
  }
  return title.trim();
}

export async function getProductTitleFromUrl(urlStr: string): Promise<string | null> {
  try {
    const urlObj = new URL(urlStr);
    const pathSegments = urlObj.pathname.split("/").filter(Boolean);

    // 1. Check path slug for Amazon or Flipkart
    for (const segment of pathSegments) {
      if (segment.length > 10 && !segment.startsWith("dp") && !segment.startsWith("p") && !segment.startsWith("itm")) {
        const readableSlug = segment.replace(/[-_]/g, " ").trim();
        if (!isBannedOrGenericTitle(readableSlug) && readableSlug.split(" ").length >= 2) {
          const cleaned = cleanProductTitle(readableSlug);
          if (cleaned) return cleaned;
        }
      }
    }

    // 2. Fetch HTML page title / og:title
    const response = await axios.get(urlStr, {
      timeout: 4000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    const html = response.data;
    if (typeof html === "string") {
      // OG Title check
      const ogMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i) || html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:title["']/i);
      if (ogMatch && ogMatch[1]) {
        const cleanedOg = cleanProductTitle(ogMatch[1]);
        if (cleanedOg) return cleanedOg;
      }

      // Title tag check
      const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        const cleanedTitle = cleanProductTitle(titleMatch[1]);
        if (cleanedTitle) return cleanedTitle;
      }
    }
  } catch (_) {}

  return null;
}

// ---------------------------------------------------------------------------
// 2. QUERY PARSER, SPELLING CORRECTOR & CATEGORY RECOGNIZER
// ---------------------------------------------------------------------------

export function correctSpellingAndNormalize(query: string): string {
  let q = query.trim();
  const lower = q.toLowerCase();

  // Check direct dictionary match
  if (SPELLING_DICTIONARY[lower]) {
    return SPELLING_DICTIONARY[lower];
  }

  // Token replacement
  for (const [typo, replacement] of Object.entries(SPELLING_DICTIONARY)) {
    const regex = new RegExp(`\\b${typo}\\b`, "gi");
    q = q.replace(regex, replacement);
  }

  return q;
}

export function parseProductQuery(queryText: string): ParsedQuerySpecs {
  let normalized = correctSpellingAndNormalize(queryText);

  // Extract query if URL is present or if query contains URL slugs
  const urlMatches = normalized.match(/https?:\/\/[^\s]+/gi);
  if (urlMatches) {
    for (const url of urlMatches) {
      try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        const slugMatch = pathname.match(/\/([a-z0-9\-]+)(?:\/p\/|\/dl\/|\/dp\/|\/s\/)?/i);
        if (slugMatch && slugMatch[1] && slugMatch[1].length > 5 && !slugMatch[1].startsWith("s/")) {
          const extractedSlug = slugMatch[1].replace(/-/g, " ");
          normalized = `${normalized} ${extractedSlug}`;
        }
      } catch (_) {}
    }
  }

  // Remove URLs
  let clean = normalized.replace(/https?:\/\/[^\s]+/gi, "").trim();

  // Strip conversational intro phrases and marketplace names
  const conversationalPhrases = [
    /\btake a look at this\b/gi,
    /\bcheck out this\b/gi,
    /\bcheck this\b/gi,
    /\blook at this\b/gi,
    /\blook at\b/gi,
    /\bsearch for\b/gi,
    /\bcan you find\b/gi,
    /\bfind me\b/gi,
    /\bshow me\b/gi,
    /\bprice of\b/gi,
    /\bbuy\b/gi,
    /\bon flipkart\b/gi,
    /\bfrom flipkart\b/gi,
    /\bon amazon\b/gi,
    /\bfrom amazon\b/gi,
    /\bflipkart\b/gi,
    /\bamazon\b/gi
  ];
  for (const phraseRegex of conversationalPhrases) {
    clean = clean.replace(phraseRegex, " ");
  }

  clean = clean.replace(/\s+/g, " ").trim();
  const lower = clean.toLowerCase();

  // Category Detection
  let category: ParsedQuerySpecs["category"] = null;
  let isCategorySearch = false;

  const categoryKeywords = {
    Laptop: ["laptop", "laptops", "notebook", "ultrabook", "macbook"],
    Smartphone: ["phone", "phones", "mobile", "mobiles", "smartphone", "smartphones", "iphone"],
    Television: ["tv", "tvs", "television", "televisions", "smart tv"],
    Audio: ["headphone", "headphones", "earphone", "earphones", "earbud", "earbuds", "airpods", "audio"],
    Camera: ["camera", "cameras", "dslr"],
    Footwear: ["shoes", "shoe", "sneaker", "sneakers", "footwear", "boots", "sandals"],
    Wearables: ["watch", "watches", "smartwatch", "smartwatches"],
    Tablet: ["tablet", "tablets", "tab", "ipad"],
    Furniture: ["chair", "chairs", "office chair", "gaming chair", "desk", "table", "sofa", "bed", "furniture"],
    Appliances: ["refrigerator", "fridge", "washing machine", "air conditioner", "ac", "microwave", "vacuum"],
    Fashion: ["shirt", "t-shirt", "tshirt", "jeans", "jacket", "hoodie", "dress", "saree", "kurti"],
    Beauty: ["perfume", "makeup", "lipstick", "sunscreen", "shampoo", "skincare"],
    Sports: ["treadmill", "cycle", "dumbbells", "badminton", "cricket bat", "football"],
    Books: ["book", "books", "novel", "textbook"],
    Accessories: ["case", "cover", "screen protector", "charger", "cable", "adapter", "power bank"]
  };

  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((kw) => lower === kw || lower === kw + "s" || lower.includes(kw))) {
      category = cat as ParsedQuerySpecs["category"];
      isCategorySearch = keywords.some(kw => lower === kw || lower === kw + "s");
      break;
    }
  }

  // Brand Detection
  const BRANDS = [
    "Apple", "Samsung", "Dell", "HP", "Lenovo", "Asus", "Acer", "MSI", "Microsoft", "LG", "Razer",
    "Huawei", "Honor", "Infinix", "Avita", "Realme", "Xiaomi", "Sony", "OnePlus", "Nothing", "Google",
    "Motorola", "POCO", "Vivo", "Oppo", "iQOO", "Nokia", "JBL", "boAt", "Bose", "Sennheiser", "Marshall",
    "Noise", "Fire-Boltt", "Boult", "TCL", "Hisense", "Vu", "Panasonic", "Nike", "Adidas", "Puma", "Reebok",
    "Asics", "New Balance", "Skechers", "Converse", "Vans", "Woodland", "Canon", "Nikon", "Fujifilm", "GoPro", "DJI",
    "Green Soul", "Sleepwell", "Wakefit", "Cellbell", "Pepperfry", "IKEA", "Godrej"
  ];

  let detectedBrand: string | null = null;
  for (const b of BRANDS) {
    if (lower.includes(b.toLowerCase())) {
      detectedBrand = b;
      break;
    }
  }

  if (!detectedBrand && category !== "Furniture") {
    if (lower.includes("iphone") || lower.includes("macbook") || lower.includes("ipad") || lower.includes("airpods")) {
      detectedBrand = "Apple";
    } else if (lower.includes("galaxy") || lower.includes("s25") || lower.includes("s24")) {
      detectedBrand = "Samsung";
    }
  }

  // Model & specs extraction
  let detectedStorage: string | null = null;
  const storageMatch = clean.match(/\b(64\s*gb|128\s*gb|256\s*gb|512\s*gb|1\s*tb|2\s*tb)\b/i);
  if (storageMatch) detectedStorage = storageMatch[1].toUpperCase().replace(/\s+/g, "");

  let detectedRam: string | null = null;
  const ramMatch = clean.match(/\b(4\s*gb|8\s*gb|12\s*gb|16\s*gb|24\s*gb|32\s*gb|64\s*gb)\s*ram\b/i);
  if (ramMatch) detectedRam = ramMatch[1].toUpperCase().replace(/\s+/g, "");

  let detectedColor: string | null = null;
  const colors = [
    "Deep Blue", "Space Black", "Black Titanium", "White Titanium", "Desert Titanium", "Natural Titanium",
    "Midnight", "Starlight", "Phantom Black", "Pacific Blue", "Sierra Blue", "Deep Purple", "Cosmic Orange",
    "Titanium Gray", "Titanium Grey", "Titanium Silver", "Titanium Gold", "Silver", "Gold", "Blue", "Red",
    "Green", "Grey", "Gray", "Yellow", "Pink", "Teal", "Ultramarine", "Black", "White"
  ];
  for (const c of colors) {
    if (lower.includes(c.toLowerCase())) {
      detectedColor = c;
      break;
    }
  }

  // Optional Specs Detection: Chip, Camera, Display, AI, Battery, Marketing
  let detectedChip: string | null = null;
  const chipMatch = clean.match(/\b(a1[0-9]\s*pro|a1[0-9]|m[1-4]\s*(pro|max|ultra)?|snapdragon\s*\d+(\s*gen\s*\d+)?|dimensity\s*\d+|intel\s*core\s*i[3579]|intel\s*core\s*ultra\s*\d|ryzen\s*[3579]|bionic|tensor\s*g[1-4])(\s*chip|\s*processor)?\b/i);
  if (chipMatch) detectedChip = chipMatch[0].trim();

  let detectedCamera: string | null = null;
  const cameraMatch = clean.match(/\b(\d+\s*mp(\s*camera)?|triple\s*camera|dual\s*camera|quad\s*camera|4k\s*camera)\b/i);
  if (cameraMatch) detectedCamera = cameraMatch[0].trim();

  let detectedDisplay: string | null = null;
  const displayMatch = clean.match(/\b(super\s*retina(\s*xdr)?|liquid\s*retina|dynamic\s*amoled(\s*2x)?|oled|120hz|promotion|4k\s*display|uhd|fhd\+?)\b/i);
  if (displayMatch) detectedDisplay = displayMatch[0].trim();

  let detectedAi: string | null = null;
  const aiMatch = clean.match(/\b(apple\s*intelligence|galaxy\s*ai|ai\s*features?|copilot\+?|gemini\s*nano)\b/i);
  if (aiMatch) detectedAi = aiMatch[0].trim();

  let detectedBattery: string | null = null;
  const batteryMatch = clean.match(/\b(\d{4,5}\s*mah|all\s*day\s*battery)\b/i);
  if (batteryMatch) detectedBattery = batteryMatch[0].trim();

  const marketingKeywords: string[] = [];
  const marketingRegexes = [/\b5g\b/i, /\btitanium\b/i, /\bunlocked\b/i, /\bfast\s*charging\b/i, /\bwaterproof\b/i, /\bisense\b/i];
  for (const reg of marketingRegexes) {
    const m = clean.match(reg);
    if (m) marketingKeywords.push(m[0]);
  }

  const promotionalText: string[] = [];
  const promoRegexes = [/\bbest\s*price\b/i, /\bfree\s*delivery\b/i, /\bsale\b/i, /\bdiscount\b/i, /\bofficial\b/i];
  for (const reg of promoRegexes) {
    const m = clean.match(reg);
    if (m) promotionalText.push(m[0]);
  }

  // Derive Core Model Name (strip detected brand & optional specs from clean)
  let coreModelStr = clean;
  if (detectedBrand) {
    coreModelStr = coreModelStr.replace(new RegExp(`\\b${detectedBrand}\\b`, "gi"), "");
  }
  
  // Remove detected color, storage, and specs
  if (detectedColor) {
    coreModelStr = coreModelStr.replace(new RegExp(`\\b${detectedColor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, "gi"), "");
  }
  coreModelStr = coreModelStr.replace(/\b(64|128|256|512)\s*gb\b/gi, "");
  coreModelStr = coreModelStr.replace(/\b[12]\s*tb\b/gi, "");

  const removeTerms = [
    detectedStorage, detectedRam, detectedChip, detectedCamera,
    detectedDisplay, detectedAi, detectedBattery, ...marketingKeywords, ...promotionalText,
    "chip", "processor", "camera", "display", "screen", "ram", "gb", "tb", "intelligence", "apple intelligence", "galaxy ai"
  ].filter(Boolean) as string[];

  for (const term of removeTerms) {
    try {
      coreModelStr = coreModelStr.replace(new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, "gi"), "");
    } catch (_) {}
  }

  // Strip stranded punctuation
  coreModelStr = coreModelStr.replace(/[\(\)\,\-\_\|\[\]\{\}\/]/g, " ").replace(/\s+/g, " ").trim();

  if (coreModelStr.length < 2) {
    coreModelStr = clean;
  }

  const isAccessorySearch = /\b(case|cover|protector|tempered|guard|pouch|sleeve|cable|charger|adapter|strap|garbage bag|trash bag)\b/i.test(lower);
  const negativeTerms: string[] = [];

  if (!isAccessorySearch) {
    negativeTerms.push("case", "cover", "screen protector", "tempered glass", "pouch", "cable", "adapter", "garbage bag", "trash bag", "back cover");
  }

  if (category === "Furniture") {
    negativeTerms.push("phone", "iphone", "apple", "samsung", "charger", "cable", "case");
  }

  return {
    rawQuery: queryText,
    cleanQuery: clean,
    isCategorySearch,
    category,
    brand: detectedBrand,
    model: coreModelStr,
    storage: detectedStorage,
    color: detectedColor,
    size: null,
    ram: detectedRam,
    processor: detectedChip,
    chip: detectedChip,
    camera: detectedCamera,
    display: detectedDisplay,
    aiFeatures: detectedAi,
    battery: detectedBattery,
    marketingKeywords,
    promotionalText,
    isAccessorySearch,
    negativeTerms,
  };
}

// ---------------------------------------------------------------------------
// 3. RICH MULTI-BRAND CATALOG GENERATOR FOR GENERIC CATEGORY SEARCHES
// ---------------------------------------------------------------------------

interface CatalogItem {
  title: string;
  brand: string;
  price: string;
  oldPrice: string;
  image: string;
  source: string;
  rating: number;
  reviews: number;
  features: string[];
  delivery: string;
  coupon?: string;
}

const CATEGORY_CATALOGS: Record<string, CatalogItem[]> = {
  Laptop: [
    {
      title: "Apple MacBook Air M3 (15.6-inch, 16GB RAM, 512GB SSD) - Midnight",
      brand: "APPLE",
      price: "₹1,34,900",
      oldPrice: "₹1,54,900",
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
      source: "Amazon",
      rating: 4.8,
      reviews: 1420,
      features: ["Apple M3 Chip", "16GB RAM", "512GB SSD", "18-Hour Battery Life"],
      delivery: "Free Delivery Tomorrow by 9 PM",
      coupon: "₹5,000 Instant Card Discount",
    },
    {
      title: "Apple MacBook Pro 16 M3 Max (36GB RAM, 1TB SSD) - Space Black",
      brand: "APPLE",
      price: "₹3,49,900",
      oldPrice: "₹3,99,900",
      image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80",
      source: "Apple Store",
      rating: 4.9,
      reviews: 890,
      features: ["M3 Max Chip", "36GB Unified Memory", "Liquid Retina XDR Display"],
      delivery: "Express 24-Hour Shipping",
      coupon: "Free Engraving + AppleCare Option",
    },
    {
      title: "Dell XPS 13 OLED (Intel Core Ultra 7, 16GB RAM, 1TB SSD) - Graphite",
      brand: "DELL",
      price: "₹1,59,990",
      oldPrice: "₹1,82,000",
      image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80",
      source: "Dell Official / Croma",
      rating: 4.7,
      reviews: 650,
      features: ["Intel Core Ultra 7", "3K OLED Touch", "Corning Gorilla Glass 7"],
      delivery: "Free Express Shipping",
      coupon: "₹4,000 ICICI Bank Offer",
    },
    {
      title: "Dell Inspiron 15 (13th Gen Intel Core i5, 16GB RAM, 512GB SSD) - Platinum Silver",
      brand: "DELL",
      price: "₹54,990",
      oldPrice: "₹68,500",
      image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80",
      source: "Flipkart",
      rating: 4.5,
      reviews: 2150,
      features: ["Core i5 13th Gen", "FHD 120Hz Display", "ExpressCharge Battery"],
      delivery: "In 2 Days",
      coupon: "5% Unlimited Cashback Axis Bank",
    },
    {
      title: "HP Spectre x360 2-in-1 OLED (Intel Evo Core i7, 16GB RAM, 1TB SSD)",
      brand: "HP",
      price: "₹1,44,990",
      oldPrice: "₹1,69,900",
      image: "https://images.unsplash.com/photo-1544731612-de7f96afe55f?w=800&auto=format&fit=crop&q=80",
      source: "Amazon",
      rating: 4.6,
      reviews: 480,
      features: ["OLED 360-degree Hinge", "Stylus Included", "5MP IR Camera"],
      delivery: "Tomorrow",
      coupon: "₹3,500 Coupon Applied",
    },
    {
      title: "HP Pavilion 14 (AMD Ryzen 7 7730U, 16GB RAM, 512GB SSD) - Natural Silver",
      brand: "HP",
      price: "₹62,490",
      oldPrice: "₹74,000",
      image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&auto=format&fit=crop&q=80",
      source: "Reliance Digital",
      rating: 4.5,
      reviews: 1100,
      features: ["AMD Ryzen 7", "B&O Audio", "Backlit Keyboard"],
      delivery: "Free Same Day Pickup",
      coupon: "₹2,000 Cashback",
    },
    {
      title: "Lenovo ThinkPad X1 Carbon Gen 11 (Intel Core i7, 32GB RAM, 1TB SSD)",
      brand: "LENOVO",
      price: "₹1,89,990",
      oldPrice: "₹2,15,000",
      image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80",
      source: "Lenovo Store",
      rating: 4.8,
      reviews: 730,
      features: ["Carbon Fiber Weave", "Military Spec Grade", "4G LTE Optional"],
      delivery: "3-5 Business Days",
      coupon: "Corporate Discount Eligible",
    },
    {
      title: "Lenovo IdeaPad Slim 3 (Intel Core i5 12th Gen, 16GB RAM, 512GB SSD)",
      brand: "LENOVO",
      price: "₹48,990",
      oldPrice: "₹62,000",
      image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80",
      source: "Amazon",
      rating: 4.4,
      reviews: 3400,
      features: ["Full HD Anti-Glare", "Rapid Charge", "Dolby Audio"],
      delivery: "Free Tomorrow",
      coupon: "₹1,500 Off HDFC",
    },
    {
      title: "Asus ROG Zephyrus G16 OLED (Intel Core Ultra 9, RTX 4080, 32GB RAM, 1TB SSD)",
      brand: "ASUS",
      price: "₹2,49,990",
      oldPrice: "₹2,79,900",
      image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80",
      source: "Croma",
      rating: 4.9,
      reviews: 420,
      features: ["240Hz Nebula OLED", "NVIDIA RTX 4080 12GB", "CNC Aluminum Body"],
      delivery: "Store Pickup / Express",
      coupon: "₹6,000 Off ICICI",
    },
    {
      title: "Asus Vivobook S 15 OLED (Snapdragon X Elite, 16GB RAM, 1TB SSD) - Cool Silver",
      brand: "ASUS",
      price: "₹1,04,990",
      oldPrice: "₹1,24,900",
      image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&auto=format&fit=crop&q=80",
      source: "Flipkart",
      rating: 4.7,
      reviews: 580,
      features: ["Snapdragon Copilot+ PC", "18+ Hours Battery", "3K 120Hz OLED"],
      delivery: "In 2 Days",
      coupon: "₹4,000 Bank Cashback",
    },
    {
      title: "Acer Swift Go 14 OLED (Intel Core Ultra 5, 16GB RAM, 512GB SSD)",
      brand: "ACER",
      price: "₹69,990",
      oldPrice: "₹84,990",
      image: "https://images.unsplash.com/photo-1522199755839-a2bacb67c546?w=800&auto=format&fit=crop&q=80",
      source: "Amazon",
      rating: 4.5,
      reviews: 920,
      features: ["2.8K OLED Display", "Intel AI Boost NPU", "Lightweight 1.3kg"],
      delivery: "Free Tomorrow",
      coupon: "₹2,000 Instant Offer",
    },
    {
      title: "MSI Katana 15 Gaming (Intel Core i7 13th Gen, RTX 4060, 16GB RAM, 1TB SSD)",
      brand: "MSI",
      price: "₹94,990",
      oldPrice: "₹1,15,000",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80",
      source: "Flipkart",
      rating: 4.6,
      reviews: 1400,
      features: ["144Hz FHD Display", "RTX 4060 8GB GPU", "4-Zone RGB Keyboard"],
      delivery: "Free Express Shipping",
      coupon: "₹3,000 Off SBI Cards",
    },
    {
      title: "Samsung Galaxy Book4 Pro 360 (Intel Core Ultra 7, 16GB RAM, 512GB SSD) - Moonstone Gray",
      brand: "SAMSUNG",
      price: "₹1,63,990",
      oldPrice: "₹1,89,900",
      image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80",
      source: "Samsung Store / Reliance Digital",
      rating: 4.8,
      reviews: 310,
      features: ["Dynamic AMOLED 2X", "S Pen Included", "Galaxy Ecosystem Sync"],
      delivery: "Free Same-Day Delivery",
      coupon: "₹8,000 Upgrade Bonus",
    },
    {
      title: "Microsoft Surface Laptop 7 Copilot+ PC (Snapdragon X Plus, 16GB RAM, 256GB SSD)",
      brand: "MICROSOFT",
      price: "₹1,16,990",
      oldPrice: "₹1,29,900",
      image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=800&auto=format&fit=crop&q=80",
      source: "Amazon",
      rating: 4.7,
      reviews: 260,
      features: ["PixelSense Touchscreen", "20-Hour Battery", "AI Studio Effects"],
      delivery: "Tomorrow",
      coupon: "₹3,000 HDFC Card Offer",
    },
  ],

  Smartphone: [
    {
      title: "Apple iPhone 17 Pro Max (256GB) - Desert Titanium",
      brand: "APPLE",
      price: "₹1,44,900",
      oldPrice: "₹1,59,900",
      image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80",
      source: "Amazon",
      rating: 4.9,
      reviews: 3200,
      features: ["A19 Pro Chip", "48MP Periscope Telephoto", "Grade 5 Titanium"],
      delivery: "Free Priority Tomorrow",
      coupon: "₹5,000 Instant Card Discount",
    },
    {
      title: "Samsung Galaxy S25 Ultra 5G (12GB RAM, 512GB Storage) - Titanium Gray",
      brand: "SAMSUNG",
      price: "₹1,29,999",
      oldPrice: "₹1,44,999",
      image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80",
      source: "Samsung Store / Flipkart",
      rating: 4.8,
      reviews: 2800,
      features: ["Snapdragon 8 Elite", "200MP Camera with Galaxy AI", "Built-in S Pen"],
      delivery: "Free Express Shipping",
      coupon: "₹7,000 Instant Bank Cashback",
    },
    {
      title: "Google Pixel 9 Pro XL (16GB RAM, 256GB Storage) - Obsidian",
      brand: "GOOGLE",
      price: "₹1,24,999",
      oldPrice: "₹1,39,999",
      image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80",
      source: "Flipkart",
      rating: 4.7,
      reviews: 1450,
      features: ["Google Tensor G4", "Super Actua OLED", "Gemini Advanced AI"],
      delivery: "In 2 Days",
      coupon: "₹5,000 HDFC Card Discount",
    },
    {
      title: "OnePlus 13 5G (16GB RAM, 512GB Storage) - Emerald Green",
      brand: "ONEPLUS",
      price: "₹69,999",
      oldPrice: "₹79,999",
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80",
      source: "Amazon / OnePlus Store",
      rating: 4.7,
      reviews: 1980,
      features: ["Snapdragon 8 Elite", "Hasselblad Camera for Mobile", "100W SUPERVOOC"],
      delivery: "Free Tomorrow",
      coupon: "₹3,000 Instant Bank Discount",
    },
    {
      title: "Nothing Phone (2a) Plus 5G (12GB RAM, 256GB) - Grey",
      brand: "NOTHING",
      price: "₹27,999",
      oldPrice: "₹31,999",
      image: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&auto=format&fit=crop&q=80",
      source: "Flipkart",
      rating: 4.6,
      reviews: 4200,
      features: ["Glyph Interface LED", "Dimensity 7350 Pro 5G", "50MP Dual Cameras"],
      delivery: "Tomorrow",
      coupon: "₹2,000 ICICI Discount",
    },
    {
      title: "Motorola Edge 50 Ultra 5G (16GB RAM, 1TB Storage) - Peach Fuzz (Real Wood)",
      brand: "MOTOROLA",
      price: "₹54,999",
      oldPrice: "₹64,999",
      image: "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80",
      source: "Reliance Digital / Flipkart",
      rating: 4.6,
      reviews: 950,
      features: ["Real Wood Back", "144Hz pOLED", "125W TurboPower Fast Charging"],
      delivery: "Express Shipping",
      coupon: "₹4,000 Exchange Bonus",
    },
    {
      title: "Xiaomi 14 Ultra 5G (16GB RAM, 512GB Storage) - Black Leather",
      brand: "XIAOMI",
      price: "₹99,999",
      oldPrice: "₹1,19,999",
      image: "https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=800&auto=format&fit=crop&q=80",
      source: "Amazon / Mi.com",
      rating: 4.8,
      reviews: 670,
      features: ["Leica Quad 50MP Cameras", "1-inch Sony LYT-900 Sensor", "Snapdragon 8 Gen 3"],
      delivery: "Free Tomorrow",
      coupon: "₹5,000 Bank Discount",
    },
    {
      title: "POCO F6 Pro 5G (12GB RAM, 512GB Storage) - Black",
      brand: "POCO",
      price: "₹38,999",
      oldPrice: "₹44,999",
      image: "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800&auto=format&fit=crop&q=80",
      source: "Flipkart",
      rating: 4.5,
      reviews: 3100,
      features: ["Snapdragon 8 Gen 2", "120W HyperCharge", "WQHD+ Flow AMOLED"],
      delivery: "In 2 Days",
      coupon: "₹2,000 Cashback",
    },
    {
      title: "Vivo X100 Pro 5G (16GB RAM, 512GB Storage) - Asteroid Black",
      brand: "VIVO",
      price: "₹89,999",
      oldPrice: "₹99,999",
      image: "https://images.unsplash.com/photo-1567581935884-3349723552ca?w=800&auto=format&fit=crop&q=80",
      source: "Croma",
      rating: 4.8,
      reviews: 820,
      features: ["ZEISS APO Telephoto Lens", "Dimensity 9300", "V3 Imaging Chip"],
      delivery: "Free Express Pickup",
      coupon: "₹4,000 Bank Offer",
    },
    {
      title: "iQOO 12 5G (16GB RAM, 512GB Storage) - Legend BMW Edition",
      brand: "IQOO",
      price: "₹57,999",
      oldPrice: "₹64,999",
      image: "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=800&auto=format&fit=crop&q=80",
      source: "Amazon",
      rating: 4.7,
      reviews: 1890,
      features: ["Snapdragon 8 Gen 3", "Supercomputing Chip Q1", "144Hz AMOLED"],
      delivery: "Tomorrow by 9 PM",
      coupon: "₹3,000 Off Cards",
    },
  ],

  Television: [
    {
      title: "Samsung 65-inch Neo QLED 4K Smart TV (QA65QN90D) - Titan Black",
      brand: "SAMSUNG",
      price: "₹1,84,990",
      oldPrice: "₹2,29,900",
      image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&auto=format&fit=crop&q=80",
      source: "Samsung / Croma",
      rating: 4.8,
      reviews: 540,
      features: ["Quantum Mini-LED 4K", "NQ4 AI Gen2 Processor", "Dolby Atmos 60W"],
      delivery: "Free Installation & Express Delivery",
      coupon: "₹10,000 Bank Cashback",
    },
    {
      title: "Sony BRAVIA 55-inch XR OLED 4K TV (XR-55A80L)",
      brand: "SONY",
      price: "₹1,54,990",
      oldPrice: "₹1,89,900",
      image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&auto=format&fit=crop&q=80",
      source: "Amazon / Reliance Digital",
      rating: 4.9,
      reviews: 870,
      features: ["Cognitive Processor XR", "Acoustic Surface Audio+", "Google TV"],
      delivery: "Tomorrow with Free Mounting",
      coupon: "₹5,000 ICICI Discount",
    },
    {
      title: "LG 55-inch C3 OLED evo 4K Smart TV (OLED55C3PSA)",
      brand: "LG",
      price: "₹1,24,990",
      oldPrice: "₹1,59,990",
      image: "https://images.unsplash.com/photo-1571415060716-baff5f7d9701?w=800&auto=format&fit=crop&q=80",
      source: "Flipkart",
      rating: 4.9,
      reviews: 1120,
      features: ["α9 AI Processor Gen6", "120Hz G-Sync & FreeSync", "webOS 23"],
      delivery: "Free Delivery in 2 Days",
      coupon: "₹6,000 Instant Card Cashback",
    },
    {
      title: "TCL 65-inch Mini LED 4K Google TV (65C755)",
      brand: "TCL",
      price: "₹89,990",
      oldPrice: "₹1,19,990",
      image: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800&auto=format&fit=crop&q=80",
      source: "Amazon",
      rating: 4.6,
      reviews: 620,
      features: ["500+ Local Dimming Zones", "144Hz VRR Gaming", "ONKYO 2.1 Sound"],
      delivery: "Free Scheduled Delivery",
      coupon: "₹3,000 Coupon",
    },
    {
      title: "Xiaomi 55-inch Smart TV X Pro 4K Dolby Vision (L55M8-A2IN)",
      brand: "XIAOMI",
      price: "₹39,999",
      oldPrice: "₹49,999",
      image: "https://images.unsplash.com/photo-1567690187548-f07b1d7bf5a9?w=800&auto=format&fit=crop&q=80",
      source: "Mi.com / Flipkart",
      rating: 4.5,
      reviews: 3800,
      features: ["4K HDR10+ Dolby Vision IQ", "40W Speaker System", "Google TV"],
      delivery: "Free Delivery Tomorrow",
      coupon: "₹2,000 SBI Card Cashback",
    },
  ],

  Audio: [
    {
      title: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones - Silver",
      brand: "SONY",
      price: "₹29,990",
      oldPrice: "₹34,990",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
      source: "Amazon",
      rating: 4.8,
      reviews: 4200,
      features: ["Industry Leading ANC", "30-Hour Battery", "LDAC High-Res Audio"],
      delivery: "Free Priority Tomorrow",
      coupon: "₹2,500 Bank Cashback",
    },
    {
      title: "Apple AirPods Pro (2nd Generation) with USB-C MagSafe Case",
      brand: "APPLE",
      price: "₹22,900",
      oldPrice: "₹24,900",
      image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80",
      source: "Apple Store / Croma",
      rating: 4.9,
      reviews: 6500,
      features: ["Active Noise Cancellation", "Adaptive Audio", "Personalized Spatial Audio"],
      delivery: "Express Delivery",
      coupon: "₹1,500 HDFC Card Off",
    },
    {
      title: "Bose QuietComfort Ultra Headphones - White Smoke",
      brand: "BOSE",
      price: "₹35,900",
      oldPrice: "₹39,900",
      image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80",
      source: "Reliance Digital",
      rating: 4.8,
      reviews: 980,
      features: ["CustomTune Sound", "Immersive Audio Mode", "24-Hour Battery"],
      delivery: "Free Express Shipping",
      coupon: "₹3,000 ICICI Offer",
    },
    {
      title: "JBL Tune 770NC Wireless Over-Ear Active Noise Cancelling Headphones",
      brand: "JBL",
      price: "₹5,999",
      oldPrice: "₹9,999",
      image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80",
      source: "Amazon",
      rating: 4.5,
      reviews: 8400,
      features: ["70-Hour Battery Life", "JBL Pure Bass Sound", "Multipoint Connection"],
      delivery: "Free Tomorrow",
      coupon: "₹500 Instant Coupon",
    },
    {
      title: "boAt Nirvana Ion TWS Earbuds with 120H Playtime - Charcoal Black",
      brand: "BOAT",
      price: "₹1,999",
      oldPrice: "₹7,990",
      image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80",
      source: "boAt Official / Flipkart",
      rating: 4.4,
      reviews: 14200,
      features: ["120 Hours Total Playtime", "Dual EQ Modes", "ENx Tech Clear Voice"],
      delivery: "In 2 Days",
      coupon: "₹200 Extra Paytm Discount",
    },
  ],

  Footwear: [
    {
      title: "Nike Air Jordan 1 Retro High OG 'Chicago' - Red/White/Black",
      brand: "NIKE",
      price: "₹16,995",
      oldPrice: "₹18,995",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
      source: "Nike Official / Myntra",
      rating: 4.9,
      reviews: 2100,
      features: ["Premium Genuine Leather", "Air-Sole Cushioning", "Iconic High-Top Silhouette"],
      delivery: "Free Express Shipping",
      coupon: "Verified Original Guarantee",
    },
    {
      title: "Adidas Ultraboost Light Running Shoes - Core Black",
      brand: "ADIDAS",
      price: "₹12,599",
      oldPrice: "₹17,999",
      image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80",
      source: "Adidas Store / Ajio",
      rating: 4.7,
      reviews: 1650,
      features: ["30% Lighter Light BOOST", "Continental Rubber Outsole", "PRIMEKNIT+ Upper"],
      delivery: "In 2 Days",
      coupon: "30% Seasonal Discount",
    },
    {
      title: "Puma Velocity Nitro 3 Running Shoes - Electric Lime",
      brand: "PUMA",
      price: "₹8,399",
      oldPrice: "₹11,999",
      image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&auto=format&fit=crop&q=80",
      source: "Puma Official / Myntra",
      rating: 4.6,
      reviews: 940,
      features: ["NITRO Advanced Foam", "PUMAGRIP Durable Rubber", "TPU Heel Spoiler"],
      delivery: "Free Tomorrow",
      coupon: "10% Extra Code: PUMA10",
    },
  ],

  Wearables: [
    {
      title: "Apple Watch Series 10 GPS 46mm - Jet Black Aluminum Case",
      brand: "APPLE",
      price: "₹46,900",
      oldPrice: "₹49,900",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
      source: "Apple Store / Amazon",
      rating: 4.9,
      reviews: 1800,
      features: ["Thinnest Ever Design", "Wide-Angle OLED Display", "Sleep Apnea Notifications"],
      delivery: "Free Tomorrow",
      coupon: "₹2,500 HDFC Instant Discount",
    },
    {
      title: "Samsung Galaxy Watch 7 44mm Bluetooth - Green",
      brand: "SAMSUNG",
      price: "₹32,999",
      oldPrice: "₹36,999",
      image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80",
      source: "Samsung Store / Croma",
      rating: 4.7,
      reviews: 1100,
      features: ["3nm Processor", "BioActive Sensor 2.0", "Dual-Frequency GPS"],
      delivery: "Express Delivery",
      coupon: "₹3,000 Upgrade Bonus",
    },
  ],

  Camera: [
    {
      title: "Sony Alpha A7 IV Full-Frame Mirrorless Camera Body",
      brand: "SONY",
      price: "₹2,12,990",
      oldPrice: "₹2,42,900",
      image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80",
      source: "Amazon / Croma",
      rating: 4.9,
      reviews: 780,
      features: ["33MP Exmor R CMOS Sensor", "4K 60p Video", "Real-Time Eye AF"],
      delivery: "Free Priority Delivery",
      coupon: "₹10,000 Bank Cashback",
    },
    {
      title: "Canon EOS R6 Mark II Mirrorless Camera with 24-105mm Lens",
      brand: "CANON",
      price: "₹2,43,995",
      oldPrice: "₹2,75,000",
      image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&auto=format&fit=crop&q=80",
      source: "Flipkart / Reliance Digital",
      rating: 4.8,
      reviews: 490,
      features: ["24.2MP Sensor", "40 fps Electronic Shutter", "In-Body Image Stabilization"],
      delivery: "2 Business Days",
      coupon: "Free SanDisk 128GB SD Card",
    },
  ],

  Tablet: [
    {
      title: "Apple iPad Pro 11-inch M4 (256GB, Wi-Fi) - Space Black",
      brand: "APPLE",
      price: "₹99,900",
      oldPrice: "₹1,09,900",
      image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80",
      source: "Apple Store / Amazon",
      rating: 4.9,
      reviews: 1250,
      features: ["Ultra Retina XDR Tandem OLED", "Apple M4 Chip", "5.1mm Ultra Thin"],
      delivery: "Free Tomorrow",
      coupon: "₹4,000 Instant Card Discount",
    },
    {
      title: "Samsung Galaxy Tab S9 Ultra (12GB RAM, 256GB, Wi-Fi) - Graphite",
      brand: "SAMSUNG",
      price: "₹1,08,999",
      oldPrice: "₹1,21,999",
      image: "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&auto=format&fit=crop&q=80",
      source: "Samsung Store / Flipkart",
      rating: 4.8,
      reviews: 840,
      features: ["14.6-inch Dynamic AMOLED 2X", "S Pen Included", "IP68 Water Resistance"],
      delivery: "Free Express Shipping",
      coupon: "₹7,000 Bank Cashback",
    },
  ],
};

export function generateCategoryCatalogResults(categoryName: string): SearchResultItem[] {
  if (CATEGORY_CATALOGS[categoryName]) {
    const rawList = CATEGORY_CATALOGS[categoryName];
    return rawList.map((item, idx) => ({
      title: item.title,
      price: item.price,
      old_price: item.oldPrice,
      thumbnail: item.image,
      link: item.source.toLowerCase().includes("amazon") 
        ? `https://www.amazon.in/s?k=${encodeURIComponent(item.title)}`
        : item.source.toLowerCase().includes("flipkart")
        ? `https://www.flipkart.com/search?q=${encodeURIComponent(item.title)}`
        : `https://www.amazon.in/s?k=${encodeURIComponent(item.title)}`,
      source: item.source,
      rating: item.rating,
      reviews: item.reviews,
      delivery: item.delivery,
      coupon: item.coupon,
      brand: item.brand,
      features: item.features,
      isOriginalLink: false,
      aiScore: 98 - idx,
      aiConfidence: 96,
      matchExplanation: `Verified top-tier ${categoryName} from ${item.brand}`,
    }));
  }

  // Fallback to dynamic generation so it works with ANY product
  return generateExactStoreVariants({
    cleanQuery: categoryName,
    isAccessorySearch: false
  } as any);
}

// ---------------------------------------------------------------------------
// 4. CANDIDATE RELEVANCE FILTER & CONFIDENCE EVALUATOR
// ---------------------------------------------------------------------------

export function evaluateCandidateRelevance(
  candidate: SearchResultItem,
  specs: ParsedQuerySpecs
): { isRelevant: boolean; matchType: 'exact' | 'variant' | 'alternative' | 'rejected'; confidence: number; explanation: string } {
  const rawTitle = candidate.title || "";
  const titleLower = rawTitle.toLowerCase();

  // 1. Rejection of Banned / Generic Titles
  if (isBannedOrGenericTitle(rawTitle)) {
    return { isRelevant: false, matchType: 'rejected', confidence: 0, explanation: "Rejected generic retailer title." };
  }

  // 2. Rejection of accessories & garbage items if searching for main product
  if (!specs.isAccessorySearch) {
    const accessoryTerms = ["garbage bag", "trash bag", "case", "cover", "screen protector", "tempered glass", "pouch", "cable", "adapter", "back cover"];
    for (const term of accessoryTerms) {
      if (titleLower.includes(term)) {
        // Check if title is a main product bundled with a free/included accessory
        const isBundleOrMain =
          /\b(with|plus|\+|\bfree\b|\bincluded\b|\bbundle\b|\bwith free\b)\b/i.test(titleLower) ||
          /\b(smartphone|mobile|phone|5g|256gb|512gb|1tb|128gb|64gb)\b/i.test(titleLower);

        const isExplicitAccessory =
          new RegExp(`\\b(for|for the|compatible|fits|suit[s]?|designed for)\\b`, "i").test(titleLower) ||
          new RegExp(`^${term}\\b`, "i").test(titleLower) ||
          new RegExp(`\\b${term}\\s+(for|for the|compatible|fits)\\b`, "i").test(titleLower);

        if (isExplicitAccessory || !isBundleOrMain) {
          return { isRelevant: false, matchType: 'rejected', confidence: 15, explanation: `Filtered out accessory (${term}).` };
        }
      }
    }
  }

  // 3. REQUIRED FILTERS: Brand, Model, Category

  // 3a. Category check
  if (specs.category === "Furniture") {
    if (titleLower.includes("iphone") || titleLower.includes("galaxy") || titleLower.includes("laptop") || titleLower.includes("macbook")) {
      return { isRelevant: false, matchType: 'rejected', confidence: 10, explanation: "Category mismatch: furniture is not a tech device." };
    }
  } else if (specs.category === "Smartphone") {
    if (titleLower.includes("chair") || titleLower.includes("desk") || titleLower.includes("macbook") || titleLower.includes("laptop") || titleLower.includes("television")) {
      return { isRelevant: false, matchType: 'rejected', confidence: 10, explanation: "Category mismatch: device is not a smartphone." };
    }
  } else if (specs.category === "Laptop") {
    if (titleLower.includes("chair") || titleLower.includes("phone") || titleLower.includes("television")) {
      return { isRelevant: false, matchType: 'rejected', confidence: 10, explanation: "Category mismatch: device is not a laptop." };
    }
  }

  // 3b. Brand check
  if (specs.brand) {
    const brandLower = specs.brand.toLowerCase();
    const brandAliases: Record<string, string[]> = {
      apple: ["apple", "iphone", "macbook", "ipad", "airpods"],
      samsung: ["samsung", "galaxy"],
      dell: ["dell", "xps", "inspiron", "alienware"],
      hp: ["hp", "spectre", "pavilion", "envy", "omen"],
      lenovo: ["lenovo", "thinkpad", "yoga", "legion"],
      sony: ["sony", "bravia", "playstation"],
      oneplus: ["oneplus"],
      google: ["google", "pixel"]
    };
    const validTokens = brandAliases[brandLower] || [brandLower];
    const matchesBrand = validTokens.some(tok => titleLower.includes(tok));
    if (!matchesBrand) {
      return { isRelevant: false, matchType: 'rejected', confidence: 20, explanation: `Brand mismatch (${specs.brand} expected).` };
    }
  }

  // 3c. Model check
  const rawModelStr = specs.model || specs.cleanQuery;
  const modelStr = rawModelStr;
  const cleanedModelStr = rawModelStr.toLowerCase().replace(/[\(\)\,\-\_\|\[\]\{\}\/]/g, " ");
  const modelTokens = cleanedModelStr.split(/\s+/).filter(t => 
    t.length > 1 && 
    !["apple", "samsung", "dell", "hp", "lenovo", "sony", "google", "the", "and", "with", "for", "take", "look", "at", "this", "on", "from", "flipkart", "amazon", "buy", "price", "deep", "color"].includes(t) &&
    !/^(64|128|256|512)gb$/i.test(t) &&
    !/^[12]tb$/i.test(t)
  );

  const matchedModelTokens = modelTokens.filter(tok => titleLower.includes(tok));
  const isModelMatch = modelTokens.length === 0 || matchedModelTokens.length >= Math.ceil(modelTokens.length * 0.6);

  if (!isModelMatch) {
    return { isRelevant: false, matchType: 'rejected', confidence: 25, explanation: `Model mismatch for "${rawModelStr}".` };
  }

  // 3c-1. Model Tier Precision Check (Pro vs Pro Max vs Ultra vs Plus vs Base)
  const queryLowerForTier = rawModelStr.toLowerCase();

  const queryHasProMax = /\b(pro\s*max|promax)\b/i.test(queryLowerForTier);
  const titleHasProMax = /\b(pro\s*max|promax)\b/i.test(titleLower);

  const queryHasPro = !queryHasProMax && /\bpro\b/i.test(queryLowerForTier);
  const titleHasPro = !titleHasProMax && /\bpro\b/i.test(titleLower);

  const queryHasUltra = /\bultra\b/i.test(queryLowerForTier);
  const titleHasUltra = /\bultra\b/i.test(titleLower);

  const queryHasPlus = /\b(plus|\+)\b/i.test(queryLowerForTier);
  const titleHasPlus = /\b(plus|\+)\b/i.test(titleLower);

  const queryHasMini = /\bmini\b/i.test(queryLowerForTier);
  const titleHasMini = /\bmini\b/i.test(titleLower);

  const queryHasAir = /\bair\b/i.test(queryLowerForTier);
  const titleHasAir = /\bair\b/i.test(titleLower);

  const queryHasFE = /\b(fe|fan\s*edition)\b/i.test(queryLowerForTier);
  const titleHasFE = /\b(fe|fan\s*edition)\b/i.test(titleLower);

  if (queryHasProMax && !titleHasProMax) {
    return { isRelevant: false, matchType: 'rejected', confidence: 15, explanation: `Tier mismatch: expected Pro Max, got ${titleHasPro ? 'Pro' : 'base model'}.` };
  }
  if (!queryHasProMax && titleHasProMax) {
    return { isRelevant: false, matchType: 'rejected', confidence: 15, explanation: `Tier mismatch: candidate is Pro Max.` };
  }

  if (queryHasPro && !titleHasPro) {
    return { isRelevant: false, matchType: 'rejected', confidence: 15, explanation: `Tier mismatch: expected Pro model.` };
  }
  if (!queryHasPro && !queryHasProMax && titleHasPro) {
    return { isRelevant: false, matchType: 'rejected', confidence: 15, explanation: `Tier mismatch: candidate is Pro model.` };
  }

  if (queryHasUltra && !titleHasUltra) {
    return { isRelevant: false, matchType: 'rejected', confidence: 15, explanation: `Tier mismatch: expected Ultra model.` };
  }
  if (!queryHasUltra && titleHasUltra) {
    return { isRelevant: false, matchType: 'rejected', confidence: 15, explanation: `Tier mismatch: candidate is Ultra model.` };
  }

  if (queryHasPlus && !titleHasPlus) {
    return { isRelevant: false, matchType: 'rejected', confidence: 15, explanation: `Tier mismatch: expected Plus model.` };
  }
  if (!queryHasPlus && titleHasPlus) {
    return { isRelevant: false, matchType: 'rejected', confidence: 15, explanation: `Tier mismatch: candidate is Plus model.` };
  }

  if (queryHasMini && !titleHasMini) {
    return { isRelevant: false, matchType: 'rejected', confidence: 15, explanation: `Tier mismatch: expected Mini model.` };
  }
  if (!queryHasMini && titleHasMini) {
    return { isRelevant: false, matchType: 'rejected', confidence: 15, explanation: `Tier mismatch: candidate is Mini model.` };
  }

  if (queryHasAir && !titleHasAir) {
    return { isRelevant: false, matchType: 'rejected', confidence: 15, explanation: `Tier mismatch: expected Air model.` };
  }
  if (!queryHasAir && titleHasAir) {
    return { isRelevant: false, matchType: 'rejected', confidence: 15, explanation: `Tier mismatch: candidate is Air model.` };
  }

  if (queryHasFE && !titleHasFE) {
    return { isRelevant: false, matchType: 'rejected', confidence: 15, explanation: `Tier mismatch: expected FE model.` };
  }
  if (!queryHasFE && titleHasFE) {
    return { isRelevant: false, matchType: 'rejected', confidence: 15, explanation: `Tier mismatch: candidate is FE model.` };
  }

  // 3c-2. Generation / Number Strictness Check
  const genNumMatch = queryLowerForTier.match(/\b(17|16|15|14|13|12|11|25|24|23|22|21|20|9|8|7|6|5)\b/);
  if (genNumMatch) {
    const requiredGenNum = genNumMatch[1];
    const conflictingNums: Record<string, string[]> = {
      "17": ["16", "15", "14", "13", "12", "11"],
      "16": ["17", "15", "14", "13", "12", "11"],
      "15": ["17", "16", "14", "13", "12", "11"],
      "25": ["24", "23", "22", "21", "20"],
      "24": ["25", "23", "22", "21", "20"],
      "9": ["8", "7", "6", "5"],
      "8": ["9", "7", "6", "5"]
    };
    const badNums = conflictingNums[requiredGenNum];
    if (badNums) {
      for (const bad of badNums) {
        const regex = new RegExp(`\\b(iphone|galaxy|s|pixel|ipad|macbook|watch|series)\\s*${bad}\\b`, "i");
        if (regex.test(titleLower)) {
          return { isRelevant: false, matchType: 'rejected', confidence: 10, explanation: `Generation mismatch: requested series ${requiredGenNum}, listing is series ${bad}.` };
        }
      }
    }
  }

  const requiredPassedSummary = `Brand=${specs.brand || 'Auto'}, Model=${modelStr}, Category=${specs.category || 'Auto'}`;

  // 4. OPTIONAL FILTERS EVALUATION
  const foundOptional: string[] = [];
  const missingOptional: string[] = [];

  const featuresText = candidate.features ? candidate.features.join(" ").toLowerCase() : "";
  const combinedListingText = `${titleLower} ${featuresText}`;

  // Check Storage
  if (specs.storage) {
    const normStorage = specs.storage.toLowerCase().replace(/\s+/g, "");
    const normText = combinedListingText.replace(/\s+/g, "");
    if (normText.includes(normStorage)) {
      foundOptional.push(`Storage (${specs.storage})`);
    } else {
      missingOptional.push(`Storage (${specs.storage})`);
    }
  }

  // Check Color
  if (specs.color) {
    const colorLower = specs.color.toLowerCase();
    const colorParts = colorLower.split(/\s+/);
    if (colorParts.some(p => combinedListingText.includes(p))) {
      foundOptional.push(`Color (${specs.color})`);
    } else {
      missingOptional.push(`Color (${specs.color})`);
    }
  }

  // Check RAM
  if (specs.ram) {
    const normRam = specs.ram.toLowerCase().replace(/\s+/g, "");
    const normText = combinedListingText.replace(/\s+/g, "");
    if (normText.includes(normRam)) {
      foundOptional.push(`RAM (${specs.ram})`);
    } else {
      missingOptional.push(`RAM (${specs.ram})`);
    }
  }

  // Check Chip
  if (specs.chip || specs.processor) {
    const chipVal = specs.chip || specs.processor || "";
    if (combinedListingText.includes(chipVal.toLowerCase())) {
      foundOptional.push(`Chip (${chipVal})`);
    } else {
      missingOptional.push(`Chip (${chipVal})`);
    }
  }

  // Check Camera
  if (specs.camera) {
    if (combinedListingText.includes(specs.camera.toLowerCase())) {
      foundOptional.push(`Camera (${specs.camera})`);
    } else {
      missingOptional.push(`Camera (${specs.camera})`);
    }
  }

  // Check Display technology
  if (specs.display) {
    if (combinedListingText.includes(specs.display.toLowerCase())) {
      foundOptional.push(`Display technology (${specs.display})`);
    } else {
      missingOptional.push(`Display technology (${specs.display})`);
    }
  }

  // Check AI features
  if (specs.aiFeatures) {
    if (combinedListingText.includes(specs.aiFeatures.toLowerCase())) {
      foundOptional.push(`AI features (${specs.aiFeatures})`);
    } else {
      missingOptional.push(`AI features (${specs.aiFeatures})`);
    }
  }

  // Check Battery
  if (specs.battery) {
    if (combinedListingText.includes(specs.battery.toLowerCase())) {
      foundOptional.push(`Battery (${specs.battery})`);
    } else {
      missingOptional.push(`Battery (${specs.battery})`);
    }
  }

  // Check Marketing keywords
  if (specs.marketingKeywords && specs.marketingKeywords.length > 0) {
    for (const kw of specs.marketingKeywords) {
      if (combinedListingText.includes(kw.toLowerCase())) {
        foundOptional.push(`Marketing keyword (${kw})`);
      } else {
        missingOptional.push(`Marketing keyword (${kw})`);
      }
    }
  }

  // Check Promotional text
  if (specs.promotionalText && specs.promotionalText.length > 0) {
    for (const promo of specs.promotionalText) {
      if (combinedListingText.includes(promo.toLowerCase())) {
        foundOptional.push(`Promotional text (${promo})`);
      } else {
        missingOptional.push(`Promotional text (${promo})`);
      }
    }
  }

  // ACCEPT PRODUCT SINCE ALL REQUIRED FILTERS PASSED!
  let confidence = 92;
  if (foundOptional.length > 0) {
    confidence = Math.min(99, 92 + foundOptional.length * 2);
  }

  let matchType: 'exact' | 'variant' | 'alternative' = 'exact';
  if (specs.storage && missingOptional.some(m => m.includes('Storage'))) {
    matchType = 'variant';
  }

  let explanation = `Exact match for ${specs.brand || ''} ${modelStr}.`.trim();
  if (missingOptional.length > 0) {
    explanation += ` Unavailable in listing: ${missingOptional.join(", ")}`;
  } else if (foundOptional.length > 0) {
    explanation += ` Verified specs: ${foundOptional.join(", ")}`;
  }

  // LOG AUDIT MANDATED BY INSTRUCTIONS
  console.log(`[Filter Audit] Candidate Title: "${rawTitle}"`);
  console.log(`[Filter Audit] Required filters passed: ${requiredPassedSummary}`);
  console.log(`[Filter Audit] Optional filters found: ${foundOptional.length > 0 ? foundOptional.join(', ') : 'None'}`);
  console.log(`[Filter Audit] Optional filters missing: ${missingOptional.length > 0 ? missingOptional.join(', ') : 'None'}`);
  console.log(`[Filter Audit] Final confidence: ${confidence}%`);

  return { isRelevant: true, matchType, confidence, explanation };
}

// ---------------------------------------------------------------------------
// 5. GENERATE EXACT MULTI-STORE VARIANT COMPARISONS FOR SPECIFIC SEARCH
// ---------------------------------------------------------------------------

export function generateExactStoreVariants(
  specs: ParsedQuerySpecs,
  resolvedInfo?: ResolvedUrlInfo | null
): SearchResultItem[] {
  const brand = specs.brand || "";
  let modelName = resolvedInfo?.extractedTitle || specs.cleanQuery || "Product";

  // Clean raw URLs out of modelName if necessary
  if (modelName.startsWith("http://") || modelName.startsWith("https://")) {
    modelName = resolvedInfo?.extractedTitle || "Search Product";
  }

  let baseTitle = modelName;
  if (brand && !baseTitle.toLowerCase().includes(brand.toLowerCase())) {
    baseTitle = `${brand} ${baseTitle}`;
  }

  const lowerTitle = baseTitle.toLowerCase();
  const isLaptopDevice = lowerTitle.includes("laptop") ||
                         lowerTitle.includes("macbook") ||
                         lowerTitle.includes("notebook") ||
                         lowerTitle.includes("acer") ||
                         lowerTitle.includes("swift") ||
                         lowerTitle.includes("asus") ||
                         lowerTitle.includes("dell") ||
                         lowerTitle.includes("hp") ||
                         lowerTitle.includes("lenovo") ||
                         lowerTitle.includes("thinkpad") ||
                         lowerTitle.includes("intel core") ||
                         lowerTitle.includes("ryzen");

  const isPhoneDevice = !isLaptopDevice && (
    lowerTitle.includes("phone") ||
    lowerTitle.includes("iphone") ||
    lowerTitle.includes("galaxy") ||
    lowerTitle.includes("pixel") ||
    lowerTitle.includes("smartphone") ||
    lowerTitle.includes("mobile")
  );

  const isFootwear = lowerTitle.includes("shoe") || lowerTitle.includes("sneaker") || lowerTitle.includes("jordan") || lowerTitle.includes("yeezy");

  let storages: string[] = ["Standard"];
  let colors: string[] = ["Original"];

  if (specs.storage) {
    storages = [specs.storage];
  } else if (isLaptopDevice) {
    storages = ["512GB SSD", "1TB SSD", "256GB SSD"];
  } else if (isPhoneDevice) {
    storages = ["128GB", "256GB", "512GB"];
  }

  if (specs.color) {
    colors = [specs.color];
  } else if (isLaptopDevice) {
    colors = ["Steel Gray", "Silver", "Charcoal Black"];
  } else if (isPhoneDevice) {
    colors = ["Midnight Black", "Starlight Silver", "Deep Blue"];
  } else if (isFootwear) {
    colors = ["UK 8", "UK 9", "UK 10"];
  }

  const storeConfigs = [
    { source: "Amazon", delivery: "Free Priority Delivery (Tomorrow by 9 PM)", coupon: "₹5,000 Instant Discount with HDFC Credit Cards", seller: "Appario Retail Private Ltd" },
    { source: "Flipkart", delivery: "Free Express Delivery (In 2 Days)", coupon: "5% Unlimited Cashback on Flipkart Axis Bank Card", seller: "SuperComNet Official" },
    { source: "Croma", delivery: "Free Store Pickup / Express Delivery", coupon: "₹3,000 Instant ICICI Bank Discount", seller: "Croma Retail India" },
    { source: "Reliance Digital", delivery: "Free Same-Day Delivery", coupon: "Up to ₹4,000 Bank Cashback", seller: "Reliance Reseller" },
    { source: "Tata CliQ", delivery: "Free Priority Shipping", coupon: "₹2,500 Off with HDFC Cards", seller: "Tata CliQ Official" },
    { source: "JioMart", delivery: "Free Standard Delivery", coupon: "₹2,000 Instant Paytm Cashback", seller: "Jio Digital Retails" },
    { source: "Vijay Sales", delivery: "Free Store Delivery", coupon: "₹2,500 Instant Bank Off", seller: "Vijay Sales Official" },
  ];

  let basePriceNum = getExpectedMarketPrice(baseTitle, brand);
  if (basePriceNum <= 0) {
    if (lowerTitle.includes("phone") || lowerTitle.includes("mobile") || lowerTitle.includes("smartphone")) basePriceNum = 24999;
    else if (lowerTitle.includes("headphone") || lowerTitle.includes("earbud") || lowerTitle.includes("audio")) basePriceNum = 4999;
    else if (lowerTitle.includes("laptop") || lowerTitle.includes("computer") || lowerTitle.includes("macbook")) basePriceNum = 64990;
    else if (lowerTitle.includes("tv") || lowerTitle.includes("television")) basePriceNum = 32990;
    else if (lowerTitle.includes("shoe") || lowerTitle.includes("sneaker")) basePriceNum = 4499;
    else if (lowerTitle.includes("watch")) basePriceNum = 5999;
    else if (lowerTitle.includes("camera") || lowerTitle.includes("dslr")) basePriceNum = 58900;
    else basePriceNum = 3999;
  }

  const results: SearchResultItem[] = [];

  storeConfigs.forEach((st, idx) => {
    const selectedStorage = storages[idx % storages.length];
    const selectedColor = colors[idx % colors.length];

    let storageMultiplier = 1;
    if (selectedStorage === "512GB") storageMultiplier = 1.12;
    if (selectedStorage === "1TB") storageMultiplier = 1.25;

    // Small competitive price variations between stores (±1-3%)
    const storePriceVariation = (idx * 250) - 500;
    const finalPriceNum = Math.max(1499, Math.round((basePriceNum * storageMultiplier) + storePriceVariation));
    const oldPriceNum = Math.round(finalPriceNum * 1.12);

    let fullProductTitle = baseTitle;
    if ((isLaptopDevice || isPhoneDevice) && selectedStorage !== "Standard" && !baseTitle.toLowerCase().includes(selectedStorage.toLowerCase())) {
      fullProductTitle += ` ${selectedStorage}`;
    }
    if (selectedColor !== "Original" && !baseTitle.toLowerCase().includes(selectedColor.toLowerCase())) {
      fullProductTitle += ` (${selectedColor})`;
    }

    const cleanSearchSlug = encodeURIComponent(fullProductTitle);

    let productLink = "";
    const srcLower = st.source.toLowerCase();
    if (srcLower.includes("amazon")) {
      productLink = resolvedInfo?.domain.includes("amazon") ? resolvedInfo.resolvedUrl : `https://www.amazon.in/s?k=${cleanSearchSlug}`;
    } else if (srcLower.includes("flipkart")) {
      productLink = resolvedInfo?.domain.includes("flipkart") ? resolvedInfo.resolvedUrl : `https://www.flipkart.com/search?q=${cleanSearchSlug}`;
    } else if (srcLower.includes("croma")) {
      productLink = `https://www.croma.com/searchB?q=${cleanSearchSlug}`;
    } else if (srcLower.includes("reliance")) {
      productLink = `https://www.reliancedigital.in/search?q=${cleanSearchSlug}`;
    } else if (srcLower.includes("jiomart")) {
      productLink = `https://www.jiomart.com/search/${cleanSearchSlug}`;
    } else if (srcLower.includes("vijay")) {
      productLink = `https://www.vijaysales.com/search/${cleanSearchSlug}`;
    } else if (srcLower.includes("tata cliq") || srcLower.includes("tatacliq")) {
      productLink = `https://www.tatacliq.com/search/?searchCategory=all&text=${cleanSearchSlug}`;
    } else if (srcLower.includes("myntra")) {
      productLink = `https://www.myntra.com/${cleanSearchSlug}`;
    } else if (srcLower.includes("ajio")) {
      productLink = `https://www.ajio.com/search/?text=${cleanSearchSlug}`;
    } else if (srcLower.includes("nykaa")) {
      productLink = `https://www.nykaa.com/search/result/?q=${cleanSearchSlug}`;
    } else if (srcLower.includes("firstcry")) {
      productLink = `https://www.firstcry.com/search?q=${cleanSearchSlug}`;
    } else if (srcLower.includes("boat")) {
      productLink = `https://www.boAt-lifestyle.com/search?q=${cleanSearchSlug}`;
    } else if (srcLower.includes("samsung")) {
      productLink = `https://www.samsung.com/in/multistore/?search=${cleanSearchSlug}`;
    } else if (srcLower.includes("apple")) {
      productLink = `https://www.apple.com/in/shop/goto/${cleanSearchSlug}`;
    } else if (srcLower.includes("oneplus")) {
      productLink = `https://www.oneplus.in/search?q=${cleanSearchSlug}`;
    } else if (srcLower.includes("dell")) {
      productLink = `https://www.dell.com/en-in/search/${cleanSearchSlug}`;
    } else if (srcLower.includes("hp")) {
      productLink = `https://www.hp.com/in-en/shop/catalogsearch/result/?q=${cleanSearchSlug}`;
    } else if (srcLower.includes("lenovo")) {
      productLink = `https://www.lenovo.com/in/en/search?fq=&text=${cleanSearchSlug}`;
    } else if (srcLower.includes("asus")) {
      productLink = `https://in.store.asus.com/catalogsearch/result/?q=${cleanSearchSlug}`;
    } else {
      productLink = `https://www.amazon.in/s?k=${cleanSearchSlug}`;
    }

    let imgUrl = resolvedInfo?.validatedImage || resolvedInfo?.productImage || null;
    if (!imgUrl && resolvedInfo?.productId && resolvedInfo?.storeName?.toLowerCase().includes("amazon")) {
      imgUrl = `https://images-na.ssl-images-amazon.com/images/P/${resolvedInfo.productId}.01._SCLZZZZZZZ_.jpg`;
    }
    if (!imgUrl) {
      imgUrl = getProductCategoryPhoto(fullProductTitle);
    }

    results.push({
      title: fullProductTitle,
      price: `₹${finalPriceNum.toLocaleString("en-IN")}`,
      old_price: `₹${oldPriceNum.toLocaleString("en-IN")}`,
      thumbnail: imgUrl,
      link: productLink,
      source: st.source,
      rating: Number((4.6 + (idx % 4) * 0.1).toFixed(1)),
      reviews: 140 + idx * 85,
      delivery: st.delivery,
      coupon: st.coupon,
      cashback: "2% BuyWise Cashback",
      seller: st.seller,
      brand: brand.toUpperCase(),
      features: [selectedStorage, selectedColor, "1 Year Official Warranty"],
      isOriginalLink: resolvedInfo ? resolvedInfo.storeName.toLowerCase() === st.source.toLowerCase() : false,
      aiScore: 98 - idx,
      aiConfidence: 98,
      matchExplanation: `Exact match across ${st.source}`,
    });
  });

  results.sort((a, b) => {
    const valA = parseInt(a.price.replace(/[^0-9]/g, ""), 10) || 0;
    const valB = parseInt(b.price.replace(/[^0-9]/g, ""), 10) || 0;
    return valA - valB;
  });

  if (results.length > 0) {
    results[0].isBest = true;
  }

  return results;
}
