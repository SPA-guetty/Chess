const http = require('http');
const fs = require('fs');
const path = require('path');
const port = 8080;

const requestHandler = (_, res) => {
    const filePath = path.join(__dirname, './timer.html');

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Erreur interne du serveur');
            return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
    });
};

const server = http.createServer(requestHandler);

server.listen(port, (err) => {
    if (err) {
        return console.log("Error", err);
    }
    console.log(`Listening on http://localhost:${port}`);
});
