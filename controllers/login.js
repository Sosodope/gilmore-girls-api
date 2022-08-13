const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')

loginRouter.post('/', async (req, res) => {
  const { username, password } = req.body

  const user = await User.findOne({ username })
  const pwCorrect =
    user === null ? false : await bcrypt.compare(password, user.passwordHash)

  if (!(user && pwCorrect)) {
    return res.status(401).json({
      error: 'Invalid credentials',
    })
  }

  const userToken = {
    username: user.username,
    id: user._id,
  }

  const token = jwt.sign(userToken, process.env.SECRET, { expiresIn: 60 * 60 })
  res.status(200).send({ token, username: user.username, name: user.name })
})

module.exports = loginRouter
