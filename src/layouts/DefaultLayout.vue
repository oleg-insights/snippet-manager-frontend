<script setup>
import { ref } from 'vue'

import Header from '@/components/Header.vue'
import LoginModal from '@/components/LoginModal.vue'

const isLoginOpen = ref(false)

const openLogin = () => {
    isLoginOpen.value = true
}
const closeLogin = () => {
    isLoginOpen.value = false
}
</script>

<template>
    <div class="layout-wrapper">
        <div class="app">
            <div class="content">
                <Header @open-login="openLogin" />

                <router-view />
            </div>
        </div>

        <LoginModal :isOpen="isLoginOpen" @close="closeLogin" />
    </div>
</template>

<style scoped>
.layout-wrapper {
    height: 100%;
    display: flex;
}

/* Главный контейнер */
.app {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: white;
    border-radius: 24px;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    min-height: 0;
}

.content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 20px;
    gap: 20px;
    min-height: 0;
}
</style>
