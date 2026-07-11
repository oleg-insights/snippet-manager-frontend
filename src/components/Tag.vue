<script setup>
const props = defineProps({
    tag: Object,
    selected: Boolean,
    disabled: Boolean
})

const emit = defineEmits(['toggleTag'])

const handleClick = () => {
    if (props.disabled) return
    emit('toggleTag')
}
</script>

<template>
    <span @click="handleClick" class="tag" :class="{ selected, disabled }">{{ tag.name }}</span>
</template>

<style scoped>
.tag {
    padding: 6px 14px;
    border-radius: 2rem;
    font-size: 0.8rem;
    font-weight: 500;
    white-space: nowrap;
    transition: 0.1s;
    background: white;
    border: 1px solid #cfdfed;
    color: #1f3a5f;
    cursor: pointer;
}
/* Обычные кликабельные теги (3-й и 4-й) */
.tag:not(.selected):not(.disabled):hover {
    background: #eef3fc;
    border-color: #9bb6d0;
}
/* Выбранные теги (первые два) */
.tag.selected {
    background: #3b82f6;
    border-color: #3b82f6;
    color: white;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
/* Disabled теги (начиная с 5-го) */
.tag.disabled {
    opacity: 0.5;
    background: #e2e8f0;
    border-color: #cbd5e1;
    color: #64748b;
    cursor: not-allowed;
}
</style>
