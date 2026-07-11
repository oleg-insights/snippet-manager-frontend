import { ref } from 'vue'
import { defineStore } from 'pinia'
import { apiGetTags } from '@/api/tags'

export const useTagsStore = defineStore('tags', () => {
    const tags = ref([])

    const getTags = async (pagination = {}) => {
        const response = await apiGetTags(pagination)
        tags.value = response.data
    }

    return { tags, getTags }
})
