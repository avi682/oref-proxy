const axios = require('axios');
const HttpsProxyAgent = require('https-proxy-agent');
const HttpProxyAgent = require('http-proxy-agent');

app.get('/api/alerts', async (req, res) => {
    try {
        // Free Israeli Proxies to bypass Akamai's datacenter block:
        const proxyUrl = "http://89.236.81.18:8080";
        const agent = new HttpProxyAgent.HttpProxyAgent(proxyUrl);

        const response = await axios.get('https://www.oref.org.il/WarningMessages/alert/alerts.json', {
            httpAgent: agent,
            httpsAgent: agent,
            headers: {
                'Referer': 'https://www.oref.org.il/',
                'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                'X-Requested-With': 'XMLHttpRequest'
            },
            timeout: 5000,
            responseType: 'arraybuffer'
        });

        let body = response.data.toString('utf-8');
        body = body.replace(/\x00/g, '').trim();

        if (body === '') {
            return res.send("");
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
        console.error('Error with Proxy fetch:', error.message);
        return res.status(500).json({ error: 'Failed', details: error.message });
    }
});
