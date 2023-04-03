require('dotenv').config()
const express = require('express')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const app = express()
const { connect } = require('./app/models')
const { loadModels } = require('./app/helpers/face')

app.use(cors())
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: '/tmp/',
        createParentPath: true
    })
)
app.use('/api', require('./app/routes/router'))

connect()
    .then(() => {
        console.log('DB is connected to mongo')
    })
    .catch(error => {
        console.error('Database connection error', error)
    })

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to YogaIA application.' })
})

app.listen(process.env.PORT || 3000, process.env.HOST, async () => {
    await loadModels()
    console.log(
        `Server is running on port http://${process.env.HOST}:${
            process.env.PORT || 3000
        }`
    )
})
