import axios from 'axios';
const token = 'f77e4ddba522db919bc7415359d7c892';
async function run() {
  try {
    const res = await axios.get('https://api.travelpayouts.com/v1/prices/cheap', {
      params: { origin: 'BLR', destination: 'DEL', depart_date: '2026-09-15', token }
    });
    console.log('cheap flights:', res.data);
  } catch (e) {
    if (e.response) {
      console.log(e.response.status, e.response.data);
    } else {
      console.error(e.message);
    }
  }
}
run();
