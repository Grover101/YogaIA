const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')
const basename = path.basename(__filename)
const db = {}

// cargador dinamico de modelos
fs.readdirSync(__dirname)
    .filter(
        file =>
            file.indexOf('.') !== 0 &&
            file !== basename &&
            file.slice(-3) === '.js'
    )
    .forEach(file => {
        const model = require(path.join(__dirname, file))(mongoose)
        const name = file
            .slice(0, file.indexOf('.'))
            .replace(/\b\w/g, l => l.toUpperCase())
        db[name] = model
    })

db.connect = async () => {
    const DB_URI =
        process.env.NODE_ENV === 'dev'
            ? process.env.MONGO_URI_DEV ?? ''
            : process.env.NODE_ENV === 'test'
            ? process.env.MONGO_URI_TEST ?? ''
            : process.env.MONGO_URI_PRO ?? ''
    mongoose.set('strictQuery', true)
    await mongoose.connect(DB_URI)
}

db.close = async () => await mongoose.connection.close()

module.exports = db
