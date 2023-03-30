export const fetchAPI = async datos => {
    try {
        const res = await fetch('http://localhost:3000/api/users', {
            method: 'POST',
            body: datos,
            headers: {}
        })
        const message = await res.json()
        return message
    } catch (error) {
        return error
    }
}
