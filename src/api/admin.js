import api from '@/api/axios'

export const apiGetUsers = async (pagination = {}) => {
    const response = await api.get('/admin/users/', { params: pagination })
    return response.data
}

export const apiChangeRole = async (userId, role) => {
    const response = await api.patch(`/admin/users/${userId}/role`, { role })
    return response.data
}

export const apiSoftDelete = async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`)
}
