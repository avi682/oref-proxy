const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

const pikudHaoref = require('pikud-haoref-api');

app.get('/api/alerts', (req, res) => {
    pikudHaoref.getActiveAlert(function (err, alert) {
        if (err) {
            console.error('Error fetching Oref data:', err.message);
            // Return a structured error response
            return res.status(500).json({
                error: 'Failed to fetch alerts',
                details: err.message
            });
        }

        // alert format is { type: 'none', cities: [] } or { type: 'missiles', cities: ['Tel Aviv'] }
        // We will adapt it slightly to match what the ESP32 expects, or just send it as is:
        // By default, the original API returned an object with 'id', 'title', 'data' array.
        // Let's format it in a way the ESP32 code recognizes!

        let responsePayload;
        if (alert.type === 'none' || !alert.cities || alert.cities.length === 0) {
            responsePayload = { id: "0", title: "none", data: [] };
        } else {
            responsePayload = {
                id: Date.now().toString(),
                title: "התרעה",
                data: alert.cities
            };
        }

        return res.json(responsePayload);
    });
});

// Start server locally if not in Vercel environment
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running locally on http://localhost:${PORT}`);
    });
}

module.exports = app;
