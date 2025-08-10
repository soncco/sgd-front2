import { defineStore, getActivePinia } from 'pinia'
import { login, getCurrentUser, logout } from 'src/services/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: false,
    user: null,
    isAdmin: false,
    persona: null,
  }),

  actions: {
    async login(credentials) {
      const { access, refresh } = await login(credentials)
      localStorage.setItem('access_token', access)
      localStorage.setItem('refresh_token', refresh)
      this.isAuthenticated = true
      await this.fetchUser()
    },

    async fetchUser() {
      try {
        const userData = await getCurrentUser()
        this.user = userData
        this.isAdmin = userData.is_admin || false
        this.persona = userData.persona || null
      } catch (error) {
        this.logout()
        throw error
      }
    },

    logout() {
      logout()
      this.isAuthenticated = false
      this.user = null
      this.isAdmin = false
      this.persona = null
      // Reset all Pinia stores
      getActivePinia()._s.forEach((store) => store.$reset())
    },

    async initialize() {
      const token = localStorage.getItem('access_token')
      if (token) {
        this.isAuthenticated = true
        await this.fetchUser()
      }
    },
  },
})
