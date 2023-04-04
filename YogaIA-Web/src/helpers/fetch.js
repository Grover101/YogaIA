const BASE_URL = 'http://localhost:9000/api'

export const fetchAPI = async (datos, route) => {
    try {
        const res = await fetch(`${BASE_URL}${route}`, {
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
