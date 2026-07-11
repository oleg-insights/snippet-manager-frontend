<script setup>
import { ref, computed } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { useToast } from 'vue-toastification'

const toast = useToast()

const props = defineProps({
    visibleTags: Array,
    templateTags: Array
})

const emit = defineEmits(['add-tag', 'del-tag'])

const showTagPicker = ref(false)
const addSelfTagMode = ref(false)
const selfTag = ref({ name: '' })

const tagPickerRef = ref(null)
onClickOutside(tagPickerRef, () => {
    showTagPicker.value = false
})

const addTag = (tag) => {
    showTagPicker.value = false
    emit('add-tag', tag)
}

const addSelfTag = () => {
    const selfTagName = selfTag.value.name
    const selectedTags = props.templateTags
    const isEmpty = !selfTagName
    const alreadySelected = selectedTags.some((tag) => tag.name === selfTagName)

    if (isEmpty) {
        toast.error('Нельзя добавить пустой тег')
        return
    }

    if (alreadySelected) {
        toast.error(`Тег "${selfTagName}" уже был добавлен`)
    } else {
        emit('add-tag', { name: selfTagName })
    }
    showTagPicker.value = false
    selfTag.value.name = ''
}

const delTag = (tag) => {
    emit('del-tag', tag)
}

const visibleTagsWithoutSelected = computed(() => {
    const selectedTemplateTagNames = new Set(props.templateTags.map((tag) => tag.name))
    return props.visibleTags.filter((tag) => !selectedTemplateTagNames.has(tag.name))
})
</script>

<template>
    <!-- Блок тегов (кнопки + плюс) -->
    <div class="tags-editor">
        <div class="tags-label">ТЕГИ ШАБЛОНА</div>
        <div class="tags-container">
            <!-- динамические теги -->
            <span v-for="tag in templateTags" :key="tag.id" class="tag-chip">
                {{ tag.name }}
                <button class="remove-tag" @click="delTag(tag)">✕</button>
            </span>
            <div class="tag-picker-wrapper" ref="tagPickerRef">
                <button @click="showTagPicker = !showTagPicker" class="add-tag-btn">+ Добавить тег</button>
                <div v-if="showTagPicker" class="tag-picker-container">
                    <span @click="addSelfTagMode = !addSelfTagMode" class="tag-picker-mode-toggle">
                        {{ addSelfTagMode ? 'К списку тегов' : 'Добавить свой тег' }}
                    </span>
                    <div v-if="!addSelfTagMode && visibleTagsWithoutSelected.length" class="tag-picker-scroll">
                        <div v-for="tag in visibleTagsWithoutSelected" :key="tag.id" class="tag-picker-item" @click="addTag(tag)">
                            {{ tag.name }}
                        </div>
                    </div>
                    <div v-else-if="!addSelfTagMode && !visibleTagsWithoutSelected.length" class="no-tags">
                        Доступных тегов пока нет. Добавьте свой
                    </div>
                    <div v-else class="tag-picker-form">
                        <div class="form-group">
                            <span class="label">Имя тега</span>
                            <input type="text" class="tag-picker-name" v-model="selfTag.name" @keyup.enter="addSelfTag" />
                        </div>
                        <button type="submit" class="btn-primary" @click="addSelfTag">Добавить</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Блок тегов (левая панель) */
.tags-editor {
    background: white;
    border-radius: 16px;
    padding: 12px;
    border: 1px solid #e2e8f0;
    flex-shrink: 0;
}
.tags-label {
    font-size: 0.7rem;
    font-weight: 600;
    color: #5b6e8c;
    margin-bottom: 8px;
}
.tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
}
.tag-chip {
    background: #eef2ff;
    border-radius: 1rem;
    padding: 4px 10px;
    font-size: 0.7rem;
    font-weight: 500;
    color: #1e40af;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    cursor: default;
}
.tag-chip button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.8rem;
    color: #1e40af;
    padding: 0 2px;
}
.add-tag-btn {
    background: #e2e8f0;
    border: none;
    border-radius: 1rem;
    padding: 4px 10px;
    font-size: 0.7rem;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    transition: 0.1s;
}
.add-tag-btn:hover {
    background: #cbd5e1;
}

/* tag-picker */
.tag-picker-wrapper {
    position: relative;
}
.tag-picker-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 8px;
    border-radius: 16px;
    background: white;
    position: absolute;
    width: 200px;
    max-height: 300px;
    margin-top: 4px;
    top: 100%;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
    z-index: 1;
}
.tag-picker-mode-toggle {
    color: #3b82f6;
    cursor: pointer;
    width: min-content;
    font-size: 0.8rem;
    white-space: nowrap;
    font-weight: 500;
}
.tag-picker-scroll {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding-right: 4px;
    overflow-x: hidden;
}
.tag-picker-item {
    border: 1px solid #cfdfed;
    border-radius: 2rem;
    border-color: #cfdfed;
    cursor: pointer;
    background: white;
    color: #1f3a5f;
    padding: 2px 8px;
    font-size: 0.7rem;
    font-weight: 400;
    white-space: nowrap;
    transition: 0.1s;
}
.tag-picker-item:hover {
    background: #eef3fc;
    border-color: #9bb6d0;
}
.tag-picker-form {
    background: white;
    border-radius: 16px;
    padding: 12px;
    border: 1px solid #e2e8f0;
    transition: all 0.1s;
}
.tag-picker-form .form-group {
    margin-bottom: 0.5rem;
}
.tag-picker-form .label {
    display: block;
    font-size: 0.8rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
}
.tag-picker-form input {
    width: 100%;
    padding: 0.25rem 0.75rem;
    border: 1px solid #cfdfed;
    border-radius: 12px;
    font-family: inherit;
    font-size: 0.85rem;
}
.tag-picker-form input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}
.tag-picker-form .btn-primary {
    width: 100%;
    padding: 0.25rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 2rem;
    font-weight: 600;
    cursor: pointer;
}
.no-tags {
    font-size: 0.8rem;
    font-weight: 500;
    padding: 0.5rem 1rem;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    line-height: 1.6;
}
</style>
