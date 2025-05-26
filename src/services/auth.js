import { api } from 'boot/axios'

// Iniciar sesión
export async function login(credentials) {
  const response = await api.post('/api/token/', credentials)
  return response.data
}

// Renovar token (usado por el interceptor, pero exportado por si acaso)
export async function refreshToken(refresh) {
  const response = await api.post('/api/token/refresh/', { refresh })
  return response.data
}

// Obtener datos del usuario
export async function getCurrentUser() {
  const response = await api.get('/api/base/me/')
  return response.data
}

// Logout (limpieza local)
export function logout() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}
