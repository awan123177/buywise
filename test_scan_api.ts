import axios from 'axios';

async function test() {
  try {
    const res = await axios.post('http://localhost:3000/api/gamification/barcode/scan', {
      barcode: '8901058002315',
      format: 'EAN_13'
    }, {
      headers: {
        'x-user-id': 'user_test_123',
        'x-user-email': 'test@example.com',
        'x-user-name': 'Test User'
      }
    });
    console.log('API Response:', JSON.stringify(res.data, null, 2));
  } catch (err: any) {
    if (err.response) {
      console.error('API Error Response Status:', err.response.status);
      console.error('API Error Response Data:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('Error message:', err.message);
    }
  }
}

test();
