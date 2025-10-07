import { defineStore } from 'pinia'
import { getPersona, getPersonaConCargos } from 'src/services/persona'

export const usePersonaStore = defineStore('persona', {
  state: () => ({
    persona: null,
    isLoading: false,
  }),
  getters: {
    // Getter para obtener las oficinas de la persona actual
    oficinasAsignadas: (state) => {
      if (!state.persona?.asignaciones_cargo) return []
      return state.persona.asignaciones_cargo.map((asignacion) => ({
        id: asignacion.oficina,
        nombre: asignacion.oficina_nombre,
        cargo_id: asignacion.cargo,
        cargo_nombre: asignacion.cargo_nombre,
        asignacion_id: asignacion.id,
        es_responsable: asignacion.es_responsable,
        fecha_inicio: asignacion.fecha_inicio,
      }))
    },
    // Getter para el nombre completo
    nombreCompleto: (state) => {
      if (!state.persona) return ''
      return `${state.persona.nombres} ${state.persona.apellidos}`
    },
  },
  actions: {
    async fetchPersona() {
      this.isLoading = true
      try {
        this.persona = await getPersona()
      } catch (error) {
        console.error('Error fetching persona:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },
    async fetchPersonaConCargos() {
      this.isLoading = true
      try {
        this.persona = await getPersonaConCargos()
      } catch (error) {
        console.error('Error fetching persona con cargos:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },
    async initialize() {
      try {
        // Por defecto cargamos la persona con cargos para tener toda la info
        await this.fetchPersonaConCargos()
      } catch (error) {
        console.error('Error initializing persona store:', error)
        throw error
      }
    },
  },
})
