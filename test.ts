import axios from "axios";

async function testApi() {
  try {
    const res = await axios.get("https://amazon-product-search-api1.p.rapidapi.com/search", {
      params: { q: "laptop", country: "us" },
      headers: {
        "X-RapidAPI-Key": "3e167ad9bbmsh95ca52b19b0e036p16fc46jsnb45a4038705c",
        "X-RapidAPI-Host": "amazon-product-search-api1.p.rapidapi.com"
      }
    });
    console.log("amazon", JSON.stringify(res.data).slice(0, 500));
  } catch (error) {
    console.error("amazon error", error.response?.data || error.message);
  }

  try {
    const res = await axios.get("https://flipkart-api1.p.rapidapi.com/search", {
      params: { query: "laptop" },
      headers: {
        "X-RapidAPI-Key": "3e167ad9bbmsh95ca52b19b0e036p16fc46jsnb45a4038705c",
        "X-RapidAPI-Host": "flipkart-api1.p.rapidapi.com"
      }
    });
    console.log("flipkart /search", JSON.stringify(res.data).slice(0, 500));
  } catch (error) {
    console.error("flipkart error", error.response?.data || error.message);
  }
}

testApi();
