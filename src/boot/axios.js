import { boot } from 'quasar/wrappers'
import axios from 'axios'

// Crear instancia de Axios
const api = axios.create({ baseURL: process.env.BACKEND_URL })

// Interceptor para añadir token a las solicitudes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Interceptor para manejar errores 401 y renovar token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const refreshToken = localStorage.getItem('refresh_token')
        const { data } = await axios.post(`${process.env.BACKEND_URL}/api/token/refresh/`, {
          refresh: refreshToken,
        })
        localStorage.setItem('access_token', data.access)
        originalRequest.headers.Authorization = `Bearer ${data.access}`
        return api(originalRequest)
      } catch (refreshError) {
        // Si falla la renovación, redirigir al login
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  },
)

export default boot(({ app }) => {
  // Hacer que la instancia de Axios esté disponible globalmente
  app.config.globalProperties.$axios = api
  app.config.globalProperties.$api = api
})

export { api }
