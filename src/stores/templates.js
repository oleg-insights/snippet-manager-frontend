import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
    apiGetTemplate,
    apiGetTemplates,
    apiCreateTemplate,
    apiDeleteTemplate,
    apiPublishTemplate,
    apiUnpublishTemplate,
    apiUpdateTemplate
} from '@/api/templates'

export const useTemplatesStore = defineStore('templates', () => {
    const templates = ref([])
    const selectedTags = ref([])
    const availableTags = ref([])
    const suggestedParents = ref([])
    const currentTemplate = ref(null)

    const isLoadingOne = ref(false)
    const isCreating = ref(false)
    const isUpdating = ref(false)

    const getTemplates = async (pagination = {}, tagIds = []) => {
        const response = await apiGetTemplates(pagination, tagIds)
        templates.value = response.data
        selectedTags.value = response.selectedTags
        availableTags.value = response.availableTags
        suggestedParents.value = response.suggestedParents
    }

    const getTemplate = async (templateId) => {
        try {
            isLoadingOne.value = true
            const response = await apiGetTemplate(templateId)
            currentTemplate.value = response
        } finally {
            isLoadingOne.value = false
        }
    }

    const clearTemplate = () => {
        currentTemplate.value = null
    }

    const createTemplate = async (template) => {
        const { title, content, tags } = template
        const tagIds = tags.filter((t) => t.id).map((t) => t.id)
        const newTagNames = tags.filter((t) => !t.id).map((t) => t.name)

        const payload = { title, content }

        if (tagIds.length) payload.tagIds = tagIds
        if (newTagNames.length) payload.newTagNames = newTagNames

        try {
            isCreating.value = true
            const createdTemplate = await apiCreateTemplate(payload)
            templates.value.push(createdTemplate)
            return createdTemplate
        } finally {
            isCreating.value = false
        }
    }

    const updateTemplate = async (template) => {
        const { title, content, tags } = template
        const tagIds = tags.filter((t) => t.id).map((t) => t.id)
        const newTagNames = tags.filter((t) => !t.id).map((t) => t.name)

        const payload = { title, content, tagIds }

        if (newTagNames.length) payload.newTagNames = newTagNames

        try {
            isUpdating.value = true
            const updatedTemplate = await apiUpdateTemplate(template.id, payload)
            currentTemplate.value = updatedTemplate
        } finally {
            isUpdating.value = false
        }
    }

    const deleteTemplate = async (templateId) => {
        await apiDeleteTemplate(templateId)
    }

    const publishTemplate = async (templateId) => {
        const template = await apiPublishTemplate(templateId)
        return template
    }

    const unpublishTemplate = async (templateId) => {
        const template = await apiUnpublishTemplate(templateId)
        return template
    }

    const toggleTag = (tag) => {
        const idx = selectedTags.value.findIndex((t) => t.id === tag.id)
        if (idx >= 0) {
            selectedTags.value.splice(idx, 1)
        } else {
            selectedTags.value.push(tag)
        }

        const tagIds = selectedTags.value.map((t) => t.id)

        const pagination = {}
        getTemplates(pagination, tagIds)
    }

    const selectParentTag = (parentTag) => {
        parentTag.childIds.forEach((childId) => {
            const childIdx = selectedTags.value.findIndex((t) => t.id === childId)
            if (childIdx >= 0) {
                selectedTags.value.splice(childIdx, 1)
            }
        })

        const { childIds, ...newTag } = parentTag
        selectedTags.value.push(newTag)

        const tagIds = selectedTags.value.map((t) => t.id)

        const pagination = {}
        getTemplates(pagination, tagIds)
    }

    return {
        templates,
        selectedTags,
        availableTags,
        suggestedParents,
        currentTemplate,

        getTemplate,
        getTemplates,
        createTemplate,
        deleteTemplate,
        publishTemplate,
        unpublishTemplate,
        updateTemplate,
        clearTemplate,
        toggleTag,
        selectParentTag,

        isLoadingOne,
        isCreating,
        isUpdating
    }
})
