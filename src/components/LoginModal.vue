<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'

const toast = useToast()

const props = defineProps({
    isOpen: Boolean
})
const emit = defineEmits(['close'])

const authStore = useAuthStore()

const initialRegisterState = {
    name: '',
    email: '',
    password: '',
    confirm: '',
    error: null,
    nameError: null,
    emailError: null,
    passwordError: null
}
const registerForm = ref({ ...initialRegisterState })

const initialLoginState = {
    email: '',
    password: '',
    error: null,
    emailError: null,
    passwordError: null
}
const loginForm = ref({ ...initialLoginState })

const isLoginMode = ref(true)

const close = () => {
    emit('close')
    registerForm.value = { ...initialRegisterState }
    loginForm.value = { ...initialLoginState }
    isLoginMode.value = true
}

const validateRegisterName = () => {
    const value = registerForm.value.name

    if (!value) {
        registerForm.value.nameError = 'Необходимо указать имя'
        return false
    }

    registerForm.value.nameError = ''
    return true
}

const validateEmail = (email) => {
    const value = email.trim()

    if (!value) return 'Email обязателен'

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(email)) return 'Email должен быть валидным'

    return null
}

const validateRegisterEmail = () => {
    const error = validateEmail(registerForm.value.email)
    registerForm.value.emailError = error
    return error === null
}

const validateLoginEmail = () => {
    const error = validateEmail(loginForm.value.email)
    loginForm.value.emailError = error
    return error === null
}

const validatePassword = (password) => {
    const value = password

    if (!value) return 'Пароль обязателен'

    return null
}

const validateLoginPassword = () => {
    const error = validatePassword(loginForm.value.password)
    loginForm.value.passwordError = error
    return error === null
}

const validateRegisterPassword = () => {
    const error = validatePassword(registerForm.value.password)
    registerForm.value.passwordError = error
    return error === null
}

const handleRegister = async () => {
    if (registerForm.value.password !== registerForm.value.confirm) {
        registerForm.value.error = 'Пароли не совпадают'
    }

    if (!validateRegisterEmail() || !validateRegisterPassword()) return

    try {
        registerForm.value.error = null
        await authStore.register(registerForm.value.name, registerForm.value.email, registerForm.value.password)
        toast.success(`Пользователь ${name} зарегистрирован`)
        close()
    } catch (err) {
        const responseError = err.response?.data?.message
        if (responseError) {
            registerForm.value.error = responseError
        }
        console.error(err.message)
    }
}

const handleLogin = async () => {
    if (!validateLoginEmail() || !validateLoginPassword()) return

    try {
        loginForm.value.error = null
        await authStore.login(loginForm.value.email, loginForm.value.password)
        close()
    } catch (err) {
        const responseError = err.response?.data?.message
        if (responseError) {
            loginForm.value.error = responseError
        }
        console.error(err.message)
    }
}

const switchToRegister = () => {
    isLoginMode.value = false
}

const switchToLogin = () => {
    isLoginMode.value = true
}
</script>

<template>
    <Teleport to="body">
        <div v-if="isOpen" class="modal-overlay" @click.self="close">
            <div class="modal-content">
                <button class="modal-close" @click="close">×</button>
                <div v-if="isLoginMode" class="login-form-wrapper">
                    <h2>Вход</h2>
                    <form @submit.prevent="handleLogin">
                        <div class="form-group">
                            <label>Email</label>
                            <input v-model="loginForm.email" type="email" required placeholder="email@example.com" @blur="validateLoginEmail" />
                            <p v-if="loginForm.emailError" class="error">{{ loginForm.emailError }}</p>
                        </div>
                        <div class="form-group">
                            <label>Пароль</label>
                            <input v-model="loginForm.password" type="password" required placeholder="••••••••" @blur="validateLoginPassword" />
                            <p v-if="loginForm.passwordError" class="error">{{ loginForm.passwordError }}</p>
                        </div>
                        <button type="submit" class="btn-primary" :disabled="authStore.isLoggingIn">
                            {{ authStore.isLoggingIn ? 'Вход...' : 'Войти' }}
                        </button>
                        <p v-if="loginForm.error" class="error">{{ loginForm.error }}</p>
                        <p class="register-link toggle-mode-link">
                            <a href="#" @click.prevent="switchToRegister">Зарегистрироваться</a>
                        </p>
                    </form>
                </div>
                <div v-else class="register-form-wrapper">
                    <h2>Регистрация</h2>
                    <form @submit.prevent="handleRegister">
                        <div class="form-group">
                            <label>Имя</label>
                            <input v-model="registerForm.name" type="text" required placeholder="Max" @blur="validateRegisterName" />
                            <p v-if="registerForm.nameError" class="error">{{ registerForm.nameError }}</p>
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input v-model="registerForm.email" type="email" required placeholder="email@example.com" @blur="validateRegisterEmail" />
                            <p v-if="registerForm.emailError" class="error">{{ registerForm.emailError }}</p>
                        </div>
                        <div class="form-group">
                            <label>Пароль</label>
                            <input v-model="registerForm.password" type="password" required placeholder="••••••••" @blur="validateRegisterPassword" />
                            <p v-if="registerForm.passwordError" class="error">{{ registerForm.passwordError }}</p>
                        </div>
                        <div class="form-group">
                            <label>Подтверждение пароля</label>
                            <input v-model="registerForm.confirm" type="password" required placeholder="••••••••" />
                        </div>
                        <button type="submit" class="btn-primary" :disabled="authStore.isRegistering">
                            {{ authStore.isRegistering ? 'Регистрация...' : 'Зарегистрироваться' }}
                        </button>
                        <p v-if="registerForm.error" class="error">{{ registerForm.error }}</p>
                        <p class="login-link toggle-mode-link">
                            <a href="#" @click.prevent="switchToLogin">Войти</a>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}
.modal-content {
    background: white;
    padding: 2rem;
    border-radius: 1.5rem;
    max-width: 400px;
    width: 90%;
    position: relative;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
}
.modal-close {
    position: absolute;
    top: 10px;
    right: 16px;
    font-size: 1.5rem;
    cursor: pointer;
    background: none;
    border: none;
    color: #5b6e8c;
}
.modal-close:hover {
    color: #1e293b;
}
h2 {
    margin-bottom: 1rem;
    font-size: 1.5rem;
}
.form-group {
    margin-bottom: 1rem;
}
.form-group label {
    display: block;
    margin-bottom: 0.25rem;
    font-weight: 600;
    font-size: 0.9rem;
}
.form-group input {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid #cfdfed;
    border-radius: 12px;
}
.btn-primary {
    width: 100%;
    padding: 0.6rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 2rem;
    font-weight: 600;
    cursor: pointer;
}
.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
.error {
    color: #dc2626;
    font-size: 0.8rem;
    margin-top: 0.5rem;
}
.toggle-mode-link {
    margin-top: 1rem;
    font-size: 0.8rem;
}
.toggle-mode-link:hover {
    color: #3b82f6;
}
</style>
