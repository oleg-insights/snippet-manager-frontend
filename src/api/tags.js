import api from '@/api/axios'

export const apiGetTags = async (pagination = {}) => {
    const response = await api.get('/tags', { params: pagination })
    return response.data
}
