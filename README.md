# Cannot use x-pack with certificates containing IPv6 addresses

This repository contains code to reproduce https://github.com/elastic/elasticsearch-js/issues/640

## Usage

Install node 8.10.0 that includes support for IPv6 addresses in TLS certificates.

Clone this repository and install

    git clone https://github.com/mattiasholmlund/test-elasticsearch-ipv6-tls.git
    cd test-elasticsearch-ipv6-tls
    npm install

Run server.js

    $ node server.js
    Listening on https://[::1]:62914

It will print the url that it is listening on. Try to connect with curl:

    $ curl https://[::1]:62914
    curl: (60) SSL certificate problem: unable to get local issuer certificate
    More details here: http://curl.haxx.se/docs/sslcerts.html

    curl performs SSL certificate verification by default, using a "bundle"
    of Certificate Authority (CA) public keys (CA certs). If the default
    bundle file isn't adequate, you can specify an alternate file
    using the --cacert option.
    If this HTTPS server uses a certificate signed by a CA represented in
    the bundle, the certificate verification probably failed due to a
    problem with the certificate (it might be expired, or the name might
    not match the domain name in the URL).
    If you'd like to turn off curl's verification of the certificate, use
    the -k (or --insecure) option.

This will not work since the certificate presented by the server is not trusted.

Now connect with curl and tell curl to trust the ca certificate that the
server certificate is signed by:

    $ curl --cacert fixtures/ca.pem https://[::1]:62914
    ohai

This works. The server certificate thus correctly signs the IPv6 address ::1.

Now use client.js to try to connect with the npm elasticsearch module:

    $ node elasticsearch-client.js https://[::1]:62914
    ==> Plain https request succeeded
    Elasticsearch ERROR: 2018-03-09T12:19:45Z
    Error: Request error, retrying
    HEAD https://::1:62914/ => Hostname/IP doesn't match certificate's altnames: "Host: [. is not in the cert's altnames: IP Address:127.0.0.1, IP Address:0:0:0:0:0:0:0:1, DNS:localhost"
        at Log.error (/Users/mattias/development/test-elasticsearch-ipv6-tls/node_modules/elasticsearch/src/lib/log.js:225:56)
        at checkRespForFailure (/Users/mattias/development/test-elasticsearch-ipv6-tls/node_modules/elasticsearch/src/lib/transport.js:258:18)
        at HttpConnector.<anonymous> (/Users/mattias/development/test-elasticsearch-ipv6-tls/node_modules/elasticsearch/src/lib/connectors/http.js:158:7)
        at ClientRequest.bound (/Users/mattias/development/test-elasticsearch-ipv6-tls/node_modules/lodash/dist/lodash.js:729:21)
        at emitOne (events.js:116:13)
        at ClientRequest.emit (events.js:211:7)
        at TLSSocket.socketErrorListener (_http_client.js:387:9)
        at emitOne (events.js:116:13)
        at TLSSocket.emit (events.js:211:7)
        at emitErrorNT (internal/streams/destroy.js:64:8)

    ==> elasticsearch request failed

Note that the normal https request succeeds, whereas the elasticsearch https request fails. This is due to bug https://github.com/node-modules/agentkeepalive/issues/52 in agentkeepalive which was resolved in version 3.4.1.