import axios from 'axios';
const rapidApiKey = '3e167ad9bbmsh95ca52b19b0e036p16fc46jsnb45a4038705c';
const hosts = ['indian-railway.p.rapidapi.com', 'irctc-api.p.rapidapi.com', 'trains.p.rapidapi.com'];
async function run() {
  for (const host of hosts) {
      try {
        console.log("testing", host);
        const res = await axios.get(`https://${host}/`, {
          headers: {
            'X-RapidAPI-Key': rapidApiKey,
            'X-RapidAPI-Host': host
          }
        });
        console.log(host, res.status);
      } catch (e) {
        if (e.response) console.log(host, e.response.status, e.response.data);
      }
  }
}
run();
