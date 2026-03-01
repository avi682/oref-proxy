const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

const pikudHaoref = require('pikud-haoref-api');

app.get('/api/alerts', async (req, res) => {
    try {
        // Redalert headers + CORS proxy to bypass Datacenter/Akamai IP ban. 
        // This makes the request look like a standard frontend fetch from a random user.
        const targetUrl = encodeURIComponent('https://www.oref.org.il/WarningMessages/alert/alerts.json');

        const response = await axios.get(`https://corsproxy.io/?${targetUrl}`, {
            headers: {
                'Referer': 'https://www.oref.org.il/',
                'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.97 Safari/537.36",
                'X-Requested-With': 'XMLHttpRequest'
            },
            timeout: 5000,
            responseType: 'arraybuffer'
        });

        let body = response.data.toString('utf-8');
        body = body.replace(/\x00/g, '').trim();

        if (body === '') {
            return res.send(""); // No alerts
        }

        const alertData = JSON.parse(body);

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
        console.error('Error fetching via CORS proxy:', error.message);
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
