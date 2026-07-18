<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useTemplatesStore } from '@/stores/templates'
import { useAuthStore } from '@/stores/auth'
import { DEFAULT_IMAGE_CONTENT } from '@/constants'
import { parseTextBlocks } from '@/utils/textParser'
import { useTagsStore } from '@/stores/tags'
const tagsStore = useTagsStore()

import CodeBlock from '@/components/CodeBlock.vue'

const toast = useToast()
const route = useRoute()
const router = useRouter()
const templateId = computed(() => route.params.id)

const templatesStore = useTemplatesStore()
const template = computed(() => templatesStore.currentTemplate)
const tagNames = computed(() => templatesStore.currentTemplate?.tags?.map((tag) => tag.name) ?? [])

const authStore = useAuthStore()

const loadTemplate = async (id) => {
    if (!id) return

    const current = templatesStore.currentTemplate

    try {
        if (!current || current.id !== id) {
            await templatesStore.getTemplate(id)
        }
    } catch (tpl_err) {
        console.error(tpl_err.message)
    }
}

const deleteTemplate = async () => {
    if (!confirm('Шаблон будет удален безвозвратно')) return

    try {
        await templatesStore.deleteTemplate(templateId.value)
        router.push('/')
        toast.success('Шаблон удален')
    } catch (err) {
        console.error(err.message)
    }
}

const togglePublish = async () => {
    try {
        if (template.value.isPublic) {
            const template = await templatesStore.unpublishTemplate(templateId.value)
            console.log(tagsStore.tags)
            toast.success('Шаблон снят c публикации')
        } else {
            await templatesStore.publishTemplate(templateId.value)
            toast.success('Шаблон опубликован')
        }
        template.value.isPublic = !template.value.isPublic
    } catch (err) {
        console.error(err.message)
    }
}

const isCopied = ref(false)

const copyTemplateContent = async () => {
    const container = document.querySelector('.preview-container')
    if (!container) return

    try {
        const clone = container.cloneNode(true)
        const selectorsToRemove = ['.preview-meta', '.preview-title', '.preview-code-header']

        selectorsToRemove.forEach((selector) => {
            const elements = clone.querySelectorAll(selector)
            elements.forEach((el) => el.remove())
        })

        const htmlContent = clone.innerHTML
        const textContent = clone.textContent

        await navigator.clipboard.write([
            new ClipboardItem({
                'text/html': new Blob([htmlContent], { type: 'text/html' }),
                'text/plain': new Blob([textContent], { type: 'text/plain' })
            })
        ])

        isCopied.value = true
    } catch (err) {
        toast.error('Не удалось скопировать')
    } finally {
        setTimeout(() => {
            isCopied.value = false
        }, 1000)
    }
}

watch(
    templateId,
    (newId) => {
        loadTemplate(newId)
    },
    { immediate: true }
)
</script>

<template>
    <div class="columns">
        <!-- Правая панель: предпросмотр -->
        <div class="preview-panel">
            <div v-if="templatesStore.isLoadingOne">Загрузка шаблона...</div>
            <div v-else-if="template" class="preview-scroll">
                <div class="preview-container">
                    <!-- Данные шаблона -->
                    <div class="preview-block">
                        <div class="preview-meta">
                            <div class="template-author">Автор: {{ template.author ? template.author.name : 'Недоступно' }}</div>
                            <div class="control-buttons">
                                <button @click="copyTemplateContent" class="control-btn copy-btn" :class="{ copied: isCopied }">
                                    [ {{ isCopied ? '✔ Скопировано' : '⮺ Копировать' }} ]
                                </button>
                                <router-link
                                    v-if="template.author?.id && template.author.id === authStore.user?.id"
                                    :to="`/template/${templateId}/edit`"
                                    class="control-btn edit-btn"
                                >
                                    [ ✎ Редактировать ]
                                </router-link>
                                <button
                                    v-if="template.author?.id && template.author.id === authStore.user?.id"
                                    @click="togglePublish"
                                    class="control-btn publish-btn"
                                >
                                    [ {{ template.isPublic ? '🔒︎ Снять с публикации' : '🔓︎ Опубликовать' }} ]
                                </button>
                                <button
                                    v-if="template.author?.id && template.author.id === authStore.user?.id"
                                    @click="deleteTemplate"
                                    class="control-btn del-btn"
                                >
                                    [ ✖ Удалить ]
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Заголовок -->
                    <div class="preview-block">
                        <div class="preview-title">
                            <h1>{{ template.title }}</h1>
                        </div>
                    </div>

                    <!-- Блоки контента -->
                    <div v-for="block in template.content" :key="block.id" class="preview-block">
                        <div :class="`preview-${block.type}`">
                            <h2 v-if="block.type === 'subtitle'">{{ block.data }}</h2>

                            <img
                                v-else-if="block.type === 'image'"
                                @error="(e) => (e.target.src = DEFAULT_IMAGE_CONTENT)"
                                :src="block.data || DEFAULT_IMAGE_CONTENT"
                            />

                            <template v-else-if="block.type === 'text'">
                                <div v-for="textBlock in parseTextBlocks(block.data)" :key="textBlock">
                                    <p v-if="textBlock.type === 'p'" :class="{ 'mt-3': textBlock.gap }" v-html="textBlock.data"></p>
                                    <ul v-else-if="textBlock.type === 'ul'" :class="{ 'mt-4': textBlock.gap }">
                                        <li v-for="item in textBlock.data" :key="item" v-html="item"></li>
                                    </ul>
                                    <ol v-else-if="textBlock.type === 'ol'" :class="{ 'mt-4': textBlock.gap }">
                                        <li v-for="item in textBlock.data" :key="item" v-html="item"></li>
                                    </ol>
                                </div>
                            </template>

                            <CodeBlock v-else-if="block.type === 'code'" :block="block" />
                        </div>
                    </div>
                    <div class="preview-meta preview-tags">🏷️ Теги: {{ tagNames.join(', ') }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Две колонки */
.columns {
    display: flex;
    gap: 24px;
    flex: 1;
    min-height: 0;
}

/* Левая панель — редактор */
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
.preview-scroll {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
    padding-right: 6px;
}
.preview-container {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
}
/* Блоки предпросмотра */
.preview-block {
    transition: all 0.1s;
    border-radius: 12px;
    padding: 8px;
}
.preview-block.highlight {
    background: #fef9c3;
    border-left: 4px solid #eab308;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}
.preview-title {
    margin-bottom: 0.1rem;
}
.preview-text {
    font-size: 1rem;
    line-height: 1.25;
    color: #334155;
}
.preview-text p {
    white-space: pre-wrap;
}
.preview-text ul {
    list-style-type: none;
}
.preview-text ol {
    list-style-type: decimal;
    list-style-position: inside;
}
.preview-text li {
    margin-left: 0.25rem;
    font-size: 0.9rem;
}
.preview-text ul li::before {
    content: '•';
    margin-right: 0.25rem;
}
:deep(.preview-text-link) {
    color: #3b82f6;
}
.preview-image img {
    max-width: 100%;
    border-radius: 12px;
    margin: 8px 0;
}
.preview-code {
    background: #f9fafb;
    border-radius: 12px;
    padding: 0.5rem 1rem 1rem;
}
.preview-code-header {
    display: flex;
    justify-content: space-between;
    color: #0f1115;
    margin-bottom: 1rem;
}
.preview-code-lang {
    font-size: 0.75rem;
}
.preview-code-copy {
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 500;
    padding: 0.25rem 1rem;
    color: #61666b;
    cursor: pointer;
}
.preview-code-copy:not(.copied):hover {
    background: rgb(38 49 72 / 6%);
}
.preview-code-copy.copied {
    color: #55bf55;
    cursor: default;
}
.preview-code pre {
    tab-size: 2;
    font-size: 0.9rem;
    white-space: pre-wrap;
    font-family: monospace;
}
.preview-meta {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    font-size: 0.7rem;
    color: #94a3b8;
    margin-top: 8px;
    cursor: default;
}
.preview-tags {
    border-top: 1px solid #f1f5f9;
    padding: 0.5rem;
}
.control-buttons {
    display: flex;
    gap: 0.25rem;
}
.control-btn {
    cursor: pointer;
}
.edit-btn:hover,
.publish-btn:hover,
.copy-btn:hover {
    color: black;
}
.del-btn:hover {
    color: orangered;
}
.copy-btn.copied {
    color: #55bf55;
    cursor: default;
}
.empty-placeholder {
    color: #94a3b8;
    font-style: italic;
    font-size: 0.8rem;
    padding: 4px 0;
}

/* Скроллбары */
.editor-scroll::-webkit-scrollbar,
.preview-scroll::-webkit-scrollbar {
    width: 6px;
}
.editor-scroll::-webkit-scrollbar-track,
.preview-scroll::-webkit-scrollbar-track {
    background: #e9eef3;
    border-radius: 8px;
}
.editor-scroll::-webkit-scrollbar-thumb,
.preview-scroll::-webkit-scrollbar-thumb {
    background: #b9c8e0;
    border-radius: 8px;
}
.mt-3 {
    margin-top: 0.75rem;
}
.mt-4 {
    margin-top: 1rem;
}
</style>
