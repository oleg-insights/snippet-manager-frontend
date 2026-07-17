<script setup>
import { ref, onMounted, watch } from 'vue'
import { useTagsStore } from '@/stores/tags'
import { useTemplatesStore } from '@/stores/templates'
import { useToast } from 'vue-toastification'
import { useRoute, useRouter } from 'vue-router'
import { DEFAULT_SUBTITLE_CONTENT, DEFAULT_TEXT_CONTENT, DEFAULT_CODE_CONTENT } from '@/constants'

import TemplateEditorTagList from '@/components/TemplateEditorTagList.vue'
import TemplateEditorBlockList from '@/components/TemplateEditorBlockList.vue'
import TemplatePreview from '@/components/TemplatePreview.vue'

const toast = useToast()
const route = useRoute()
const router = useRouter()

const tagsStore = useTagsStore()
const templatesStore = useTemplatesStore()
const visibleTags = ref([])

const editableTemplate = ref(null)
const titleBlock = ref({
    id: Date.now(),
    type: 'title',
    data: null,
    showPicker: false
})

const focusedBlockId = ref(null)
const syncedBlockId = ref(null)

const toggleFocusId = (id) => {
    focusedBlockId.value = id
}
const toggleSyncId = (id) => {
    syncedBlockId.value = id
}

const focusOut = () => {
    focusedBlockId.value = null
}
const syncOut = () => {
    syncedBlockId.value = null
}

const addTag = (tag) => {
    editableTemplate.value.tags.push({ name: tag.name })
}

const delTag = (tag) => {
    editableTemplate.value.tags = editableTemplate.value.tags.filter((templateTag) => templateTag.name !== tag.name)
}

const addBlock = (type, index) => {
    const data = type === 'text' ? DEFAULT_TEXT_CONTENT : type === 'subtitle' ? DEFAULT_SUBTITLE_CONTENT : type === 'code' ? DEFAULT_CODE_CONTENT : ''

    const newBlock = {
        id: Date.now(),
        type,
        data,
        showPicker: false
    }

    editableTemplate.value.content.splice(index, 0, newBlock)

    if (index === 0) {
        titleBlock.value.showPicker = false
    } else {
        editableTemplate.value.content[index - 1].showPicker = false
    }
}

const delBlock = (index) => {
    editableTemplate.value.content.splice(index - 1, 1)
}

const moveBlock = (index, direction) => {
    const newIndex = index - 1 + direction
    ;[editableTemplate.value.content[index - 1], editableTemplate.value.content[newIndex]] = [
        editableTemplate.value.content[newIndex],
        editableTemplate.value.content[index - 1]
    ]
}

const saveChanges = async () => {
    try {
        await templatesStore.updateTemplate(editableTemplate.value)
        toast.success(`Шаблон "${editableTemplate.value.title}" обновлен`)
    } catch (err) {
        console.error(err.message)
    }
}

const togglePublish = async () => {
    try {
        if (editableTemplate.value.isPublic) {
            await templatesStore.unpublishTemplate(editableTemplate.value.id)
            toast.success('Шаблон снят c публикации')
        } else {
            await templatesStore.publishTemplate(editableTemplate.value.id)
            toast.success('Шаблон опубликован')
        }
        editableTemplate.value.isPublic = !editableTemplate.value.isPublic
    } catch (err) {
        console.error(err.message)
    }
}

const deleteTemplate = async () => {
    if (!confirm('Шаблон будет удален безвозвратно')) return

    try {
        await templatesStore.deleteTemplate(editableTemplate.value.id)
        router.push('/')
        toast.success('Шаблон удален')
    } catch (err) {
        console.error(err.message)
    }
}

watch(
    () => titleBlock.value.data,
    (newTitle) => {
        if (editableTemplate.value) {
            editableTemplate.value.title = newTitle
        }
    }
)

onMounted(async () => {
    await tagsStore.getTags({ sortBy: 'name', order: 'asc' })
    visibleTags.value = tagsStore.tags

    const current = templatesStore.currentTemplate
    if (!current || current.id !== route.params.id) {
        await templatesStore.getTemplate(route.params.id)
    }

    editableTemplate.value = JSON.parse(JSON.stringify(templatesStore.currentTemplate))
    editableTemplate.value.content = editableTemplate.value.content.map((block, index) => {
        block.id = Date.now() + index
        // Корректные скобки и амперсанды в редакторе
        if (block.type === 'code' && block.data) {
            block.data = block.data.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
        }
        return block
    })
    titleBlock.value.data = editableTemplate.value.title
})
</script>

<template>
    <div v-if="!editableTemplate">Загрузка...</div>
    <div v-else class="columns">
        <!-- Левая панель -->
        <div class="editor-panel">
            <div class="section-title">✏️ РЕДАКТИРОВАНИЕ ШАБЛОНА</div>
            <TemplateEditorTagList :visible-tags="visibleTags" :template-tags="editableTemplate.tags" @add-tag="addTag" @del-tag="delTag" />
            <TemplateEditorBlockList
                :title-block="titleBlock"
                :blocks="editableTemplate.content"
                :synced-block-id="syncedBlockId"
                @add-block="addBlock"
                @move-block="moveBlock"
                @del-block="delBlock"
                @toggle-focus-id="toggleFocusId"
                @focus-out="focusOut"
                @save-template="saveChanges"
            />
        </div>

        <!-- Правая панель: предпросмотр -->
        <div class="preview-panel">
            <div class="section-title">👁️ ПРЕДПРОСМОТР</div>

            <TemplatePreview
                :title-block="titleBlock"
                :blocks="editableTemplate.content"
                :is-public="editableTemplate.isPublic"
                :is-editor="true"
                :focused-block-id="focusedBlockId"
                @toggle-publish="togglePublish"
                @delete-template="deleteTemplate"
                @toggle-sync-id="toggleSyncId"
                @sync-out="syncOut"
            />
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
