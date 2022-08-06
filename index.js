require('dotenv')
const express = require('express')

const app = express()

app.get('/', (_, res) => {
  res.send('testing')
})

const PORT = process.env.PORT || 3030
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
