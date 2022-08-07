const mongoose = require('mongoose')
const db = process.env.MONGODB_URI

mongoose
  .connect(db)
  .then((_) => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const quoteSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  quote: {
    type: String,
    minLength: 2,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
})

quoteSchema.set('toJSON', {
  transform: (_, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

module.exports = mongoose.model('Quote', quoteSchema)
