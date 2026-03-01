const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

const pikudHaoref = require('pikud-haoref-api');

app.get('/api/alerts', async (req, res) => {
    try {
        // Fetch exactly as t0mer/Redalert does
        const response = await axios.get('https://www.oref.org.il/WarningMessages/alert/alerts.json', {
            headers: {
                'Referer': 'https://www.oref.org.il/',
                'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.97 Safari/537.36",
                'X-Requested-With': 'XMLHttpRequest'
            },
            timeout: 5000,
            responseType: 'arraybuffer' // Oref sometimes returns weird encodings like UTF-16LE
        });

        // Parse Oref encodings identically to redalert or pikud-haoref-api
        let body = response.data.toString('utf-8');

        // Remove NUL bytes or BOM that Oref sometimes includes
        body = body.replace(/\x00/g, '').trim();

        if (body === '') {
            return res.send(""); // No alerts
        }

        const alertData = JSON.parse(body);

        // Oref format: { id: "123", title: "...", data: ["city1", "city2"] }
        // Let's pass it exactly as the ESP32 expects.
        let responsePayload;
        if (!alertData.data || alertData.data.length === 0) {
            return res.send("");
        } else {
            responsePayload = {
                id: alertData.id || Date.now().toString(),
                title: alertData.title || "התרעה",
                data: alertData.data
            };
        }

        return res.json(responsePayload);

    } catch (error) {
        console.error('Error fetching Oref data:', error.message);
        // Return a structured error response
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
