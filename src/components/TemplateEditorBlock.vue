<script setup>
import { ref } from 'vue'
import { BLOCK_TYPES } from '@/constants/block-types'

import BlockPicker from './BlockPicker.vue'

const props = defineProps({
    block: Object,
    index: Number,
    canMoveUp: Boolean,
    canMoveDown: Boolean,
    setRef: Function,
    synced: Boolean
})
const emit = defineEmits(['add-block', 'move-block', 'del-block', 'toggle-picker', 'toggle-focus-id', 'focus-out'])

const isTextarea = props.block.type === 'text' || props.block.type === 'code'
const minRows = 1
const maxRows = 20
const textareaRows = ref(2)

const togglePicker = (block) => {
    emit('toggle-picker', block)
}

const addBlock = (type, index) => {
    emit('add-block', type, index)
}

const delBlock = (index) => {
    emit('del-block', index)
}

const toggleFocusId = (id) => {
    emit('toggle-focus-id', id)
}
</script>

<template>
    <div class="block-wrapper" :ref="setRef">
        <div class="editor-block" :class="{ highlight: synced }">
            <!-- Блок -->
            <div class="editor-block-header" :class="{ 'multi-string': isTextarea }">
                <span class="block-label">{{ (BLOCK_TYPES[block.type].label || block.type).toUpperCase() }}</span>
                <div v-if="isTextarea" class="header-slider">
                    <span class="min">1</span>
                    <input type="range" min="1" max="20" v-model="textareaRows" step="1" />
                    <span class="max">20</span>
                </div>
                <div v-if="block.type !== 'title'" class="editor-buttons">
                    <button v-if="canMoveUp" class="editor-btn move-btn move-up-btn" @click="$emit('move-block', index, -1)">▲</button>
                    <button v-if="canMoveDown" class="editor-btn move-btn move-down-btn" @click="$emit('move-block', index, 1)">▼</button>
                    <button class="editor-btn del-btn" @click="delBlock(index)">✕</button>
                </div>
            </div>
            <div class="form-group">
                <input
                    v-if="block.type === 'title' || block.type === 'subtitle'"
                    @focus="toggleFocusId(block.id)"
                    @blur="emit('focus-out')"
                    type="text"
                    v-model="block.data"
                    placeholder="Текст"
                />
                <input
                    v-else-if="block.type === 'image'"
                    @focus="toggleFocusId(block.id)"
                    @blur="emit('focus-out')"
                    type="text"
                    v-model="block.data"
                    placeholder="https://image.jpg"
                />
                <textarea
                    v-else-if="block.type === 'text' || block.type === 'code'"
                    @focus="toggleFocusId(block.id)"
                    @blur="emit('focus-out')"
                    :rows="textareaRows"
                    v-model="block.data"
                    placeholder="Текст"
                ></textarea>
            </div>
        </div>

        <BlockPicker :block="block" :index="index" @toggle-picker="togglePicker" @add-block="addBlock" />
    </div>
</template>

<style scoped>
/* Блоки редактора (поля) */
textarea {
    resize: none;
}

.editor-block {
    background: white;
    border-radius: 16px;
    padding: 12px;
    border: 1px solid #e2e8f0;
    transition: all 0.1s;
}
.editor-block-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}
.block-label {
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    color: #5b6e8c;
}
.editor-buttons {
    display: flex;
    gap: 4px;
    width: 8rem;
    justify-content: flex-end;
}
.editor-btn {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.7rem;
    transition: 0.1s;
    width: 2rem;
    height: 1.4rem;
}
.move-btn {
    background: #f1f5f9;
}
.move-btn:hover {
    background: #e2e8f0;
}
.move-up-btn {
    margin-left: 1rem;
}
.del-btn {
    background: #ff9aad;
    border-color: #ff9aad;
    color: white;
    margin-left: 1rem;
    width: 1.4rem;
}
.del-btn:hover {
    background: #ff6c88;
}
.form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
}
.form-group input,
.form-group textarea {
    padding: 8px 12px;
    border: 1px solid #cfdfed;
    border-radius: 12px;
    font-family: inherit;
    font-size: 0.85rem;
}
.form-group input:focus,
.form-group textarea:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.highlight input,
.highlight textarea {
    box-shadow: 0 0 0 3px #3b82f633;
}

/* Ползунок высоты */

.multi-string.editor-block-header {
    flex-wrap: wrap;
    gap: 1rem;
}

.header-slider {
    flex: 1;
    display: flex;
    align-items: center;
}

.header-slider span {
    color: #475569;
    min-width: 1.2rem;
    line-height: 1;
    font-size: 0.75rem;
}

.header-slider span.min {
    text-align: right;
}

input[type='range'] {
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
    height: 3px;
    outline: none;
    border: none;
    box-shadow: none;
}

input[type='range']::-webkit-slider-runnable-track {
    height: 3px;
    background: #cfdfed;
    border-radius: 4px;
}
input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    margin-top: -5.5px;
}
input[type='range']::-moz-range-track {
    height: 3px;
    background: #cfdfed;
    border-radius: 4px;
}
input[type='range']::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: none;
}
input[type='range']:focus {
    outline: none;
}
input[type='range']:focus::-webkit-slider-runnable-track {
    background: #cfdfed;
}
input[type='range']:focus::-moz-range-track {
    background: #cfdfed;
}
</style>
