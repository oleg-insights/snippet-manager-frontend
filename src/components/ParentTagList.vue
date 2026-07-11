<script setup>
import { computed } from 'vue'
import { useTemplatesStore } from '@/stores/templates'

const templatesStore = useTemplatesStore()

const parents = computed(() => templatesStore.suggestedParents)

const emit = defineEmits(['selectParentTag'])
</script>

<template>
    <div v-if="parents.length" class="parent-tag-wrapper">
        <div class="parent-tag-list">
            <span @click="emit('selectParentTag', parent)" v-for="parent in parents" :key="parent.id" class="parent-tag">{{ parent.name }}</span>
        </div>
    </div>
</template>

<style scoped>
.parent-tag-wrapper {
    flex-shrink: 0;
}
.parent-tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    animation: slideDown 0.2s;
}
.parent-tag {
    background: #eef2ff;
    border-radius: 2rem;
    padding: 6px 16px;
    font-weight: 600;
    font-size: 0.8rem;
    color: #1e40af;
    cursor: pointer;
    border: 1px solid #cbdff2;
}
@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-8px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
