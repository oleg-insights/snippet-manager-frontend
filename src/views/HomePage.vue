<script setup>
import { watch } from 'vue'
import { useTemplatesStore } from '@/stores/templates'
import { useTagsStore } from '@/stores/tags'
import { useAuthStore } from '@/stores/auth'

import ParentTagList from '@/components/ParentTagList.vue'
import TagList from '@/components/TagList.vue'
import TemplateList from '@/components/TemplateList.vue'

const templatesStore = useTemplatesStore()
const tagsStore = useTagsStore()
const authStore = useAuthStore()

const toggleTag = (tag) => {
    templatesStore.toggleTag(tag)
}

const selectParentTag = (parentTag) => {
    templatesStore.selectParentTag(parentTag)
}

watch(
    () => authStore.user,
    async () => {
        try {
            await templatesStore.getTemplates({ limit: 0, sortBy: 'createdAt', order: 'desc' })
            await tagsStore.getTags({ limit: 0, sortBy: 'name', order: 'asc' })
        } catch (err) {
            console.error(err.message)
        }
    },
    { immediate: true }
)
</script>

<template>
    <div class="content-wrapper">
        <!-- Родительские теги -->
        <ParentTagList @select-parent-tag="(tag) => selectParentTag(tag)" />

        <div class="columns">
            <!-- Левая колонка: теги -->
            <TagList @toggle-tag="(tag) => toggleTag(tag)" />

            <!-- Правая колонка: шаблоны -->
            <TemplateList />
        </div>
    </div>
</template>

<style scoped>
.content-wrapper {
    display: flex;
    flex-direction: column;
    gap: 20px;
    flex: 1;
}

/* Две колонки */
.columns {
    display: flex;
    gap: 24px;
    flex: 1;
    min-height: 0;
}
</style>
