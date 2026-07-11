import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { apiRegister, apiLogin, apiLogout } from '@/api/auth'
import { apiUpdateMe } from '@/api/users'
import { apiGetMe } from '@/api/users'

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null)
    const accessToken = ref(localStorage.getItem('accessToken') || null)
    const initialized = ref(false)
    const error = ref(null)
    const isAuthenticated = computed(() => !!accessToken.value && !!user.value)

    const isRegistering = ref(false)
    const isLoggingIn = ref(false)
    const isLoggingOut = ref(false)
    const isRestoring = ref(false)

    const restoreSession = async () => {
        if (initialized.value) return

        isRestoring.value = true

        try {
            const data = await apiGetMe()
            user.value = data
        } catch (err) {
            accessToken.value = null
            user.value = null
        } finally {
            isRestoring.value = false
            initialized.value = true
        }
    }

    const register = async (name, email, password) => {
        try {
            isRegistering.value = true
            await apiRegister(name, email, password)
        } finally {
            isRegistering.value = false
        }
    }

    const login = async (email, password) => {
        try {
            isLoggingIn.value = true
            const data = await apiLogin(email, password)

            user.value = data.user
            accessToken.value = data.accessToken
        } finally {
            isLoggingIn.value = false
        }
    }

    const logout = async () => {
        if (!accessToken.value) {
            user.value = null
            initialized.value = true
            return
        }

        try {
            isLoggingOut.value = true
            await apiLogout()

            user.value = null
            accessToken.value = null
        } finally {
            initialized.value = true
            isLoggingOut.value = false
        }
    }

    const setAccessToken = (token) => {
        accessToken.value = token
    }

    const updateMe = async (fields) => {
        user.value = await apiUpdateMe(fields)
    }

    return {
        user,
        accessToken,
        initialized,
        isAuthenticated,
        error,
        register,
        login,
        logout,
        restoreSession,
        setAccessToken,
        updateMe,
        isRegistering,
        isLoggingIn,
        isLoggingOut,
        isRestoring
    }
})
