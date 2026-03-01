const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

const pikudHaoref = require('pikud-haoref-api');

app.get('/api/alerts', async (req, res) => {
    try {
        // Mako news site mirrors Oref alerts without any geo-blocking or Cloudflare protection
        const response = await axios.get('https://www.mako.co.il/collab/alerts/alerts.json', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 5000
        });

        // Mako returns { data: [ "city1", "city2" ] }
        const makoData = response.data;

        // Sometimes Mako might return empty strings or arrays if no alerts are present
        if (!makoData || !makoData.data || !Array.isArray(makoData.data) || makoData.data.length === 0) {
            return res.send(""); // Send empty string so ESP32 payload.length() > 5 is false
        }

        const responsePayload = {
            id: Date.now().toString(),
            title: "התרעה",
            data: makoData.data
        };

        return res.json(responsePayload);

    } catch (error) {
        console.error('Error fetching Mako data:', error.message);
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
