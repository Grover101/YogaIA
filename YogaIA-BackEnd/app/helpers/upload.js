const path = require('path')
const { v4: uuidv4 } = require('uuid')
const extValid = ['jpg', 'jpeg', 'png']
const fs = require('fs')

const upLoadImage = (
    files,
    carpeta = '',
    extensionValidas = extValid,
    nombreArchivo = ''
) => {
    return new Promise((resolve, reject) => {
        const { photo } = files
        const nombreCortado = photo.name.split('.')
        const extension = nombreCortado[nombreCortado.length - 1]

        const extensionSpecial = extension === 'blob' ? 'jpeg' : extension
        if (!extensionValidas.includes(extensionSpecial.toLowerCase())) {
            return reject(
                new Error(
                    `invalid image format, valid formats are ${extensionValidas}`
                )
            )
        }

        const nombreUuid =
            nombreArchivo === ''
                ? uuidv4() + '.' + extensionSpecial
                : nombreArchivo + '.' + extensionSpecial

        const uploadPath = path.join(
            __dirname,
            '../uploads/',
            carpeta,
            nombreUuid
        )
        photo.mv(uploadPath, err => {
            if (err) {
                return reject(err)
            }
            resolve(nombreUuid)
        })
    })
}

const deleteImage = (nameImage, carpeta = '') => {
    if (nameImage) {
        const pathImagen = path.join(
            __dirname,
            '../uploads/',
            carpeta,
            nameImage
        )
        if (fs.existsSync(pathImagen)) {
            fs.unlinkSync(pathImagen)
        }
    }
}

const getImagePath = (nameImage, carpeta = '') => {
    if (!nameImage) {
        return false
    }
    const pathImagen = path.join(__dirname, '../uploads/', carpeta, nameImage)
    if (fs.existsSync(pathImagen))
        return fs.readFileSync(pathImagen, { encoding: 'base64' })
}

module.exports = {
    upLoadImage,
    deleteImage,
    getImagePath
}
