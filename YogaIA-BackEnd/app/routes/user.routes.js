const express = require('express')
const router = express.Router()

const UserController = require('../controllers/user.controller.js')

router.get('/description', UserController.description)
router.post('/verify', UserController.verifyIdentification)
router.post('/', UserController.create)
router.get('/:id', UserController.findOne)
router.get('/photo/:id', UserController.getImageUser)

module.exports = router
