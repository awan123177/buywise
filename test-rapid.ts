import axios from "axios";

async function testApi() {
  const rapidApiKey = "3e167ad9bbmsh95ca52b19b0e036p16fc46jsnb45a4038705c";
  
  // Test endpoints based on common rapidapi flipkart structure
  const endpoints = [
    "/search",
    "/api/search",
    "/products/search",
    "/product/search",
    "/api/product/search"
  ];

  for (const ep of endpoints) {
    try {
      const res = await axios.get(`https://flipkart-api1.p.rapidapi.com${ep}`, {
        params: { q: "laptop", keyword: "laptop" },
        headers: { "X-RapidAPI-Key": rapidApiKey, "X-RapidAPI-Host": "flipkart-api1.p.rapidapi.com" }
      });
      console.log(`Flipkart ${ep} SUCCESS`, Object.keys(res.data));
      break; 
    } catch (error: any) {
      console.error(`Flipkart ${ep} ERROR`, error.response?.data?.message || error.response?.data || error.message);
    }
  }

  const amazonEndpoints = [
    { ep: "/search", params: { query: "laptop", country: "IN" } },
    { ep: "/search", params: { query: "laptop", country: "US" } },
    { ep: "/search", params: { query: "laptop", country: "in" } },
    { ep: "/search", params: { query: "laptop", country: "us" } },
    { ep: "/search", params: { q: "laptop", country: "US" } },
  ];

  for (const item of amazonEndpoints) {
    try {
      const res = await axios.get(`https://amazon-product-search-api1.p.rapidapi.com${item.ep}`, {
        params: item.params,
        headers: { "X-RapidAPI-Key": rapidApiKey, "X-RapidAPI-Host": "amazon-product-search-api1.p.rapidapi.com" }
      });
      console.log(`Amazon ${JSON.stringify(item.params)} SUCCESS`, Object.keys(res.data));
    } catch (error: any) {
      console.error(`Amazon ${JSON.stringify(item.params)} ERROR`, error.response?.data?.message || error.response?.data || error.message);
    }
  }

}
testApi();
