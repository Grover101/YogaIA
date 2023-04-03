const express = require('express')
const router = express.Router()

router.use('/users', require('./user.routes'))

module.exports = router
