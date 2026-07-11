<script setup>
import { ref, onMounted, watch } from 'vue'
import { useTagsStore } from '@/stores/tags'
import { useTemplatesStore } from '@/stores/templates'
import { useToast } from 'vue-toastification'
import { useRouter } from 'vue-router'
import { DEFAULT_TITLE_CONTENT, DEFAULT_SUBTITLE_CONTENT, DEFAULT_TEXT_CONTENT, DEFAULT_CODE_CONTENT } from '@/constants'

import TemplateEditorTagList from '@/components/TemplateEditorTagList.vue'
import TemplateEditorBlockList from '@/components/TemplateEditorBlockList.vue'
import TemplatePreview from '@/components/TemplatePreview.vue'

const toast = useToast()
const router = useRouter()

const tagsStore = useTagsStore()
const templatesStore = useTemplatesStore()
const visibleTags = ref([])

const template = ref({ title: DEFAULT_TITLE_CONTENT, content: [], tags: [] })
const titleBlock = ref({
    id: Date.now(),
    type: 'title',
    data: template.value.title,
    showPicker: false
})

const focusedBlockId = ref(null)

const toggleFocusId = (id) => {
    focusedBlockId.value = id
}

const focusOut = () => {
    focusedBlockId.value = null
}

const addTag = (tag) => {
    template.value.tags.push(tag)
}

const delTag = (tag) => {
    template.value.tags = template.value.tags.filter((templateTag) => templateTag.name !== tag.name)
}

const addBlock = (type, index) => {
    const data = type === 'text' ? DEFAULT_TEXT_CONTENT : type === 'subtitle' ? DEFAULT_SUBTITLE_CONTENT : type === 'code' ? DEFAULT_CODE_CONTENT : ''

    const newBlock = {
        id: Date.now(),
        type,
        data,
        showPicker: false
    }

    template.value.content.splice(index, 0, newBlock)

    if (index === 0) {
        titleBlock.value.showPicker = false
    } else {
        template.value.content[index - 1].showPicker = false
    }
}

const delBlock = (index) => {
    template.value.content.splice(index - 1, 1)
}

const moveBlock = (index, direction) => {
    const newIndex = index - 1 + direction
    ;[template.value.content[index - 1], template.value.content[newIndex]] = [template.value.content[newIndex], template.value.content[index - 1]]
}

const saveTemplate = async () => {
    try {
        const savedTemplate = await templatesStore.createTemplate(template.value)
        toast.success(`Шаблон "${template.value.title}" создан`)
        if (savedTemplate?.id) router.push(`/template/${savedTemplate.id}`)
    } catch (err) {
        console.error(err.message)
    }
}

watch(
    () => titleBlock.value.data,
    (newTitle) => {
        template.value.title = newTitle
    }
)

onMounted(async () => {
    await tagsStore.getTags({ sortBy: 'name', order: 'asc' })
    visibleTags.value = tagsStore.tags
})
</script>

<template>
    <div class="columns">
        <!-- Левая панель -->
        <div class="editor-panel">
            <div class="section-title">✏️ СОЗДАНИЕ ШАБЛОНА</div>
            <TemplateEditorTagList :visible-tags="visibleTags" :template-tags="template.tags" @add-tag="addTag" @del-tag="delTag" />
            <TemplateEditorBlockList
                :titleBlock="titleBlock"
                :blocks="template.content"
                @add-block="addBlock"
                @move-block="moveBlock"
                @del-block="delBlock"
                @toggle-focus-id="toggleFocusId"
                @focus-out="focusOut"
                @save-template="saveTemplate"
            />
        </div>

        <!-- Правая панель: предпросмотр -->
        <div class="preview-panel">
            <div class="section-title">👁️ ПРЕДПРОСМОТР</div>

            <TemplatePreview :title-block="titleBlock" :blocks="template.content" :is-editor="false" :focused-block-id="focusedBlockId" />
        </div>
    </div>
</template>

<style scoped>
/* Режим редактирования */
.mode-badge {
    background: #dbeafe;
    color: #1e40af;
    border-radius: 2rem;
    padding: 4px 14px;
    font-size: 0.75rem;
    font-weight: 600;
}

/* Две колонки */
.columns {
    display: flex;
    gap: 24px;
    flex: 1;
    min-height: 0;
}

/* Левая панель — редактор */
.editor-panel {
    flex: 1.2;
    background: #f8fafc;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    padding: 16px;
    gap: 16px;
    min-height: 0;
}
.preview-panel {
    flex: 2.5;
    background: white;
    border-radius: 20px;
    border: 1px solid #eef2ff;
    display: flex;
    flex-direction: column;
    padding: 16px;
    gap: 12px;
    min-height: 0;
}

/* Правая панель — предпросмотр */
.section-title {
    font-size: 0.7rem;
    text-transform: uppercase;
    font-weight: 600;
    color: #5b6e8c;
    flex-shrink: 0;
}
</style>
