require('dotenv').config()
const express = require('express')

const app = express()
const Quote = require('./models/quote')

const notFound = (_, res) => {
  res.status(404).send({ error: 'Not found' })
}

const errorHandler = (error, _, res, next) => {
  console.log('error--', error)
  switch (error.name) {
    case 'CastError':
      return res.status(400).send({ error: 'There was an issue with the id' })
    case 'ValidationError':
      return res.status(400).send({ error: error.message })
    default:
      break
  }
  next(error)
}

// express json-parser - to access incoming data
app.use(express.json())

app.get('/api/quotes', async (_, res) => {
  // res.json(quotes)
  const quotes = await Quote.find({})
  res.json(quotes)
})

app.delete('/api/quotes/:id', async (req, res, next) => {
  const { id } = req.params
  try {
    await Quote.findByIdAndDelete(id)
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

app.get('/api/quotes/:id', async (req, res, next) => {
  const { id } = req.params
  try {
    const result = await Quote.findById(id)
    res.json(result)
  } catch (error) {
    next(error)
  }
})

app.put('/api/quotes/:id', async (req, res, next) => {
  const { id } = req.params
  const { quote, author } = req.body

  try {
    const newQuote = {
      quote,
      author,
    }
    const result = await Quote.findByIdAndUpdate(id, newQuote, {
      new: true,
      runValidators: true,
      context: 'query',
    })
    res.json(result)
  } catch (error) {
    next(error)
  }
})

app.post('/api/quotes', async (req, res, next) => {
  const { quote, author } = req.body
  if (!quote || !author) {
    return res.status(400).json({
      error: 'Some data seems to be missing',
    })
  }
  try {
    const entry = new Quote({
      date: new Date(),
      quote,
      author,
    })

    const result = await entry.save()
    res.json(result)
  } catch (error) {
    next(error)
  }
})

// custom middlewares
app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 3030
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
