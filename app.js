const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000;

let satelliteData = [];

app.get('/stats', (req, res) => {
    const lastFiveMinutesData = satelliteData.filter(data => new Date(data.timestamp) >= new Date() - 5 * 60 * 1000);
    
    if (lastFiveMinutesData.length === 0) {
        res.json({ message: 'No data available for the last 5 minutes' });
        return;
    }

    const altitudes = lastFiveMinutesData.map(data => parseFloat(data.altitude));
    const minimum = Math.min(...altitudes);
    const maximum = Math.max(...altitudes);
    const average = altitudes.reduce((sum, value) => sum + value, 0) / altitudes.length;

    res.json({ minimum, maximum, average });
});

app.get('/health', (req, res) => {
    const lastMinuteData = satelliteData.filter(data => new Date(data.timestamp) >= new Date() - 60 * 1000);
    
    if (lastMinuteData.length === 0) {
        res.json({ message: 'No data available for the last minute' });
        return;
    }

    const averageAltitude = lastMinuteData.reduce((sum, data) => sum + parseFloat(data.altitude), 0) / lastMinuteData.length;

    if (averageAltitude < 160) {
        res.json({ message: 'WARNING: RAPID ORBITAL DECAY IMMINENT' });
    } else if (averageAltitude >= 160 && averageAltitude < 161) {
        res.json({ message: 'Sustained Low Earth Orbit Resumed' });
    } else {
        res.json({ message: 'Altitude is A-OK' });
    }
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