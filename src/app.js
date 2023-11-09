const express = require('express');
const axios = require('axios');
const { calculateStats, checkHealth } = require('./healthUtils');

const app = express();
const port = 3000;

let satelliteData = [];

app.get('/stats', (req, res) => {
    const stats = calculateStats(satelliteData);
    res.json(stats);
});

app.get('/health', (req, res) => {
    const healthStatus = checkHealth(satelliteData);
    res.json({ message: healthStatus });
});

// Function to fetch satellite data every 10 seconds
async function fetchSatelliteData() {
    try {
        const response = await axios.get('https://api.cfast.dev/satellite');
        const data = response.data;
        data.timestamp = new Date();
        satelliteData.push(data);
    } catch (error) {
        console.error('Error fetching satellite data:', error.message);
    }
}

// Fetch satellite data every 10 seconds
setInterval(fetchSatelliteData, 10000);

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
