import { api } from 'boot/axios'

import { useAuthStore } from 'src/stores/auth'

const authStore = useAuthStore()

export async function getPersona() {
  const persona = authStore.user.persona
  const response = await api.get(`/api/base/personas/${persona.id}/`)
  return response.data
}
