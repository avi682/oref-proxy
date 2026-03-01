const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

// Configure Axios to mimic a browser
const axiosInstance = axios.create({
    timeout: 5000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9,he;q=0.8',
        'Referer': 'https://www.oref.org.il/',
        'X-Requested-With': 'XMLHttpRequest',
        'Connection': 'keep-alive'
    }
});

app.get('/api/alerts', async (req, res) => {
    try {
        // Attempt to fetch from the official Oref API
        const response = await axiosInstance.get('https://www.oref.org.il/WarningMessages/alert/alerts.json');

        // If the response is empty (no alerts), Oref usually returns empty string or minimal content
        if (!response.data || typeof response.data === 'string' && response.data.trim().length === 0) {
            return res.json({ id: "0", title: "none", data: [] });
        }

        // Return the actual JSON data
        return res.json(response.data);

    } catch (error) {
        console.error('Error fetching Oref data:', error.message);

        // Return a structured error response so the ESP32 doesn't crash on bad JSON
        return res.status(500).json({
            error: 'Failed to fetch alerts',
            details: error.message
        });
    }
});

// Start server locally if not in Vercel environment
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running locally on http://localhost:${PORT}`);
    });
}

module.exports = app;
