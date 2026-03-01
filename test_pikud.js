const pikudHaoref = require('pikud-haoref-api');

console.log("Fetching alerts using native pikud-haoref-api (proxies)...");

pikudHaoref.getActiveAlert(function (err, alerts) {
    if (err) {
        console.error("Error fetching:", err);
    } else {
        console.log("Success! Active alerts:", alerts);
    }
});
