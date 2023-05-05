const express = require('express')
const router = express.Router()

router.use('/users', require('./user.routes'))
router.use('/activity', require('./activity.routes'))

module.exports = router
