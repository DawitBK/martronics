const axios = require('axios');

axios.get('http://localhost:3000/api/category')
    .then(response => {
        console.log('Response:', JSON.stringify(response.data, null, 2));
    })
    .catch(error => {
        console.error('Error:', error.message);
    });
