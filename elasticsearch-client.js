'use strict'

const elasticsearch = require('elasticsearch');
const fs = require('fs')
const https = require('https')
const { URL } = require('url');

const url = process.argv[2]
const [,port] = url.match(/(\d+)$/); 

https.get({
    ca: fs.readFileSync(__dirname + '/fixtures/ca.pem'),
    host: '::1',
    port: port,
    path: '/'
}, res => {
      if(res.statusCode === 200) {
        console.log('==> Plain https request succeeded')
      }
});

var client = new elasticsearch.Client({
    host: url,
    log: 'error',
    ssl: {
        ca: fs.readFileSync('./fixtures/ca.pem'),
        rejectUnauthorized: true
      }
  });

client.ping({
    // ping usually has a 3000ms timeout
    requestTimeout: 1000
  }, function (error) {
    if (error) {
        console.log('==> elasticsearch request failed')
        process.exit(1)
    } else {
      console.log('==> elasticsearch request succeeded');
    }
  });