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
