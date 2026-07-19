<script setup>
import { computed } from 'vue'
import { useTemplatesStore } from '@/stores/templates'
import { useTagsStore } from '@/stores/tags'

import Tag from '@/components/Tag.vue'

const props = defineProps({
    highlightedTagIds: Array
})

const emit = defineEmits(['toggle-tag'])

const templatesStore = useTemplatesStore()
const tagsStore = useTagsStore()

const displayedTags = computed(() => {
    const selectedIds = new Set(templatesStore.selectedTags.map((t) => String(t.id)))
    const availableIds = new Set(templatesStore.availableTags.map((t) => String(t.id)))
    const parentIds = new Set(templatesStore.suggestedParents.map((t) => String(t.id)))

    const allTags = tagsStore.tags.map((tag) => {
        const id = String(tag.id)
        const isSelected = selectedIds.has(id)
        const isAvailable = availableIds.has(id)
        const isParent = parentIds.has(id)
        const isDisabled = !isSelected && !isAvailable && !isParent
        return { ...tag, isSelected, isDisabled, isParent }
    })

    const filtered = allTags.filter((tag) => !tag.isParent)

    const result = filtered.sort((a, b) => {
        if (a.isSelected && !b.isSelected) return -1
        if (!a.isSelected && b.isSelected) return 1
        if (a.isDisabled && !b.isDisabled) return 1
        if (!a.isDisabled && b.isDisabled) return -1
        return 0
    })

    return result
})

const isChild = (tagId) => {
    return props.highlightedTagIds.some((id) => id === tagId)
}
</script>

<template>
    <div class="tags-panel">
        <div v-if="displayedTags.length" class="tags-scroll">
            <div class="tags-flex">
                <Tag
                    v-for="tag in displayedTags"
                    :key="tag.id"
                    :tag="tag"
                    :selected="tag.isSelected"
                    :disabled="tag.isDisabled"
                    :highlight="isChild(tag.id)"
                    @toggle-tag="emit('toggle-tag', tag)"
                />
            </div>
        </div>
        <div v-else class="no-content">Теги появятся после создания шаблона</div>
    </div>
</template>

<style scoped>
/* Левая колонка — теги */
.tags-panel {
    flex: 1.2;
    background: #f8fafc;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    padding: 16px;
    gap: 12px;
    min-height: 0;
}
/* Скролл для тегов */
.tags-scroll {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
    padding-right: 4px;
}
.tags-flex {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

/* Кастомный скролл */
.tags-scroll::-webkit-scrollbar {
    width: 6px;
}
.tags-scroll::-webkit-scrollbar-track {
    background: #e9eef3;
    border-radius: 8px;
}
.tags-scroll::-webkit-scrollbar-thumb {
    background: #b9c8e0;
    border-radius: 8px;
}

.no-content {
    font-size: 1.25rem;
    font-weight: 500;
    text-align: center;
    padding-top: 2rem;
}
</style>
