export const validationFom = form => {
    let validation = true
    if (!form.name.value.length) {
        form.name.error = 'Nombre es Requerido'
        validation = false
    }
    if (!form.lastName.value.length) {
        form.lastName.error = 'Apellido es Requerido'
        validation = false
    }
    if (!form.email.value.length) {
        form.email.error = 'Correo es Requerido'
        validation = false
    }
    if (
        !form.email.value.match(
            /^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/
        )
    ) {
        form.email.error = 'Correo es Invalido'
        validation = false
    }
    if (!form.ci.value.length) {
        form.ci.error = 'CI es Requerido'
        validation = false
    }
    if (!form.ci.value.match(/^(\d{8,10})+(\w[A-Z]{2,3})+$/)) {
        form.ci.error = 'CI es Invalido'
        validation = false
    }

    return [validation, form]
}

export const DataURIToBlob = dataURI => {
    const splitDataURI = dataURI
        ? dataURI?.split(',')
        : `data:image/png;base64,R0lGODlhDAAMAKIFAF5LAP/zxAAAANyuAP/gaP///wAAAAAAACH5BAEAAAUALAAAAAAMAAwAAAMlWLPcGjDKFYi9lxKBOaGcF35DhWHamZUW0K4mAbiwWtuf0uxFAgA7`.split(
              ','
          )
    const byteString =
        splitDataURI[0].indexOf('base64') >= 0
            ? atob(splitDataURI[1])
            : decodeURI(splitDataURI[1])
    const mimeString = splitDataURI[0].split(':')[1].split(';')[0]

    const ia = new Uint8Array(byteString.length)
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i)

    return new Blob([ia], { type: mimeString })
}

export const yearOld = date => {
    const dateBorn = new Date(date)
    const dateNow = new Date()

    dateNow.setDate(dateNow.getDate())
    dateNow.setMonth(dateNow.getMonth())
    dateNow.setFullYear(dateNow.getFullYear())

    return Math.floor((dateNow - dateBorn) / (1000 * 60 * 60 * 24) / 365)
}
