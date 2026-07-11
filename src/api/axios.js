import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'

const getErrorMessage = (error) => {
    const data = error.response?.data

    if (typeof data === 'string') return data

    if (data && typeof data === 'object') {
        if (data.message) {
            return Array.isArray(data.message) ? data.message.map((msg) => `${msg}`).join('\n\n') : data.message
        }
        if (data.errors) {
            return Array.isArray(data.errors) ? data.errors.map((msg) => `${msg}`).join('\n\n') : data.errors
        }
        if (data.error) {
            if (typeof data.error === 'string') return data.error
            if (data.error.message) return data.error.message
            return JSON.stringify(data.error)
        }
        return error.message || 'Ошибка запроса к API'
    }
}

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: { 'Content-Type': 'application/json' },
    paramsSerializer: (params) => {
        return Object.entries(params)
            .map(([key, value]) => {
                if (Array.isArray(value)) {
                    return value.map((v) => `${key}=${encodeURIComponent(v)}`).join('&')
                }
                return `${key}=${encodeURIComponent(value)}`
            })
            .join('&')
    },
    withCredentials: true
})

instance.interceptors.request.use((config) => {
    const authStore = useAuthStore()
    const token = authStore.accessToken
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token) => {
    failedQueue.forEach((promise) => {
        if (error) promise.reject(error)
        else promise.resolve(token)
    })
    failedQueue = []
}

instance.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config

        if (originalRequest.url.includes('/auth/')) {
            return Promise.reject(error)
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`
                        return instance(originalRequest)
                    })
                    .catch((err) => Promise.reject(err))
            }

            originalRequest._retry = true
            isRefreshing = true

            const authStore = useAuthStore()

            try {
                const response = await instance.post('/auth/refresh')
                const newAccessToken = response.data.accessToken

                authStore.setAccessToken(newAccessToken)

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

                processQueue(null, newAccessToken)

                return instance(originalRequest)
            } catch (refreshError) {
                authStore.logout()

                processQueue(refreshError, null)

                return Promise.reject(refreshError)
            } finally {
                isRefreshing = false
            }
        }

        if (error.response?.status && error.response.status !== 401) {
            const message = getErrorMessage(error)
            const toast = useToast()
            toast.error(message)
        }

        return Promise.reject(error)
    }
)

export default instance
