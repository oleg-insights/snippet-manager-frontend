<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { socket } from '@/socket'
import { useToast } from 'vue-toastification'

const authStore = useAuthStore()
const toast = useToast()

const handlePublishSocket = (data) => {
    if (authStore.user?.id === data.authorId) return
    toast.success(`${data.title}:\n${data.text}`)
}

onMounted(() => {
    socket.on('receive_publish', handlePublishSocket)
})
</script>

<template>
    <div v-if="!authStore.initialized">Загрузка...</div>
    <router-view v-else />
</template>
