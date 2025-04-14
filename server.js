//node serveur.js
//http://localhost:8080/

const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 8080;

const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
};

const requestHandler = (request, response) => {
    console.log(request.url)
    let filPath = './index' + request.url 

    if (request.url === '/') {
        filPath = './index/service.html/menu.html'
    }

    fs.readFile(filPath, (err, data) => {
        if (err) {
            console.log(err)
            response.writeHead(404, { 'Content-Type': 'text/html' })
            return response.end('404 Not Found')
        }
        const extname = String(path.extname(filPath)).toLowerCase()
        const contentType = mimeTypes[extname] || 'application/octet-stream'
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