require('dotenv').config()
const express = require('express')

const app = express()
const Quote = require('./models/quote')

const notFound = (_, res) => {
  res
    .status(404)
    .send({ error: "Oh no, we couldn't find what you were looking for." })
}

const errorHandler = (error, _, res, next) => {
  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'There was an issue with the id' })
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

app.delete('/api/quotes/:id', async (req, res) => {
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
  const body = req.body
  try {
    const newQuote = {
      quote: body.quote,
      author: body.body,
    }
    const result = await Quote.findByIdAndUpdate(id, newQuote, { new: true })
    res.json(result)
  } catch (error) {
    next(error)
  }
})

app.post('/api/quotes', async (req, res) => {
  const body = req.body
  if (!body.quote) {
    return res.status(400).json({
      error: 'Quote is missing',
    })
  }
  const quote = new Quote({
    date: new Date(),
    quote: body.quote,
    author: body.author,
  })

  const result = await quote.save()
  res.json(result)
})

// custom middlewares
app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 3030
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
