const { Activity, User } = require('./../models')

module.exports = {
    async create(req, res) {
        try {
            const data = req.body
            console.log({ data })

            const user = await User.findById(data.id).select(['id'])
            if (!user) return res.status(400).json({ error: 'User no existe.' })
            console.log(user)

            const activity = new Activity({
                name: data.name,
                porcentaje: data.porcentaje,
                bestTime: data.bestTime,
                user: data.id
            })

            const response = await activity.save()
            return res.status(201).json(response)
        } catch (error) {
            return res.status(500).json({
                message:
                    error.message ||
                    'Some error occurred while register a Progress.'
            })
        }
    },
    async getUserActivities(req, res) {
        const id = req.params.id
        try {
            const activities = await Activity.find({ user: id })

            let totalSeconds = 0
            const activitiesClean = activities.map(activity => {
                const { bestTime, name, porcentaje, createdAt } = activity
                const time = new Date(bestTime)
                const timeString = `${time
                    .getHours()
                    .toString()
                    .padStart(2, '0')}:${time
                    .getMinutes()
                    .toString()
                    .padStart(2, '0')}:${time
                    .getSeconds()
                    .toString()
                    .padStart(2, '0')}`

                totalSeconds +=
                    time.getHours() * 3600 +
                    time.getMinutes() * 60 +
                    time.getSeconds()

                return {
                    name,
                    time: timeString,
                    evaluate: porcentaje,
                    date: createdAt.toLocaleString()
                }
            })

            const date = new Date(null)
            date.setSeconds(totalSeconds)
            const timeTotalString = date.toISOString().substr(11, 8)

            return res.status(200).json({
                timeTotal: timeTotalString,
                activities: activitiesClean
            })
        } catch (error) {
            return res.status(500).json({ message: error.message })
        }
    }
}
