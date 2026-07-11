import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useUsersStore } from '@/stores/users'
import { apiGetUsers, apiChangeRole, apiSoftDelete } from '@/api/admin'

export const useAdminStore = defineStore('admin', () => {
    const usersStore = useUsersStore()

    const isLoadingUsers = ref(false)
    const isChangingRole = ref(false)
    const isDeleting = ref(false)

    const getUsers = async (pagination = {}) => {
        try {
            isLoadingUsers.value = true
            const response = await apiGetUsers(pagination)
            const users = response.data
            return users
        } finally {
            isLoadingUsers.value = false
        }
    }

    const changeRole = async (userId, role) => {
        try {
            isChangingRole.value = true
            const updatedUser = await apiChangeRole(userId, role)
            usersStore.updateUserInList(updatedUser)
        } finally {
            isChangingRole.value = false
        }
    }

    const softDelete = async (userId) => {
        try {
            isDeleting.value = true
            await apiSoftDelete(userId)
            usersStore.removeUserFromList(userId)
        } finally {
            isDeleting.value = false
        }
    }

    return { getUsers, changeRole, softDelete, isLoadingUsers, isChangingRole, isDeleting }
})
