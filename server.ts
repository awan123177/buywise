import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();


async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // SERP/Rapid API Search
  app.get("/api/search", async (req, res) => {
    const { q } = req.query;
    const rapidApiKey = process.env.RAPID_API_KEY;

    if (!rapidApiKey) {
      console.warn("RAPID_API_KEY is missing, using fallback dummy data.");
    }

    try {
      let results: any[] = [];
      const queryStr = typeof q === 'string' ? q : '';

      if (rapidApiKey) {
        // Attempt Amazon API
        try {
          const amazonRes = await axios.get("https://amazon-product-search-api1.p.rapidapi.com/search", {
            params: { q: queryStr, country: "in" },
            headers: {
              "X-RapidAPI-Key": rapidApiKey,
              "X-RapidAPI-Host": "amazon-product-search-api1.p.rapidapi.com"
            }
          });
          if (amazonRes.data?.results) {
            results = [...results, ...amazonRes.data.results.map((r: any) => ({ ...r, source: "Amazon" }))];
          }
        } catch (e: any) {
          console.error("Amazon RapidAPI Error:", e.message);
        }

        // Attempt Flipkart API
        try {
          const flipkartRes = await axios.get("https://flipkart-api1.p.rapidapi.com/search", {
            params: { q: queryStr },
            headers: {
              "X-RapidAPI-Key": rapidApiKey,
              "X-RapidAPI-Host": "flipkart-api1.p.rapidapi.com"
            }
          });
          if (flipkartRes.data?.results) {
            results = [...results, ...flipkartRes.data.results.map((r: any) => ({ ...r, source: "Flipkart" }))];
          }
        } catch (e: any) {
          console.error("Flipkart RapidAPI Error:", e.message);
        }
      }

      // If both fail or rapidApiKey is missing, use Google Shopping SerpApi if available, or fallback data
      if (results.length === 0) {
          const serpApiKey = process.env.SERP_API_KEY || "542dce7198130662e8dd49b345591dec556b37394cc9a0e3dd0010d5f1354075";
          if (serpApiKey) {
            try {
              const serpResponse = await axios.get("https://serpapi.com/search", {
                params: { engine: "google_shopping", q: queryStr, api_key: serpApiKey, hl: "en", gl: "in" }
              });
              
              if (serpResponse.data && serpResponse.data.shopping_results) {
                serpResponse.data.shopping_results = serpResponse.data.shopping_results.map((item: any) => {
                    let originalLink = item.link || item.product_link;
                    if (item.source && originalLink && originalLink.includes("google.com")) {
                        const encodeQ = encodeURIComponent(item.title || queryStr);
                        if (item.source.toLowerCase().includes("amazon")) {
                            originalLink = `https://www.amazon.in/s?k=${encodeQ}`;
                        } else if (item.source.toLowerCase().includes("flipkart")) {
                            originalLink = `https://www.flipkart.com/search?q=${encodeQ}`;
                        } else if (item.source.toLowerCase().includes("croma")) {
                            originalLink = `https://www.croma.com/searchB?q=${encodeQ}`;
                        } else if (item.source.toLowerCase().includes("reliance")) {
                            originalLink = `https://www.reliancedigital.in/search?q=${encodeQ}`;
                        }
                    }
                    return {
                        ...item,
                        link: originalLink
                    };
                });
              }

              return res.json(serpResponse.data);
            } catch (e: any) {
              console.warn("SERP API failed (quota exceeded?), falling back to mock data.", e.message);
              // Fallback below
            }
          }
          
          // Mock Data if no API key is provided or if api fails
          return res.json({
            shopping_results: [
                {
                  title: `${queryStr} - (Amazon Official)`,
                  price: "₹84,999",
                  old_price: "₹99,999",
                  thumbnail: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=60",
                  link: "https://amazon.in",
                  source: "Amazon",
                  rating: 4.8,
                  delivery: "Tomorrow by 9 PM"
                },
                {
                  title: `${queryStr} - Pro Edition`,
                  price: "₹82,499",
                  old_price: "₹102,000",
                  thumbnail: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=60",
                  link: "https://flipkart.com",
                  source: "Flipkart",
                  rating: 4.6,
                  delivery: "In 2 Days"
                },
                {
                  title: `${queryStr} (Store Pickup Available)`,
                  price: "₹86,990",
                  old_price: "₹99,990",
                  thumbnail: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=60",
                  link: "https://croma.com",
                  source: "Croma",
                  rating: 4.5,
                  delivery: "Store Pickup"
                },
                {
                  title: `${queryStr} Base Variant`,
                  price: "₹88,000",
                  old_price: "₹95,000",
                  thumbnail: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=60",
                  link: "https://reliancedigital.in",
                  source: "Reliance Digital",
                  rating: 4.7,
                  delivery: "Tomorrow"
                }
              ]
            });
      }

      res.json({ shopping_results: results });
    } catch (error: any) {
      console.error("Search Gateway Error:", error.message);
      res.status(500).json({ error: "Failed to fetch product data" });
    }
  });

  app.get("/api/airports", async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json([]);
    const serpApiKey = process.env.SERP_API_KEY || "542dce7198130662e8dd49b345591dec556b37394cc9a0e3dd0010d5f1354075";

    try {
      const params = {
        engine: "google_flights_autocomplete",
        q,
        api_key: serpApiKey,
        hl: "en",
        gl: "us"
      };
      const serpResponse = await axios.get("https://serpapi.com/search", { params });
      return res.json(serpResponse.data.suggestions || []);
    } catch (e: any) {
      console.error("Autocomplete API Error:", e.response?.data || e.message);
      res.status(500).json({ error: "Failed to fetch autocomplete" });
    }
  });

  app.get("/api/flights", async (req, res) => {
    const { departure_id, arrival_id, outbound_date, return_date, type, adults } = req.query;
    const serpApiKey = process.env.SERP_API_KEY || "542dce7198130662e8dd49b345591dec556b37394cc9a0e3dd0010d5f1354075";

    try {
      const params: any = {
        engine: "google_flights",
        departure_id: departure_id || "BOM",
        arrival_id: arrival_id || "DEL",
        outbound_date: outbound_date,
        type: type || "2", // default to one-way
        adults: adults || "1",
        api_key: serpApiKey,
        hl: "en",
        gl: "in",
        currency: "INR"
      };

      if (return_date && type === "1") {
        params.return_date = return_date;
      }

      const serpResponse = await axios.get("https://serpapi.com/search", { params });
      return res.json(serpResponse.data);
    } catch (e: any) {
      console.error("Flight API Error:", e.response?.data || e.message);
      res.status(500).json({ error: "Failed to fetch flights" });
    }
  });

  // Admin Dashboard Mock Data
  app.get("/api/admin/stats", (req, res) => {
    res.json({
      totalSearches: 12450,
      trendingProducts: [
        { name: "iPhone 15 Pro", searches: 1200 },
        { name: "MacBook Air M3", searches: 850 },
        { name: "Sony WH-1000XM5", searches: 640 },
      ],
      activeUsers: 342,
    });
  });

  // Image proxy to bypass CORS for 3D textures
  app.get("/api/proxy-image", async (req, res) => {
    const { url } = req.query;
    if (!url || typeof url !== "string") {
      return res.status(400).send("Missing url parameter");
    }
    try {
      const response = await axios.get(url, { responseType: "arraybuffer" });
      const contentType = response.headers["content-type"];
      if (contentType) {
        res.set("Content-Type", String(contentType));
      }
      res.set("Cache-Control", "public, max-age=31536000");
      res.send(response.data);
    } catch (error: any) {
      console.error("Image Proxy Error:", error.message);
      res.status(500).send("Failed to proxy image");
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PriceVerse AI Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Server failed to start:", err);
});
