const quotesRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Quote = require('../models/quote')
const User = require('../models/user')

const getTokenFromReq = (req) => {
  const authorization = req.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

quotesRouter.get('/', async (req, res, next) => {
  const page = parseInt(req.query.page)
  const limit = parseInt(req.query.limit)
  const startIndex = (page - 1) * limit
  const endIndex = page * limit

  const results = {}

  if (endIndex < (await Quote.countDocuments().exec())) {
    results.next = {
      page: page + 1,
      limit: limit,
    }
  }

  if (startIndex > 0) {
    results.previous = {
      page: page - 1,
      limit: limit,
    }
  }

  try {
    results.results = await Quote.find({}).limit(limit).skip(startIndex).exec()
    res.json(results)
  } catch (error) {
    next(error)
  }
})

quotesRouter.delete('/:id', async (req, res, next) => {
  const { id } = req.params
  const token = getTokenFromReq(req)
  const decodedToken = jwt.verify(token, process.env.SECRET)

  if (!decodedToken.id) {
    return res.status(401).json({ error: 'Invalid token' })
  }
  const user = await User.findById(decodedToken.id)
  if (user.username === 'adminGG') {
    try {
      await Quote.findByIdAndDelete(id)
      res.status(204).end()
    } catch (error) {
      next(error)
    }
  }
})

quotesRouter.get('/:id', async (req, res, next) => {
  const { id } = req.params
  try {
    const result = await Quote.findById(id)
    res.json(result)
  } catch (error) {
    next(error)
  }
})

quotesRouter.post('/', async (req, res, next) => {
  const body = req.body
  if (!body.quote || !body.author) {
    return res.status(400).json({
      error: 'Some data seems to be missing',
    })
  }

  const token = getTokenFromReq(req)
  const decodedToken = jwt.verify(token, process.env.SECRET)

  if (!decodedToken.id) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  const user = await User.findById(decodedToken.id)
  try {
    const entry = new Quote({
      date: new Date(),
      quote: body.quote,
      author: body.author,
      user: user._id,
    })

    const result = await entry.save()
    user.quotes = user.quotes.concat(result._id)
    await user.save()
    return res.status(201).json(result)
  } catch (error) {
    next(error)
  }
})

module.exports = quotesRouter
