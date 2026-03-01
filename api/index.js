const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

const pikudHaoref = require('pikud-haoref-api');

app.get('/api/alerts', async (req, res) => {
    try {
        // Since Oref's Akamai firewall blocks all Vercel/AWS/GCP datacenter IPs,
        // we use a dedicated community proxy built exactly for this purpose. 
        // Important: This proxy has no geo-block.
        const response = await axios.get('https://api.pikudhaoref.me/api/v1/alerts', {
            timeout: 5000,
            headers: {
                'Accept': 'application/json'
            }
        });

        // The response looks like: { "alerts": [{ "type": "missiles", "cities": ["Tel Aviv"] }] } 
        // Or if no alerts: { "alerts": [] }
        const alertsData = response.data.alerts;

        if (!alertsData || alertsData.length === 0) {
            return res.send(""); // Send empty string so ESP32 payload.length() > 5 is false
        }

        // We collect all unique cities from all active alerts
        const allCities = new Set();
        alertsData.forEach(alert => {
            if (alert.cities) {
                alert.cities.forEach(city => allCities.add(city));
            }
        });

        if (allCities.size === 0) {
            return res.send("");
        }

        // Format it exactly as the ESP32 expects
        const responsePayload = {
            id: Date.now().toString(),
            title: "התרעה",
            data: Array.from(allCities)
        };

        return res.json(responsePayload);

    } catch (error) {
        console.error('Error fetching from pikudhaoref.me:', error.message);
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
