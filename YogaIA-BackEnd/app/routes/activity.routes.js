const express = require('express')
const router = express.Router()

const ActivityController = require('../controllers/activity.controller.js')

router.get('/:id', ActivityController.getUserActivities)
router.post('/', ActivityController.create)

module.exports = router
