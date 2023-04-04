module.exports = mongoose => {
    const schema = mongoose.Schema(
        {
            name: String,
            lastName: String,
            date: String,
            email: String,
            ci: String,
            genero: String,
            photo: String,
            descriptor: []
        },
        { timestamps: true }
    )

    schema.method('toJSON', function () {
        const { __v, _id, ...object } = this.toObject()
        object.id = _id
        return object
    })

    const User = mongoose.model('user', schema)
    return User
}
