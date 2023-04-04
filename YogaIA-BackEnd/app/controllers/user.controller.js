const { getFullFaceDescription, createMatcher } = require('../helpers/face')
const { upLoadImage, upLoadImageTemp } = require('../helpers/upload')
const path = require('path')
const { User } = require('../models')
const fs = require('fs')

module.exports = {
    async create(req, res) {
        try {
            const data = req.body
            const photo = req.files
                ? await upLoadImage(req.files, 'users')
                : null

            const image = path.join(__dirname, '../uploads/', 'users', photo)

            const fullDesc = await getFullFaceDescription(image)

            const descriptor = fullDesc[0].descriptor
                .toString()
                ?.split(',')
                .map(item => Number(item))

            const user = new User({
                name: data.name,
                lastName: data.lastName,
                date: data.date,
                email: data.email,
                ci: data.ci,
                genero: data.genero,
                photo,
                descriptor
            })

            const response = await user.save(user)
            return res.status(201).json(response)
        } catch (error) {
            return res.status(500).json({
                message:
                    error.message ||
                    'Some error occurred while creating the User.'
            })
        }
    },
    async findOne(req, res) {
        const id = req.params.id
        try {
            const user = await User.findById(id).select([
                'name',
                'lastName',
                'date',
                'ci',
                'genero',
                'email'
            ])

            if (!user)
                return res
                    .status(404)
                    .json({ message: `Not found  User with id ${id}` })
            return res.status(200).json(user)
        } catch (error) {
            return res.status(500).send({
                message: 'Error retrieving User with id=' + id,
                error
            })
        }
    },
    async description(req, res) {
        try {
            const users = await User.find().select([
                'name',
                'lastName',
                'descriptor'
            ])
            const fullDesc = {}
            users.forEach(user => {
                fullDesc[user.name] = {
                    name: `${user.name} ${user.lastName}`,
                    descriptors: [user.descriptor]
                }
            })
            return res.status(200).json(fullDesc)
        } catch (error) {
            return res.status(500).json({ message: error.message })
        }
    },
    async virifyIdentification(req, res) {
        try {
            const photo = req.files ? await upLoadImageTemp(req.files) : null

            const users = await User.find().select([
                'name',
                'lastName',
                'descriptor'
            ])
            const fullDescAux = {}
            users.forEach(user => {
                fullDescAux[user.name] = {
                    name: `${user.name} ${user.lastName}`,
                    descriptors: [user.descriptor]
                }
            })

            const image = path.join(__dirname, '../temp/', photo)

            const faceMatcher = await createMatcher(fullDescAux)

            const fullDesc = await getFullFaceDescription(image, 160)
            const descriptors = fullDesc.map(fd => fd.descriptor)
            const detections = fullDesc.map(fd => fd.detection)
            const match = descriptors.map(descriptor =>
                faceMatcher.findBestMatch(descriptor)
            )

            console.log('fullDesc: ', fullDesc.length)
            console.log('descriptors: ', descriptors.length)
            console.log('detections: ', detections.length)
            console.log('match: ', match.length)

            const identify = detections
                ? detections.map((detection, i) => {
                      console.log(i)
                      return match && match[i] && match[i]._label !== 'unknown'
                          ? match[i]._label
                          : 'Desconocido'
                  })
                : null

            // console.log(identify)

            fs.unlinkSync(image)

            res.status(200).json({ identify })
        } catch (error) {
            return res.status(500).json({
                message: error.message || 'Error in verify Identification.'
            })
        }
    }
}
