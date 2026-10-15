require('dotenv').config()

const mongoose = require('mongoose')
const app = require('./app')

const PORT = process.env.PORT || 3001
const MongoDB_URL = process.env.MongoDB_URL

mongoose.set('strictQuery', false)

mongoose.connect(MongoDB_URL, { family: 4 })
  .then(() => {
    console.log('Connected to MongoDB')

    app.listen(PORT, () => {
      console.log(`app listening on port ${PORT}`)
    })
  })
  .catch(error => {
    console.error('Error connectiong to MongoDB; ', error.message)
    process.exit(1)
  })

