import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTemplatesStore } from '@/stores/templates'

const checkTemplateAccess = async (to, from, { requiresAuth = false } = {}) => {
    const templatesStore = useTemplatesStore()
    const authStore = useAuthStore()

    try {
        if (templatesStore.currentTemplate?.id !== to.params.id) {
            await templatesStore.getTemplate(to.params.id)
        }

        const template = templatesStore.currentTemplate

        if (!template) return { path: '/' }
        if (template.isPublic && !requiresAuth) return true
        if (!authStore.user) return { path: '/' }
        if (authStore.user?.id !== template.author.id && authStore.user?.role !== 'ADMIN') return { path: '/' }

        return true
    } catch (err) {
        return { path: '/' }
    }
}

const routes = [
    {
        path: '/',
        component: () => import('@/layouts/DefaultLayout.vue'),
        children: [
            { path: '', component: () => import('@/views/HomePage.vue') },
            { path: '/profile', component: () => import('@/views/ProfilePage.vue'), meta: { requiresAuth: true } },
            { path: '/create', component: () => import('@/views/CreatePage.vue'), meta: { requiresAuth: true } },
            {
                path: '/template/:id/edit',
                component: () => import('@/views/EditorPage.vue'),
                beforeEnter: (to, from) => checkTemplateAccess(to, from, { requiresAuth: false })
            },
            {
                path: '/template/:id',
                component: () => import('@/views/TemplatePage.vue'),
                beforeEnter: (to, from) => checkTemplateAccess(to, from, { requiresAuth: false })
            },
            { path: '/admin', component: () => import('@/views/AdminPage.vue'), meta: { requiresAuth: true, requiresAdmin: true } }
        ]
    }
]

export const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach(async (to) => {
    const authStore = useAuthStore()

    if (!authStore.initialized) {
        await authStore.restoreSession()
    }

    if (to.meta?.requiresAuth && !authStore.isAuthenticated) {
        return { path: '/' }
    }

    if (to.meta?.requiresAdmin && authStore.user?.role !== 'ADMIN') {
        return { path: '/' }
    }
})

export default router
