//node serveur.js
//http://localhost:8080/

const http = require('http')
const port = 8080
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
}
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

    response.writeHead(200, { 'Content-Type': 'text/html' })
}

const server = http.createServer(requestHandler)

server.listen(port, (err) => {
    if(err) {
        return console.log("Error", err)
    }
    console.log(`Listening on port ${port}`)
})
