const axios = require('axios');

async function test() {
  try {
    const res = await axios.get('http://localhost:5000/api/doctors?lat=12.9716&lng=77.5946');
    console.log("Success:", res.data);
  } catch(e) {
    console.error("Error:", e.response ? e.response.status + " " + e.response.data.message : e.message);
  }
}

test();
