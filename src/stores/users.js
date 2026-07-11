import { ref } from 'vue'
import { defineStore } from 'pinia'
import { apiGetUser, apiGetUsers, apiUpdatePassword } from '@/api/users'

export const useUsersStore = defineStore('users', () => {
    const users = ref([])

    const isUpdatingPassword = ref(false)

    const getUser = async (userId) => {
        return await apiGetUser(userId)
    }

    const getUsers = async (pagination = {}) => {
        const response = await apiGetUsers(pagination)
        users.value = response.data
    }

    const updatePassword = async ({ oldPassword, newPassword }) => {
        try {
            isUpdatingPassword.value = true
            await apiUpdatePassword({ oldPassword, newPassword })
        } finally {
            isUpdatingPassword.value = false
        }
    }

    const updateUserInList = (updatedUser) => {
        const index = users.value.findIndex((user) => user.id === updatedUser.id)

        if (index !== -1) {
            users.value[index] = updatedUser
        }
    }

    const removeUserFromList = (userId) => {
        const index = users.value.findIndex((user) => user.id === userId)

        if (index !== -1) {
            users.value.splice(index, 1)
        }
    }

    return { users, getUser, getUsers, updatePassword, updateUserInList, removeUserFromList, isUpdatingPassword }
})
