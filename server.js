//node server.js
//http://localhost:8080/

const http = require('http');
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
    console.log(request.url)
    let filePath = '.' + request.url; // Fixed filPath to filePath

    if (request.url === '/') {
        filePath = './index.html'
    }

    const extname = String(path.extname(filePath)).toLowerCase()
    const contentType = mimeTypes[extname] || 'application/octet-stream' // Added const

    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.log(err)
            response.writeHead(404, { 'Content-Type': 'text/html' })
            return response.end('404 Not Found')
        }
        // Removed duplicate extension check
        response.writeHead(200, { 'Content-Type': contentType })
        response.end(data, 'utf-8')
    })
}

const server = http.createServer(requestHandler);

server.listen(port, (err) => {
    if (err) {
        return console.log('Error', err);
    }
    console.log(`Listening on port ${port}`);
});