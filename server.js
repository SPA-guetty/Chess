//node serveur.js
//http://localhost:8080/

const http = require('http')
const port = 8080
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
}
const fs = require('fs')
const path = require('path')
const requestHandler = (request, response) => {
    console.log(request.url)
    let filPath = './index/menu.html' + request.url
    if (request.url === '/') {
        filPath = './index/menu.html'
    } else if (request.url === '/about') {
        filPath = './index/about.html'
    } else if (request.url === '/contact') {
        filPath = './index/contact.html'
    } else {
        filPath = './index/404.html'
    }
    
fs.readFile(filPath, (err, data) => {
        if (err) {
            response.writeHead(404, { 'Content-Type': 'text/html' })
            return response.end('404 Not Found')
        }
        const extname = String(path.extname(filPath)).toLowerCase()
        const contentType = mimeTypes[extname] || 'application/octet-stream'
        response.writeHead(200, { 'Content-Type': contentType })
        response.end(data, 'utf-8')
    })
   
}

const server = http.createServer(requestHandler)

server.listen(port, (err) => {
    if(err) {
        return console.log("Error", err)
    }
    console.log(`Listening on port ${port}`)
})
