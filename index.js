require('dotenv').config()
const express = require('express')

const app = express()
const usersRouter = require('./controllers/users')
const quotesRouter = require('./controllers/quotes')
const loginRouter = require('./controllers/login')

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
    case 'TokenExpiredError':
      return res.status(401).json({ error: 'token expired' })
    default:
      break
  }
  next(error)
}

// express json-parser - to access incoming data
app.use(express.json())

app.use('/api/quotes', quotesRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

// custom middlewares
app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 3030
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
