'use strict';

const https = require('https');
const fs = require('fs');
const options = {
    key: fs.readFileSync(__dirname + '/fixtures/agenttest-key.pem'),
    cert: fs.readFileSync(__dirname + '/fixtures/agenttest-cert.pem'),
};

// Create TLS1.2 server
const server = https.createServer(options, (req, res) => {
    res.end('ohai');
});

server.listen(0, () => {
    console.log('Listening on https://[::1]:' + server.address().port);
});
