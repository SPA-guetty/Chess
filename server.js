//node serveur.js
//http://localhost:8080/

const http = require('http')
const port = 8080

const requestHandler = (request, response) => {
    console.log("URL demandée :", request.url)

    let filePath = './index'

    // Gestion des routes
    if (request.url === '/' || request.url === '/index') {
        filePath += '/index.html'
    } else if (request.url === '/about') {
        filePath += '/about.html'
    } else if (request.url === '/contact') {
        filePath += '/contact.html'
    } else {
        filePath += '/404.html' 
    }
    const fs = require('fs')
    const path = require('path')
    // Lecture du fichier HTML
    fs.readFile(path.join(__dirname, filePath), (err, data) => {
        if (err) {
            response.writeHead(500, { 'Content-Type': 'text/plain' })
            response.end('Erreur du serveur')
        } else {
            response.writeHead(200, { 'Content-Type': 'text/html' })
            response.end(data)
        }
    })
}

const server = http.createServer(requestHandler)

server.listen(port, (err) => {
    if(err) {
        return console.log("Error", err)
    }
    console.log(`Listening on port ${port}`)
})
