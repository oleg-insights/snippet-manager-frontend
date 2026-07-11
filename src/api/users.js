import api from '@/api/axios'

export const apiGetMe = async () => {
    const response = await api.get('/users/me')
    return response.data
}

export const apiGetUser = async (id) => {
    const response = await api.get(`/users/${id}`)
    return response.data
}

export const apiGetUsers = async (pagination = {}) => {
    const response = await api.get('/users', { params: pagination })
    return response.data
}

export const apiUpdateMe = async (fields) => {
    const response = await api.patch('/users/me', fields)
    return response.data
}

export const apiUpdatePassword = async ({ oldPassword, newPassword }) => {
    await api.patch('/users/me/password', { oldPassword, newPassword })
}
