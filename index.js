const app = require('express')()
const http = require('http').createServer(app)
const io = require('socket.io')(http, {
  cors: {
    origins: ['http://localhost:3000']
  }
})

app.get('/', (req, res) => {
  res.send('Deberts game')
})

io.on('connection', socket => {
  console.log(`user connected, ${socket.id}`)

  socket.on('disconnect', () => {
    console.log('user disconnected')
  })

  socket.on('message', (msg, id) => {
    if (id === '') {
      socket.broadcast.emit('broadcast', msg)
    } else {
      socket.to(id).emit('broadcast', msg)
    }
  })

})

http.listen(8000, () => {
  console.log('listening-http on lh:8000')
})