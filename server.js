const http = require('http')
const port = 8080

const requestHandler = (request, response) => {
    console.log(request.url)
    response.end("Running")
}

const server = http.createServer(requestHandler)

server.listen(port, (err) => {
    if(err) {
        return console.log("Error", err)
    }
    console.log(`Listening on port ${port}`)
})
//node serveur.js
//http://localhost:8080/

const http = require('http')
const port = 8080

const requestHandler = (request, response) => {
    console.log(request.url)
    const filePath = path.join(__dirname, 'index.html')
}

const server = http.createServer(requestHandler)

server.listen(port, (err) => {
    if(err) {
        return console.log("Error", err)
    }
    console.log(`Listening on port ${port}`)
})
