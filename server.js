//node server.js
//http://localhost:8080/

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const port = 8080;

const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
};

const requestHandler = (request, response) => {
    console.log(request.url);

    // Add a route to proxy Stockfish API requests
    if (request.url.startsWith('/stockfish-proxy')) {
        const stockfishOptions = {
            hostname: 'stockfish.online',
            path: '/api/s/v2.php',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        };
        
        const proxyReq = https.request(stockfishOptions, (proxyRes) => {
            let responseData = '';
            proxyRes.on('data', (chunk) => {
                responseData += chunk;
            });
            
            proxyRes.on('end', () => {
                response.writeHead(proxyRes.statusCode, proxyRes.headers);
                response.end(responseData);
            });
        });
        
        proxyReq.on('error', (error) => {
            console.error('Proxy request error:', error);
            response.writeHead(500);
            response.end('Proxy error');
        });
        
        // Forward the request body
        request.on('data', (chunk) => {
            proxyReq.write(chunk);
        });
        
        request.on('end', () => {
            proxyReq.end();
        });
        
        return;
    }

    let filePath = '.' + request.url;

    if (request.url === '/') {
        filePath = './index.html';
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.log(err);
            response.writeHead(404, { 'Content-Type': 'text/html' });
            return response.end('404 Not Found');
        }
        response.writeHead(200, { 'Content-Type': contentType });
        response.end(data, 'utf-8');
    });
};

const server = http.createServer(requestHandler);

server.listen(port, (err) => {
    if (err) {
        return console.log('Error', err);
    }
    console.log(`Listening on port ${port}`);
});