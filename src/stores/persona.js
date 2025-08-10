import { defineStore } from 'pinia'
import { getPersona } from 'src/services/persona'

export const usePersonaStore = defineStore('persona', {
  state: () => ({
    persona: null,
  }),
  actions: {
    async fetchPersona() {
      this.persona = await getPersona()
    },
    async initialize() {
      try {
        await this.fetchPersona()
      } catch (error) {
        console.error('Error fetching persona:', error)
      }
    },
  },
})
