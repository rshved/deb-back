const app = require('express')()
const http = require('http').createServer(app)
const axios = require('axios')

const mongoose = require('mongoose');
const DB_URL = `mongodb+srv://rsh:qaz135@cluster0.ozgo9.mongodb.net/?retryWrites=true&w=majority`

const { instrument } = require('@socket.io/admin-ui')
const io = require('socket.io')(http, {
  cors: {
    origins: ['http://localhost:3000', 'https://admin.socket.io/']
  }
})


app.get('/', (req, res) => {
  res.send('Deberts game')
})

let cards = null;
let piles = null;

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

    piles = cards?.reduce((accum, item) => {
      const lastPile = accum[accum.length - 1]
      if (lastPile && lastPile.length < 6) {
        lastPile.push(item)
      } else accum.push([item])
      return accum
    }, [])
  } catch (error) {
    console.error(error)
  }
})()

io.on('connection',
  async socket => {
    console.log(`user connected, ${socket.id}`)

    socket.emit('id', socket.id)

    const users = Array.from(await io.allSockets())
    if (users.length === 4) {
      const sendCards = function () {

        const map = new Map()

        return piles?.reduce((accum, item, index) => {
          if (users.length !== index) {
            map.set(users[index], item)
          } else if (index === users.length) {
            map.set('other', item)
          }
          return map
        }, {})
      }()
    if (sendCards) socket.emit('piles', Array.from(sendCards));

    }

    socket.on('disconnect', () => {
      console.log(`user disconnected, ${socket.id}`)
    })
    socket.on('cards', (cards) => {
      socket.emit('broadcast', cards)
    })




    socket.on('join', roomId => {
      socket.join(roomId)
      console.log(roomId)

    })
  })


instrument(io, { auth: false })

async function startApp() {
  try {
    await mongoose.connect(DB_URL, { useUnifiedTopology: true, useNewUrlParser: true })
    http.listen(8000, () => {
      console.log('listening-http on lh:8000')
    })
  } catch (e) {
    console.log(e)
  }
}

startApp()

