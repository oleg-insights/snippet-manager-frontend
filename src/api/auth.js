import api from '@/api/axios'

export const apiRegister = async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password })
    return response.data
}

export const apiLogin = async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
}

export const apiLogout = async () => {
    await api.post('/auth/logout')
}

export const apiRefresh = async () => {
    await api.post('/auth/refresh')
}
