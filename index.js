const app = require('express')()
const http = require('http').createServer(app)
const axios = require('axios')
const io = require('socket.io')(http, {
  cors: {
    origins: ['http://localhost:3000']
  }
})

app.get('/', (req, res) => {
  res.send('Deberts game')
})

let cards = null;

(async function getCards () {
  try {
    const { data: deck } = await axios('https://deckofcardsapi.com/api/deck/new/shuffle/?cards=AS,7S,8S,9S,10S,JS,QS,KS,AD,7D,8D,9D,' +
      '10D,JD,QD,KD,AC,7C,8C,9C,10C,JC,QC,KC,AH,7H,8H,9H,10H,JH,QH,KH')

    if (deck.deck_id) {
      try {
        const { data } = await axios (`https://deckofcardsapi.com/api/deck/${deck.deck_id}/draw/?count=28`)
        cards = data.cards
      } catch (e) {
        console.error(e)
      }
    }
  } catch (error) {
    console.error(error)
  }
})()

io.on('connection', socket => {
  console.log(`user connected, ${socket.id}`)

  socket.on('disconnect', () => {
    console.log(`user disconnected, ${socket.id}`)
  })

  socket.on('message', (msg, id) => {
    if (id === '') {
      socket.broadcast.emit('broadcast', msg)
    } else {
      socket.to(id).emit('broadcast', msg)
    }
  })

  socket.emit('cards', cards)
})

http.listen(8000, () => {
  console.log('listening-http on lh:8000')
})