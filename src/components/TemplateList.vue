<script setup>
import { useTemplatesStore } from '@/stores/templates'
import { useAuthStore } from '@/stores/auth'

const templatesStore = useTemplatesStore()
const authStore = useAuthStore()
</script>

<template>
    <div class="templates-panel">
        <div v-if="templatesStore.templates.length" class="templates-scroll">
            <div class="template-list">
                <router-link v-for="tpl in templatesStore.templates" :key="tpl.id" :to="`/template/${tpl.id}`" class="template-item">
                    <div>{{ tpl.title }}</div>
                    <div class="template-meta">
                        <span v-if="tpl.isPublic" class="template-meta-publish template-meta-item">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        </span>
                        <span v-else class="template-meta-unpublish template-meta-item">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                                <line x1="2" y1="2" x2="22" y2="22" />
                            </svg>
                        </span>

                        <span class="template-meta-author template-meta-item">👤 {{ tpl.author.name }}</span>
                    </div>
                </router-link>
            </div>
        </div>
        <div v-else class="no-content">
            Доступных шаблонов пока нет.
            <span v-if="!authStore.user">Войдите, чтобы создать шаблон</span>
            <span v-else>
                <router-link to="/create" class="no-content-link">Создать</router-link>
                шаблон
            </span>
        </div>
    </div>
</template>

<style scoped>
/* Правая колонка — шаблоны */
.templates-panel {
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

/* Скролл для шаблонов */
.templates-scroll {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
    padding-right: 4px;
}
.template-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.template-item {
    background: #fefefe;
    border-left: 4px solid #3b82f6;
    padding: 10px 12px;
    border-radius: 10px;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: default;
    color: #0f172a;
    cursor: pointer;
}
.template-item:hover {
    background: #f1f5f9;
    transform: translateX(3px);
}
.template-meta {
    font-size: 0.6rem;
    color: #94a3b8;
    margin-top: 0.2rem;
    display: flex;
    gap: 0.25rem;
}
.template-meta-item {
    display: flex;
    align-items: center;
}
.template-meta-publish {
    color: #8bc188;
}

/* Кастомный скролл */
.templates-scroll::-webkit-scrollbar {
    width: 6px;
}
.templates-scroll::-webkit-scrollbar-track {
    background: #e9eef3;
    border-radius: 8px;
}
.templates-scroll::-webkit-scrollbar-thumb {
    background: #b9c8e0;
    border-radius: 8px;
}

.no-content {
    font-size: 1.25rem;
    font-weight: 500;
    text-align: center;
    padding-top: 2rem;
}
.no-content-link {
    color: #3b82f6;
}
</style>
