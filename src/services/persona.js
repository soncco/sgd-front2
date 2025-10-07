import { api } from 'boot/axios'
import { useAuthStore } from 'src/stores/auth'

export async function getPersona() {
  try {
    const authStore = useAuthStore()
    const persona = authStore.user?.persona

    if (!persona?.id) {
      throw new Error('No hay usuario autenticado o persona asociada')
    }

    const response = await api.get(`/api/base/personas/${persona.id}/`)
    return response.data
  } catch (error) {
    console.error('Error en getPersona:', error)
    throw error
  }
}

export async function getPersonaConCargos() {
  try {
    const authStore = useAuthStore()
    const persona = authStore.user?.persona

    if (!persona?.id) {
      throw new Error('No hay usuario autenticado o persona asociada')
    }

    const response = await api.get(`/api/base/personas_con_cargos/${persona.id}/`)
    return response.data
  } catch (error) {
    console.error('Error en getPersonaConCargos:', error)
    throw error
  }
}
