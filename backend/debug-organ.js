import fetch from 'node-fetch';

const API_KEY = 'orgflow-dev-api-key';
const BASE_URL = 'http://localhost:3002';

async function testOrganCreation() {
  console.log('Testing organ creation...');

  const organData = {
    donor: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    organType: 'Heart',
    bloodType: 'A+',
    hospital: 'Test General Hospital',
    recipientName: 'John Doe',
    recipientBloodType: 'A+',
    recipientContact: '+1234567890'
  };

  try {
    const response = await fetch(`${BASE_URL}/createOrgan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify(organData)
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testOrganCreation();
