const express = require('express')
const app = express()

//imports http package
const http = require('http')

//creates the http server
const server = http.createServer(app)

const port = 3000

app.use(express.static('public'))

//routing
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

console.log('server did not loaded')
  