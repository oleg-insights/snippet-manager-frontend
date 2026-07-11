<script setup>
import { BLOCK_TYPES } from '@/constants/block-types'

defineProps({
    block: Object,
    index: Number
})

const emit = defineEmits(['toggle-picker', 'add-block'])

const togglePicker = (block) => {
    emit('toggle-picker', block)
}

const addBlock = (type, index) => {
    emit('add-block', type, index)
}
</script>

<template>
    <!-- Кнопка добавления блока -->
    <div class="picker-wrapper">
        <div class="divider-add" :class="{ active: block.showPicker }">
            <span class="divider-line"></span>
            <button class="btn-add-block" @click="togglePicker(block)">
                <span class="cross-line horisontal"></span>
                <span class="cross-line vertical"></span>
            </button>
        </div>

        <!-- Контейнер с типами -->
        <div class="picker-container" :class="{ active: block.showPicker }">
            <div class="picker-grid">
                <div v-for="type in ['subtitle', 'text', 'image', 'code']" :key="type" class="picker-item" @click="addBlock(type, index)">
                    <span class="icon">{{ BLOCK_TYPES[type]?.icon || BLOCK_TYPES['default']?.icon }}</span>
                    {{ BLOCK_TYPES[type]?.label || BLOCK_TYPES['default']?.label }}
                </div>
            </div>
            <div class="picker-actions">
                <button class="cancel-btn" @click="block.showPicker = false">✕ Отмена</button>
            </div>
        </div>
    </div>
</template>

<style scope>
/* Кнопка добавления блока */
.divider-add {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 30px;
    position: relative;
    border-radius: 6px;
    transition: 0.15s;
}
.divider-add .divider-line {
    position: absolute;
    top: 50%;
    left: 20%;
    right: 20%;
    height: 2px;
    background: transparent;
    transition: 0.15s;
}
.divider-add .btn-add-block {
    background: white;
    border: 1px solid transparent;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    font-size: 1.1rem;
    color: #5b6e8c;
    cursor: pointer;
    opacity: 0;
    transform: scale(0.8);
    transition: 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}
.divider-add .cross-line {
    position: absolute;
    background: #3b82f6;
    width: 30%;
    height: 2px;
}
.divider-add .cross-line.vertical {
    transform: rotate(90deg);
}
.divider-add:hover .btn-add-block,
.divider-add.active .btn-add-block {
    opacity: 1;
    transform: scale(1);
    border-color: #3b82f6;
    background: #f8fafc;
}
.divider-add:hover .divider-line,
.divider-add.active .divider-line {
    background: #3b82f6;
    height: 2px;
}
.divider-add .btn-add-block:hover,
.divider-add.active .btn-add-block {
    background: #3b82f6;
}
.divider-add .btn-add-block:hover .cross-line,
.divider-add.active .cross-line {
    background: #f8fafc;
}

/* Выбор типа */
/* блок выбора типа */
.picker-wrapper {
    margin-top: 2px;
}
.picker-container {
    display: none;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    margin: 2px 10%;
    background: white;
    border-radius: 16px;
    padding: 16px;
    border: 1px solid #3b82f6;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}
.picker-container.active {
    display: flex;
}
.picker-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
    width: 100%;
}
.picker-item {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 12px 8px;
    text-align: center;
    cursor: pointer;
    transition: 0.1s;
    font-size: 0.8rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
}
.picker-item:hover {
    border-color: #3b82f6;
    background: #eef2ff;
}
.picker-item .icon {
    font-size: 1.4rem;
}
.picker-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    width: 100%;
    margin-top: 4px;
}
.picker-actions button {
    background: transparent;
    border: none;
    font-size: 0.75rem;
    color: #5b6e8c;
    cursor: pointer;
    padding: 4px 12px;
    border-radius: 1rem;
    transition: 0.1s;
}
.picker-actions button:hover {
    background: #f1f5f9;
}
.picker-actions .cancel-btn {
    color: #94a3b8;
}
</style>
