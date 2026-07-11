<script setup>
import { watch, nextTick, ref } from 'vue'
import { DEFAULT_TITLE_CONTENT, DEFAULT_SUBTITLE_CONTENT, DEFAULT_TEXT_CONTENT, DEFAULT_IMAGE_CONTENT } from '@/constants'
import { parseTextBlocks } from '@/utils/textParser'

import CodeBlock from '@/components/CodeBlock.vue'

const props = defineProps({
    titleBlock: Object,
    blocks: Array,
    isPublic: Boolean,
    isEditor: Boolean,
    focusedBlockId: Number
})

const emit = defineEmits(['toggle-publish', 'delete-template'])

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

const togglePublish = () => {
    emit('toggle-publish')
}

const deleteTemplate = () => {
    emit('delete-template')
}

const focusedBlockRefs = {}
const setFocusedBlockRef = (el, block) => {
    if (el) focusedBlockRefs[block.id] = el
}

watch(
    () => props.focusedBlockId,
    (newId) => {
        if (!newId) return
        nextTick(() => {
            focusedBlockRefs[newId]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        })
    }
)
</script>

<template>
    <div class="preview-scroll">
        <div class="preview-container">
            <div class="preview-block">
                <div class="preview-meta">
                    <div class="control-buttons">
                        <button @click="copyTemplateContent" class="control-btn copy-btn" :class="{ copied: isCopied }">
                            [ {{ isCopied ? '✔ Скопировано' : '⮺ Копировать' }} ]
                        </button>
                        <button v-if="isEditor" @click="togglePublish" class="control-btn publish-btn">
                            [ {{ isPublic ? '🔒︎ Снять с публикации' : '🔓︎ Опубликовать' }} ]
                        </button>
                        <button v-if="isEditor" @click="deleteTemplate" class="control-btn del-btn">[ ✖ Удалить ]</button>
                    </div>
                </div>
            </div>

            <!-- динамические блоки предпросмотра -->
            <div
                v-for="block in [titleBlock, ...blocks]"
                :key="block.id"
                :ref="(el) => setFocusedBlockRef(el, block)"
                class="preview-block"
                :class="{ highlight: focusedBlockId === block.id }"
            >
                <div :class="`preview-${block.type}`">
                    <h1 v-if="block.type === 'title'">{{ block.data || DEFAULT_TITLE_CONTENT }}</h1>
                    <h2 v-if="block.type === 'subtitle'">{{ block.data || DEFAULT_SUBTITLE_CONTENT }}</h2>

                    <img
                        v-if="block.type === 'image'"
                        @error="(e) => (e.target.src = DEFAULT_IMAGE_CONTENT)"
                        :src="block.data || DEFAULT_IMAGE_CONTENT"
                    />

                    <template v-if="block.type === 'text'">
                        <div v-for="textBlock in parseTextBlocks(block.data || DEFAULT_TEXT_CONTENT)" :key="textBlock">
                            <p v-if="textBlock.type === 'p'" :class="{ 'mt-3': textBlock.gap }" v-html="textBlock.data"></p>
                            <ul v-else-if="textBlock.type === 'ul'" :class="{ 'mt-4': textBlock.gap }">
                                <li v-for="item in textBlock.data" :key="item" v-html="item"></li>
                            </ul>
                            <ol v-else-if="textBlock.type === 'ol'" :class="{ 'mt-4': textBlock.gap }">
                                <li v-for="item in textBlock.data" :key="item" v-html="item"></li>
                            </ol>
                        </div>
                    </template>

                    <CodeBlock v-if="block.type === 'code'" :block="block" />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Прокручиваемые области */
.editor-scroll {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
}
.preview-scroll {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
    padding-right: 6px;
}
.preview-container {
    max-width: 700px;
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
.preview-title h1 {
    font-size: 1.25rem;
    font-weight: 700;
}
.preview-subtitle h2 {
    font-size: 1.1rem;
    font-weight: 600;
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
    font-size: 0.7rem;
    color: #94a3b8;
    margin-top: 8px;
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

.preview-meta {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    font-size: 0.7rem;
    color: #94a3b8;
    margin-top: 8px;
    cursor: default;
}
.control-buttons {
    display: flex;
    gap: 0.25rem;
    margin-left: auto;
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
.mt-3 {
    margin-top: 0.75rem;
}
.mt-4 {
    margin-top: 1rem;
}
</style>
