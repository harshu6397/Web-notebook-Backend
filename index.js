// Environment variables 
require('dotenv').config(); 

// importing connecting to the database
const connectToMongo = require('./db');

// importing express
const express = require('express')
const cors = require('cors')

// run the connectToMongo function
connectToMongo(); 
 
// creating a new express app
const app = express()
console.log(process.env)
const port = process.env.PORT || 8000

// Middleware
app.use(cors())
app.use(express.json())

// Available routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))

// Home route
app.get('/', (req, res) => {
  res.send('Hello World!')
})

// listening to the port
app.listen(port, () => {
  console.log(`Web-Notebook Apis listening at URL http://localhost:${port}/`)
})