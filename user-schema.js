const mongoose = require('mongoose')

const User = new mongoose.Schema({
  name: String,
  password: String
})

module.exports = mongoose.model('User', User)