const { getFullFaceDescription, createMatcher } = require('../helpers/face')
const {
    upLoadImage,
    upLoadImageTemp,
    getImagePath
} = require('../helpers/upload')
const path = require('path')
const { User } = require('../models')
const fs = require('fs')

module.exports = {
    async create(req, res) {
        try {
            const data = req.body

            const userEmail = await User.findOne({ email: data.email }).select([
                'email'
            ])
            const userCi = await User.findOne({ ci: data.ci }).select(['ci'])

            if (userEmail)
                return res.status(400).json({ error: 'Email ya existe.' })
            if (userCi) return res.status(400).json({ error: 'CI ya existe.' })

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
            const users = await User.find().select(['descriptor'])
            const fullDesc = {}
            users.forEach(user => {
                fullDesc[user.id] = {
                    name: `${user.id}`,
                    descriptors: [user.descriptor]
                }
            })
            return res.status(200).json(fullDesc)
        } catch (error) {
            return res.status(500).json({ message: error.message })
        }
    },
    async verifyIdentification(req, res) {
        try {
            const users = await User.find().select(['descriptor'])
            if (!users.length) return res.status(200).json(null)

            const photo = req.files ? await upLoadImageTemp(req.files) : null
            const fullDescAux = {}
            users.forEach(user => {
                fullDescAux[user.id] = {
                    name: `${user.id}`,
                    descriptors: [user.descriptor]
                }
            })
            const image = path.join(__dirname, '../temp/', photo)

            const faceMatcher = await createMatcher(fullDescAux)
            const fullDesc = await getFullFaceDescription(image, 160)
            const descriptors = fullDesc.map(fd => fd.descriptor)
            const match = descriptors.map(descriptor =>
                faceMatcher.findBestMatch(descriptor)
            )

            const identify =
                match && match[0] && match[0]._label !== 'unknown'
                    ? await User.findById(match[0]?._label).select([
                          'name',
                          'lastName',
                          'email',
                          'date',
                          'genero'
                      ])
                    : null

            fs.unlinkSync(image)
            return res.status(200).json(identify)
        } catch (error) {
            return res.status(500).json({
                message: error.message || 'Error in verify Identification.'
            })
        }
    },
    async getImageUser(req, res) {
        const id = req.params.id
        try {
            const user = await User.findById(id).select(['photo'])

            if (user !== null) {
                if (user.photo !== null)
                    return res.json({
                        base: getImagePath(user.photo, 'users')
                    })
                else
                    return res.status(404).json({
                        message: 'No exist image'
                    })
            } else
                return res.status(404).json({
                    message: 'No record found'
                })
        } catch (error) {
            return res.status(500).send({
                message: 'Error retrieving User with id=' + id,
                error
            })
        }
    }
}
