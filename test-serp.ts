import axios from "axios";
async function run() {
    try {
        const res = await axios.get("https://serpapi.com/search", {
            params: { engine: "google_shopping", q: "laptop", api_key: "542dce7198130662e8dd49b345591dec556b37394cc9a0e3dd0010d5f1354075", hl: "en", gl: "in" }
        });
        console.log(JSON.stringify(res.data.shopping_results.slice(0, 3), null, 2));
    } catch (e) { console.error(e); }
}
run();
