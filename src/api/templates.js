import api from '@/api/axios'

export const apiGetTemplate = async (id) => {
    const response = await api.get(`/templates/${id}`)
    return response.data
}

export const apiGetTemplates = async (pagination = {}, tagIds = []) => {
    const response = await api.get('/templates', { params: { tagIds, ...pagination } })
    return response.data
}

export const apiCreateTemplate = async (templateData) => {
    const response = await api.post('/templates', templateData)
    return response.data
}

export const apiDeleteTemplate = async (id) => {
    await api.delete('/templates/' + id)
}

export const apiPublishTemplate = async (id) => {
    const response = await api.post('/templates/' + id + '/publish')
    return response.data
}

export const apiUnpublishTemplate = async (id) => {
    const response = await api.post('/templates/' + id + '/unpublish')
    return response.data
}

export const apiUpdateTemplate = async (id, templateData) => {
    const response = await api.patch('/templates/' + id, templateData)
    return response.data
}
