require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()

app.use(cors())
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

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
