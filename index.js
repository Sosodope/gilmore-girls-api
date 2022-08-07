require('dotenv')
const express = require('express')

const app = express()

const notFound = (_, res) => {
  res
    .status(404)
    .send({ error: "Oh no, we couldn't find what you were looking for." })
}

// express json-parser - to access incoming data
app.use(express.json())

let quotes = [
  {
    id: 0,
    quote:
      'I don’t like Mondays, but unfortunately, they come around eventually.',
    author: 'Lorelai Gilmore',
  },
  {
    id: 1,
    quote: 'A little nervous breakdown can work wonders for a girl.',
    author: 'Rory Gilmore',
  },
  {
    id: 2,
    quote:
      'I want to get the healthy glow of someone who goes consistently to the gym without actually having to go, of course.',
    author: 'Kirk Gleason',
  },
  {
    id: 3,
    quote: "People are particularly stupid today. I can't talk anymore.",
    author: 'Michel Gerard',
  },
  {
    id: 4,
    quote: "That makes me so mad and so sad. I'm smad!",
    author: 'Sookie St. James',
  },
]

app.get('/api/quotes', (_, res) => {
  res.json(quotes)
})

app.delete('/api/quotes/:id', (req, res) => {
  const id = Number(req.params.id)
  quotes = quotes.filter((i) => i.id !== id)
  res.status(204).end()
})

app.get('/api/quotes/:id', (req, res) => {
  const id = Number(req.params.id)
  const quote = quotes.find((i) => i.id === id)
  quote ? res.json(quote) : res.status(404).end()
})

app.post('/api/quotes', (req, res) => {
  const body = req.body
  if (!body.quote) {
    return res.status(400).json({
      error: 'Quote is missing',
    })
  }
  const nextId =
    quotes.length > 0 ? Math.max(...quotes.map((n) => n.id)) + 1 : 1

  const quote = {
    id: nextId,
    date: new Date(),
    quote: body.quote,
    author: body.author,
  }

  quotes = quotes.concat(quote)
  res.json(quote)
})

app.use(notFound)

const PORT = process.env.PORT || 3030
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
