const { getFullFaceDescription } = require('../helpers/face')
const { upLoadImage } = require('../helpers/upload')
const path = require('path')
const { User } = require('../models')

module.exports = {
    async create(req, res) {
        try {
            const data = req.body
            const photo = req.files
                ? await upLoadImage(req.files, 'users')
                : null

            const image = path.join(
                __dirname,
                '../uploads/',
                'users',
                'a9523661-360a-49a1-b720-35094de9e52b.jpg'
            )

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
    }
}
