const quotesRouter = require('express').Router()
const Quote = require('../models/quote')
const User = require('../models/user')

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
  try {
    await Quote.findByIdAndDelete(id)
    res.status(204).end()
  } catch (error) {
    next(error)
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

quotesRouter.put('/:id', async (req, res, next) => {
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

quotesRouter.post('/', async (req, res, next) => {
  const { quote, author, userId } = req.body

  const user = await User.findById(userId)
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
      user: user._id,
    })

    const result = await entry.save()
    user.quotes = user.quotes.concat(result._id)
    await user.save()
    res.json(result)
  } catch (error) {
    next(error)
  }
})

module.exports = quotesRouter
