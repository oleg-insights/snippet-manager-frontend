<script setup>
import { computed, ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUsersStore } from '@/stores/users'
import { DEFAULT_AVATAR } from '@/constants'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

const toast = useToast()
const router = useRouter()

const authStore = useAuthStore()
const usersStore = useUsersStore()

const loadImageAvailable = false

const defaultFields = {
    avatar: DEFAULT_AVATAR || null
}

const userData = ref({
    name: '',
    email: '',
    avatar: ''
})

const password = ref({
    old: '',
    new: '',
    confirm: ''
})

const getDefaultUserData = () => ({
    name: authStore.user?.name || '',
    email: authStore.user?.email || '',
    avatar: authStore.user?.avatar || ''
})

const updateUserData = async () => {
    const changedFields = {}
    const allowedFields = ['name', 'email', 'avatar']

    for (const key in userData.value) {
        if (!allowedFields.includes(key)) continue
        if (userData.value[key] === defaultFields[key]) continue
        if (userData.value[key] !== authStore.user[key]) {
            changedFields[key] = userData.value[key]
        }
    }

    if (Object.keys(changedFields).length === 0) {
        toast.success('Данные обновлены')
        return
    }

    try {
        await authStore.updateMe(changedFields)
        userData.value = getDefaultUserData()
        toast.success('Данные обновлены')
    } catch (err) {
        console.error(err.message)
    }
}

const updatePassword = async () => {
    if (password.value.new !== password.value.confirm) {
        toast.error('Пароли не совпадают')
    }

    try {
        await usersStore.updatePassword({ oldPassword: password.value.old, newPassword: password.value.new })

        password.value = { old: '', new: '', confirm: '' }

        authStore.user = null
        authStore.accessToken = null

        toast.success('Пароль обновлен')

        router.push('/')
    } catch (err) {
        console.error(err.message)
    }
}

onMounted(() => {
    userData.value = getDefaultUserData()
})

const formattedDate = computed(() => {
    return new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(new Date(authStore.user.createdAt))
})
</script>

<template>
    <div v-if="authStore.user" class="columns">
        <!-- ЛЕВАЯ ПАНЕЛЬ: Редактирование профиля -->
        <div class="profile-editor">
            <div class="section-title">⚙️ НАСТРОЙКИ ПРОФИЛЯ</div>
            <div class="editor-scroll">
                <!-- Блок изменения основных данных -->
                <div class="form-section">
                    <h3>Основная информация</h3>
                    <div class="form-group">
                        <label>Никнейм</label>
                        <input type="text" v-model="userData.name" placeholder="Ваш никнейм" />
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="text" v-model="userData.email" placeholder="example@domain.com" />
                    </div>
                    <div class="form-group">
                        <label>Аватар</label>
                        <div class="avatar-upload">
                            <img
                                class="avatar-preview-small"
                                :src="userData.avatar || defaultFields.avatar"
                                @error="(e) => (e.target.src = defaultFields.avatar)"
                                alt="avatar"
                            />
                            <label v-if="loadImageAvailable" class="file-input-label">
                                Выбрать файл
                                <input type="file" accept="image/jpeg,image/png,image/gif" />
                            </label>
                            <button v-if="userData.avatar" @click="userData.avatar = null" class="btn-remove-avatar">✕ Удалить</button>
                            <span v-else class="avatar-url-label">укажите URL</span>
                        </div>
                        <input type="text" placeholder="https://example.com/avatar.jpg" v-model="userData.avatar" />
                    </div>
                    <button @click="updateUserData" class="btn-primary">💾 Сохранить изменения</button>
                </div>

                <!-- Блок смены пароля -->
                <div class="form-section">
                    <h3>Безопасность</h3>
                    <div class="form-group">
                        <label>Текущий пароль</label>
                        <input type="password" class="old-password-field" placeholder="••••••••" v-model="password.old" />
                    </div>
                    <div class="form-group">
                        <label>Новый пароль</label>
                        <input type="password" class="new-password-field" placeholder="••••••••" v-model="password.new" />
                    </div>
                    <div class="form-group">
                        <label>Подтверждение пароля</label>
                        <input type="password" class="confirm-password-field" placeholder="••••••••" v-model="password.confirm" />
                    </div>
                    <button @click="updatePassword" class="btn-secondary">
                        {{ usersStore.isUpdatingPassword ? 'Сохранение...' : '🔒 Сменить пароль' }}
                    </button>
                    <div class="message"></div>
                </div>
            </div>
        </div>

        <!-- ПРАВАЯ ПАНЕЛЬ: Карточка пользователя -->
        <div class="profile-preview">
            <div class="section-title">👤 ПРОФИЛЬ</div>
            <div class="preview-scroll">
                <div class="user-card">
                    <img
                        class="user-avatar-large"
                        :src="userData.avatar || defaultFields.avatar"
                        @error="(e) => (e.target.src = defaultFields.avatar)"
                        alt="Аватар"
                    />
                    <div class="user-nickname">{{ authStore.user.name }}</div>
                    <div class="user-email">{{ authStore.user.email }}</div>
                    <div class="user-role">{{ authStore.user.role }}</div>
                    <div class="user-meta">📅 Регистрация: {{ formattedDate }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Две колонки */
h3 {
    font-weight: 700;
    font-size: 0.9rem;
    margin-bottom: 12px;
}

.columns {
    display: flex;
    gap: 24px;
    flex: 1;
    min-height: 0;
}

/* Левая панель — редактирование профиля */
.profile-editor {
    flex: 1.2;
    background: #f8fafc;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    padding: 20px;
    gap: 24px;
    min-height: 0;
}
.avatar-url-label {
    font-size: 0.7rem;
    color: #5b6e8c;
}

/* Правая панель — карточка пользователя */
.profile-preview {
    flex: 1.5;
    background: white;
    border-radius: 20px;
    border: 1px solid #eef2ff;
    display: flex;
    flex-direction: column;
    padding: 20px;
    gap: 16px;
    min-height: 0;
}

.section-title {
    font-size: 0.75rem;
    text-transform: uppercase;
    font-weight: 600;
    color: #5b6e8c;
    letter-spacing: 0.5px;
    flex-shrink: 0;
}

/* Прокручиваемые области */
.editor-scroll {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding-right: 4px;
}
.preview-scroll {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
}

/* Формы */
.form-section {
    background: white;
    border-radius: 16px;
    padding: 16px;
    border: 1px solid #e2e8f0;
}
.form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 16px;
}
.form-group label {
    font-size: 0.8rem;
    font-weight: 600;
    color: #1e293b;
}
.form-group input {
    padding: 10px 12px;
    border: 1px solid #cfdfed;
    border-radius: 14px;
    font-family: inherit;
    font-size: 0.9rem;
    transition: 0.1s;
}
.form-group input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}
.avatar-upload {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
}
.btn-remove-avatar {
    cursor: pointer;
}
.avatar-preview-small {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
    background: #e2e8f0;
}
.file-input-label {
    background: #e2e8f0;
    padding: 6px 12px;
    border-radius: 2rem;
    font-size: 0.8rem;
    cursor: pointer;
}
.file-input-label:hover {
    background: #cbd5e1;
}
input[type='file'] {
    display: none;
}
.btn-primary {
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 2rem;
    margin-top: 8px;
    padding: 10px 20px;
    font-weight: 600;
    cursor: pointer;
    width: 100%;
    transition: 0.1s;
}
.btn-primary:hover {
    background: #2563eb;
}
.btn-secondary {
    background: #e2e8f0;
    color: #1e293b;
    border: none;
    border-radius: 2rem;
    padding: 10px 20px;
    font-weight: 600;
    cursor: pointer;
    width: 100%;
}
.btn-secondary:hover {
    background: #cbd5e1;
}
.divider {
    height: 1px;
    background: #e2e8f0;
    margin: 8px 0;
}

/* Карточка пользователя (правая панель) */
.user-card {
    background: #ffffff;
    border-radius: 20px;
    padding: 20px;
    text-align: center;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
    border: 1px solid #eef2ff;
    align-items: center;
    display: flex;
    flex-direction: column;
}
.user-avatar-large {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    margin-bottom: 16px;
    border: 3px solid #e2e8f0;
    display: block;
}
.user-nickname {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 8px;
}
.user-email {
    color: #5b6e8c;
    margin-bottom: 8px;
}
.user-role {
    border: 1px solid #5b6e8c;
    border-radius: 16px;
    padding: 0.25rem 0.75rem;
}
.user-meta {
    font-size: 0.7rem;
    color: #94a3b8;
    margin-top: 12px;
}

/* Сообщения */
.message {
    font-size: 0.75rem;
    margin-top: 6px;
}
.error {
    color: #dc2626;
}
.success {
    color: #10b981;
}

/* Скроллбар */
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
