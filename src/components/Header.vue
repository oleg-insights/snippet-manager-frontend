<script setup>
import { ref, computed } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { useAuthStore } from '@/stores/auth'
import { DEFAULT_AVATAR } from '@/constants'
import { useRouter } from 'vue-router'

const router = useRouter()

const authStore = useAuthStore()

const dropdownMenuOpen = ref(false)
const dropdownMenuRef = ref(null)

onClickOutside(dropdownMenuRef, () => {
    dropdownMenuOpen.value = false
})

const toggleDropdownMenu = () => {
    dropdownMenuOpen.value = !dropdownMenuOpen.value
}

const logout = async () => {
    if (authStore.isLoggingOut) return

    try {
        await authStore.logout()
        router.push('/')
    } catch (err) {
        console.error(err.message)
    }
}

const avatar = computed(() => {
    return authStore.user?.avatar || DEFAULT_AVATAR
})

const emit = defineEmits(['open-login'])
</script>

<template>
    <div class="header">
        <div class="logo">🧩 Snippet Manager</div>
        <div class="nav-links">
            <router-link to="/" class="nav-link">Главная</router-link>
            <router-link v-if="authStore.user?.role === 'ADMIN'" to="/admin" class="nav-link">Админка</router-link>
            <router-link v-if="authStore.isAuthenticated" to="/create" class="nav-link">Добавить шаблон</router-link>
            <span v-if="!authStore.isAuthenticated" @click="$emit('open-login')" class="nav-link login-link">Вход</span>
            <div v-else ref="dropdownMenuRef" @click="toggleDropdownMenu" class="avatar-dropdown">
                <img v-if="avatar" class="avatar user-avatar" :src="avatar" alt="avatar" />
                <div v-else class="avatar default-avatar">👤</div>

                <div class="dropdown-menu" :class="{ show: dropdownMenuOpen }">
                    <div class="dropdown-item">
                        <router-link to="/profile" class="profile-link">👤 Мой профиль</router-link>
                    </div>
                    <div class="dropdown-divider"></div>
                    <div @click="logout" class="dropdown-item" :class="{ 'opacity-50': authStore.isLoggingOut }">🚪 Выйти</div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Хедер */
.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #e9edf2;
    padding-bottom: 12px;
    flex-shrink: 0;
    flex-wrap: wrap;
    gap: 12px;
}
.logo {
    font-weight: 700;
    font-size: 1.3rem;
    color: #1e293b;
}
.nav-links {
    display: flex;
    gap: 2rem;
    align-items: center;
}
.nav-link {
    font-size: 0.95rem;
    font-weight: 500;
    color: #4b5563;
    text-decoration: none;
    cursor: pointer;
}
.router-link-exact-active.nav-link {
    color: #3b82f6;
    border-bottom: 2px solid #3b82f6;
    padding-bottom: 4px;
}
.login-link {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 6px 14px;
    border-radius: 2rem;
    font-size: 1rem;
    border: 2px solid #cfdfed;
    color: #1f3a5f;
}
.login-link:hover {
    background: #d4e8ff;
}
/* Аватарка с дропдауном */
.avatar-dropdown {
    position: relative;
    cursor: pointer;
}
.avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    background: #e2e8f0;
    border: 2px solid white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
.default-avatar {
    background: #3b82f6;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    color: white;
    font-size: 1rem;
}
.dropdown-menu {
    position: absolute;
    top: 48px;
    right: 0;
    background: white;
    border-radius: 16px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
    min-width: 160px;
    overflow: hidden;
    z-index: 10;
    border: 1px solid #e2e8f0;
    display: none;
}
.dropdown-menu.show {
    display: block;
}
.dropdown-item {
    padding: 10px 16px;
    font-size: 0.85rem;
    color: #1e293b;
    transition: 0.1s;
    cursor: pointer;
}
.dropdown-item a {
    color: #1e293b;
    text-decoration: none;
}
.dropdown-item:hover {
    background: #f1f5f9;
}
.dropdown-divider {
    height: 1px;
    background: #e2e8f0;
    margin: 4px 0;
}
</style>
