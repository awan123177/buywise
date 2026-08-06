import axios from 'axios';
const rapidApiKey = '3e167ad9bbmsh95ca52b19b0e036p16fc46jsnb45a4038705c';
async function run() {
  try {
    const res = await axios.get('https://irctc1.p.rapidapi.com/api/v3/trainBetweenStations', {
      params: { fromStationCode: 'SBC', toStationCode: 'MAS', dateOfJourney: '2026-09-15' },
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'irctc1.p.rapidapi.com'
      }
    });
    console.log(JSON.stringify(res.data).substring(0, 500));
  } catch (e) {
    if (e.response) {
      console.log(e.response.status, e.response.data);
    } else {
      console.error(e.message);
    }
  }
}
run();
