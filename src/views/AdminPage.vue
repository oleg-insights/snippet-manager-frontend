<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useUsersStore } from '@/stores/users'
import { ROLES } from '@/constants/roles'
import { useToast } from 'vue-toastification'
import { useAdminStore } from '@/stores/admin'

const toast = useToast()

const adminStore = useAdminStore()
const activeTab = ref('users')

const users = ref([])

const activeRolePickerId = ref(null)
const handleClickOutside = (event) => {
    if (activeRolePickerId.value === null) return

    const container = document.querySelector('.role-picker-container')

    if (event.target.closest('.btn-role')) return

    if (container && !container.contains(event.target)) {
        activeRolePickerId.value = null
    }
}

const toggleRolePickerId = (id) => {
    if (activeRolePickerId.value !== id) {
        activeRolePickerId.value = id
    } else {
        activeRolePickerId.value = null
    }
}

const changeRole = async (user, role) => {
    if (!user || !role) {
        console.error('Нет пользователя или роли')
    }

    if (confirm(`Изменить роль пользователя ${user.name} с "${user.role}" на "${role}"?`)) {
        try {
            await adminStore.changeRole(user.id, role)
            const idx = users.value.findIndex((u) => u.id === user.id)

            if (idx !== -1) {
                users.value[idx].role = role
            }

            toast.success(`Роль изменена на "${role}"`)
        } catch (err) {
            console.error(err.message)
        }
    }
}

const deleteUser = async (user) => {
    if (confirm(`Удалить пользователя #${user.id}?`)) {
        try {
            await adminStore.softDelete(user.id)
            toast.success(`Пользователь ${user.id} удален`)
        } catch (err) {
            console.error(err.message)
        }
    }
}

onMounted(async () => {
    users.value = await adminStore.getUsers()

    document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
    <div class="admin-tabs">
        <div class="tabs-header">
            <button class="tab-btn" :class="{ active: activeTab === 'users' }" @click="activeTab = 'users'">👥 Пользователи</button>
            <button class="tab-btn" :class="{ active: activeTab === 'templates' }" @click="activeTab = 'templates'">📄 Шаблоны</button>
        </div>

        <div class="tab-content">
            <!-- Вкладка Пользователи -->
            <div class="tab-pane" :class="{ active: activeTab === 'users' }">
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Имя</th>
                                <th>Email</th>
                                <th>Роль</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="user in users" :key="user.id">
                                <td>{{ user.id }}</td>
                                <td>{{ user.name }}</td>
                                <td>{{ user.email }}</td>
                                <td>
                                    <span class="badge" :class="user.role === 'admin' ? 'badge-admin' : 'badge-user'">
                                        {{ user.role }}
                                    </span>
                                </td>
                                <td>
                                    <div class="action-btns">
                                        <button class="btn-sm btn-role" @click="toggleRolePickerId(user.id)">
                                            Сменить роль
                                            <div v-if="activeRolePickerId === user.id" class="role-picker-container">
                                                <template v-for="role in ROLES" :key="role">
                                                    <div v-if="role !== user.role" @click="changeRole(user, role)" class="role-picker-item">
                                                        {{ role }}
                                                    </div>
                                                </template>
                                            </div>
                                        </button>
                                        <button class="btn-sm btn-delete" @click="deleteUser(user)">Удалить</button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="tab-pane" :class="{ active: activeTab === 'templates' }">
                <p style="color: #5b6e8c; padding: 20px">Раздел управления шаблонами (будет позже)</p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.admin-tabs {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
}
.tabs-header {
    display: flex;
    gap: 8px;
    border-bottom: 2px solid #e2e8f0;
    flex-shrink: 0;
    padding-bottom: 6px;
}
.tab-btn {
    background: none;
    border: none;
    padding: 8px 18px;
    font-weight: 600;
    font-size: 0.85rem;
    color: #5b6e8c;
    cursor: pointer;
    border-radius: 20px 20px 0 0;
    transition: 0.1s;
}
.tab-btn:hover {
    background: #f1f5f9;
}
.tab-btn.active {
    background: #3b82f6;
    color: white;
    border-radius: 20px 20px 0 0;
}
.tab-content {
    flex: 1;
    padding-top: 16px;
    min-height: 0;
    display: flex;
    flex-direction: column;
}
.tab-pane {
    display: none;
    flex: 1;
    flex-direction: column;
    min-height: 0;
}
.tab-pane.active {
    display: flex;
}

.table-wrapper {
    flex: 1;
    overflow-y: auto;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
}
.table-wrapper table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
}
.table-wrapper th {
    background: #f8fafc;
    text-align: left;
    padding: 10px 12px;
    font-weight: 600;
    color: #1e293b;
    border-bottom: 1px solid #e2e8f0;
    position: sticky;
    top: 0;
    z-index: 2;
}
.table-wrapper td {
    padding: 10px 12px;
    border-bottom: 1px solid #f1f5f9;
    vertical-align: middle;
}
.table-wrapper tr:hover td {
    background: #f8fafc;
}
.badge {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 20px;
    font-size: 0.7rem;
    font-weight: 600;
}
.badge-admin {
    background: #dbeafe;
    color: #1e40af;
}
.badge-user {
    background: #f1f5f9;
    color: #475569;
}

.action-btns {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
}
.btn-sm {
    border: none;
    padding: 4px 12px;
    border-radius: 16px;
    font-size: 0.7rem;
    font-weight: 500;
    cursor: pointer;
    transition: 0.1s;
    position: relative;
}
.btn-role {
    background: #e2e8f0;
    color: #1e293b;
}
.btn-role:hover {
    background: #cbd5e1;
}
.btn-delete {
    background: #fee2e2;
    color: #b91c1c;
}
.btn-delete:hover {
    background: #fecaca;
}
.role-picker-container {
    width: 150%;
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 0.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 8px;
    border-radius: 8px;
    min-width: 2rem;
    min-height: 2rem;
    background: white;
    box-shadow: 1px 1px 12px 3px rgba(0, 0, 0, 0.1);
    z-index: 1;
}
.role-picker-item {
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
    z-index: 2;
}
.role-picker-item:hover {
    background: #eef3fc;
    border-color: #9bb6d0;
}

.table-wrapper::-webkit-scrollbar,
.tab-content::-webkit-scrollbar {
    width: 6px;
}
.table-wrapper::-webkit-scrollbar-track {
    background: #e9eef3;
    border-radius: 8px;
}
.table-wrapper::-webkit-scrollbar-thumb {
    background: #b9c8e0;
    border-radius: 8px;
}
</style>
