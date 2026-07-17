<script setup>
import { watch, nextTick } from 'vue'

import TemplateEditorBlock from './TemplateEditorBlock.vue'

const props = defineProps({
    titleBlock: Object,
    blocks: Array,
    syncedBlockId: Number
})

const emit = defineEmits(['add-block', 'move-block', 'del-block', 'toggle-focus-id', 'focus-out', 'save-template'])

const addBlock = (type, index) => {
    emit('add-block', type, index)
}

const moveBlock = (index, direction) => {
    emit('move-block', index, direction)
}

const delBlock = (index) => {
    emit('del-block', index)
}

const toggleBlockPicker = (block) => {
    block.showPicker = !block.showPicker
    props.blocks.forEach((b) => {
        if (b.id !== block.id) {
            b.showPicker = false
        }
    })
}

const toggleFocusId = (id) => {
    emit('toggle-focus-id', id)
}

const syncedBlockRefs = {}
const setSyncedBlockRef = (el, block) => {
    if (el) syncedBlockRefs[block.id] = el
}

watch(
    () => props.syncedBlockId,
    (newId) => {
        if (!newId) return
        nextTick(() => {
            syncedBlockRefs[newId]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        })
    }
)
</script>

<template>
    <div class="template-editor-block-list-wrapper">
        <!-- Прокручиваемая область с блоками (заголовок, текст, изображение) -->
        <div class="editor-scroll">
            <TemplateEditorBlock
                :block="titleBlock"
                :index="0"
                :synced="syncedBlockId === titleBlock.id"
                :setRef="(el) => setSyncedBlockRef(el, titleBlock)"
                @add-block="addBlock"
                @toggle-picker="toggleBlockPicker"
                @toggle-focus-id="toggleFocusId"
                @focus-out="emit('focus-out')"
            />

            <TemplateEditorBlock
                v-for="(block, index) in blocks"
                :key="block.id"
                :block="block"
                :index="index + 1"
                :can-move-up="index > 0"
                :can-move-down="index < blocks.length - 1"
                :synced="syncedBlockId === block.id"
                :setRef="(el) => setSyncedBlockRef(el, block)"
                @add-block="addBlock"
                @move-block="moveBlock"
                @del-block="delBlock"
                @toggle-picker="toggleBlockPicker"
                @toggle-focus-id="toggleFocusId"
                @focus-out="emit('focus-out')"
            />
        </div>

        <div class="action-button">
            <button class="btn-primary" @click="emit('save-template')">💾 Сохранить</button>
        </div>
    </div>
</template>

<style scoped>
.template-editor-block-list-wrapper {
    display: flex;
    flex-direction: column;
    min-height: 0;
    flex: 1;
}

/* Прокручиваемые области */
.editor-scroll {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
}
.preview-scroll {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
    padding-right: 6px;
}

/* Кнопка сохранения */
.action-button {
    margin-top: 8px;
    flex-shrink: 0;
    display: flex;
    justify-content: flex-end;
}
.btn-primary {
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 2rem;
    padding: 8px 24px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
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
</style>
