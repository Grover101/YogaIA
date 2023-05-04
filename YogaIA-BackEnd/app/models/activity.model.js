module.exports = mongoose => {
    const schema = mongoose.Schema(
        {
            name: String,
            bestTime: Number,
            porcentaje: Number,
            user: String
        },
        { timestamps: true }
    )

    schema.method('toJSON', function () {
        const { __v, _id, ...object } = this.toObject()
        object.id = _id
        return object
    })

    const Activity = mongoose.model('activity', schema)
    return Activity
}
