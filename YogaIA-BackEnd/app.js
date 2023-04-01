require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()
const { connect } = require('./app/models')

app.use(cors())
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

connect()
    .then(() => {
        console.log('DB is connected to mongo')
    })
    .catch(error => {
        console.error('Database connection error', error)
    })

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to bezkoder application.' })
})

app.listen(process.env.PORT || 3000, process.env.HOST, async () => {
    console.log(
        `Server is running on port http://${process.env.HOST}:${
            process.env.PORT || 3000
        }`
    )
})
