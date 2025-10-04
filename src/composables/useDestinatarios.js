import { ref, computed, watch } from 'vue'
import { useApiOperations } from './useApiOperations'

/**
 * Composable para mejorar la UX de selección de destinatarios
 * Incluye funcionalidades como grupos frecuentes, historial y sugerencias
 */
export function useDestinatarios() {
  const { get } = useApiOperations()

  const destinatarios = ref([])
  const destinatariosFrecuentes = ref([])
  const historialDestinatarios = ref([])
  const grupos = ref([])
  const isLoading = ref(false)

  /**
   * Carga destinatarios disponibles con información completa
   * @param {string} searchTerm - Término de búsqueda opcional
   */
  const loadDestinatarios = async (searchTerm = '') => {
    try {
      isLoading.value = true
      const params = searchTerm ? { search: searchTerm } : {}
      const { data } = await get('/api/base/personas_con_oficina/', { params })

      // Formatear destinatarios para mejor visualización
      destinatarios.value = (data.results || data).map((item) => ({
        id: item.id,
        persona_id: item.persona.id,
        cargo_id: item.cargo.id,
        oficina_id: item.oficina.id,
        nombre_completo: item.persona.nombre_completo,
        documento: item.persona.documento,
        cargo_nombre: item.cargo.nombre,
        oficina_nombre: item.oficina.nombre,
        oficina_abreviatura: item.oficina.abreviatura,
        email: item.persona.email,
        // Campos computados para mejor UX
        display_name: `${item.persona.nombre_completo}`,
        display_subtitle: `${item.cargo.nombre} - ${item.oficina.nombre}`,
        search_text:
          `${item.persona.nombre_completo} ${item.cargo.nombre} ${item.oficina.nombre} ${item.persona.documento}`.toLowerCase(),
        // Metadata útil
        value: item,
        label: `${item.persona.nombre_completo}: ${item.cargo.nombre} de ${item.oficina.nombre}`,
      }))
    } catch (error) {
      console.error('Error al cargar destinatarios:', error)
      destinatarios.value = []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Carga destinatarios frecuentes basados en el historial del usuario
   */
  const loadDestinatariosFrecuentes = async () => {
    try {
      // TODO: Implementar endpoint para destinatarios frecuentes
      // Por ahora simular con localStorage
      const stored = localStorage.getItem('destinatarios_frecuentes')
      if (stored) {
        const frecuentesIds = JSON.parse(stored)
        // Filtrar destinatarios actuales por los IDs frecuentes
        destinatariosFrecuentes.value = destinatarios.value
          .filter((d) => frecuentesIds.includes(d.id))
          .slice(0, 5) // Top 5 más frecuentes
      }
    } catch (error) {
      console.error('Error al cargar destinatarios frecuentes:', error)
    }
  }

  /**
   * Carga grupos predefinidos de destinatarios
   */
  const loadGrupos = async () => {
    try {
      // TODO: Implementar grupos de destinatarios en el backend
      // Por ahora crear grupos básicos por oficina
      const gruposMap = new Map()

      destinatarios.value.forEach((destinatario) => {
        const oficinaKey = destinatario.oficina_id
        if (!gruposMap.has(oficinaKey)) {
          gruposMap.set(oficinaKey, {
            id: `grupo_oficina_${oficinaKey}`,
            nombre: destinatario.oficina_nombre,
            tipo: 'oficina',
            destinatarios: [],
          })
        }
        gruposMap.get(oficinaKey).destinatarios.push(destinatario)
      })

      grupos.value = Array.from(gruposMap.values())
        .filter((grupo) => grupo.destinatarios.length > 1) // Solo grupos con más de 1 destinatario
        .sort((a, b) => a.nombre.localeCompare(b.nombre))
    } catch (error) {
      console.error('Error al cargar grupos:', error)
    }
  }

  /**
   * Registra un destinatario en el historial para uso futuro
   * @param {Object} destinatario - Destinatario seleccionado
   */
  const registrarEnHistorial = (destinatario) => {
    try {
      // Agregar al historial local
      const historial = [...historialDestinatarios.value]
      const existeIndex = historial.findIndex((h) => h.id === destinatario.id)

      if (existeIndex >= 0) {
        // Si ya existe, mover al principio y aumentar contador
        historial[existeIndex].count = (historial[existeIndex].count || 1) + 1
        historial[existeIndex].last_used = new Date()
        historial.unshift(historial.splice(existeIndex, 1)[0])
      } else {
        // Si no existe, agregar al principio
        historial.unshift({
          ...destinatario,
          count: 1,
          last_used: new Date(),
        })
      }

      // Mantener solo los últimos 20
      historialDestinatarios.value = historial.slice(0, 20)

      // Guardar en localStorage
      localStorage.setItem(
        'historial_destinatarios',
        JSON.stringify(
          historialDestinatarios.value.map((d) => ({
            id: d.id,
            count: d.count,
            last_used: d.last_used,
          })),
        ),
      )

      // Actualizar frecuentes
      actualizarFrecuentes()
    } catch (error) {
      console.error('Error al registrar en historial:', error)
    }
  }

  /**
   * Actualiza la lista de destinatarios frecuentes
   */
  const actualizarFrecuentes = () => {
    // Ordenar por frecuencia de uso y fecha reciente
    const frecuentes = [...historialDestinatarios.value]
      .sort((a, b) => {
        // Primero por conteo, luego por fecha reciente
        if (b.count !== a.count) {
          return b.count - a.count
        }
        return new Date(b.last_used) - new Date(a.last_used)
      })
      .slice(0, 5)

    destinatariosFrecuentes.value = frecuentes

    // Guardar IDs frecuentes
    localStorage.setItem('destinatarios_frecuentes', JSON.stringify(frecuentes.map((d) => d.id)))
  }

  /**
   * Busca destinatarios con filtrado avanzado
   * @param {string} searchTerm - Término de búsqueda
   * @returns {Array} - Destinatarios filtrados
   */
  const searchDestinatarios = (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      return destinatarios.value.slice(0, 10) // Mostrar primeros 10 si no hay búsqueda
    }

    const term = searchTerm.toLowerCase()
    return destinatarios.value
      .filter((destinatario) => destinatario.search_text.includes(term))
      .slice(0, 20) // Limitar resultados para performance
  }

  /**
   * Obtiene sugerencias inteligentes basadas en contexto
   * @param {Object} context - Contexto actual (tipo documento, oficina actual, etc.)
   * @returns {Array} - Sugerencias de destinatarios
   */
  const getSugerenciasInteligentes = (context = {}) => {
    const sugerencias = []

    // Sugerencias basadas en tipo de documento
    if (context.tipoDocumento) {
      // TODO: Implementar lógica de sugerencias por tipo de documento
      // Por ahora, sugerir destinatarios de oficinas relacionadas
    }

    // Sugerencias basadas en oficina actual del usuario
    if (context.oficinaActual) {
      const destinatariosOficinaActual = destinatarios.value.filter(
        (d) => d.oficina_id === context.oficinaActual,
      )
      sugerencias.push({
        categoria: 'Mi Oficina',
        destinatarios: destinatariosOficinaActual,
      })
    }

    // Agregar frecuentes si existen
    if (destinatariosFrecuentes.value.length > 0) {
      sugerencias.push({
        categoria: 'Frecuentes',
        destinatarios: destinatariosFrecuentes.value,
      })
    }

    // Agregar recientes del historial
    const recientes = historialDestinatarios.value.slice(0, 3)
    if (recientes.length > 0) {
      sugerencias.push({
        categoria: 'Recientes',
        destinatarios: recientes,
      })
    }

    return sugerencias
  }

  /**
   * Valida si un destinatario puede recibir un tipo de documento específico
   * @param {Object} destinatario - Destinatario a validar
   * @param {string} tipoDocumentoId - ID del tipo de documento
   * @returns {boolean} - Si puede recibir el documento
   */
  const puedeRecibirDocumento = (destinatario, tipoDocumentoId) => {
    // TODO: Implementar validación basada en permisos del cargo
    // Por ahora asumir que todos pueden recibir todos los tipos
    console.log('Validando permisos:', {
      destinatario: destinatario?.id,
      tipoDocumento: tipoDocumentoId,
    })
    return true
  }

  /**
   * Formatea un destinatario para mostrar en UI
   * @param {Object} destinatario - Destinatario a formatear
   * @param {Object} options - Opciones de formato
   * @returns {Object} - Destinatario formateado
   */
  const formatDestinatario = (destinatario, options = {}) => {
    const { showDocument = false, showEmail = false, shortFormat = false } = options

    let formatted = {
      ...destinatario,
      avatar: destinatario.nombre_completo.charAt(0).toUpperCase(),
      avatarColor: getAvatarColor(destinatario.nombre_completo),
    }

    if (shortFormat) {
      formatted.display = `${destinatario.nombre_completo} (${destinatario.oficina_abreviatura})`
    } else {
      formatted.display = destinatario.display_name
      formatted.subtitle = destinatario.display_subtitle

      if (showDocument) {
        formatted.subtitle += ` - ${destinatario.documento}`
      }

      if (showEmail && destinatario.email) {
        formatted.subtitle += ` - ${destinatario.email}`
      }
    }

    return formatted
  }

  /**
   * Genera un color consistente para avatar basado en el nombre
   * @param {string} nombre - Nombre de la persona
   * @returns {string} - Color para el avatar
   */
  const getAvatarColor = (nombre) => {
    const colors = ['primary', 'secondary', 'accent', 'positive', 'negative', 'info', 'warning']
    const hash = nombre.split('').reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0)
      return a & a
    }, 0)
    return colors[Math.abs(hash) % colors.length]
  }

  /**
   * Carga historial desde localStorage al inicializar
   */
  const loadHistorialFromStorage = () => {
    try {
      const stored = localStorage.getItem('historial_destinatarios')
      if (stored) {
        const historialIds = JSON.parse(stored)
        // Necesitamos cargar los destinatarios primero para poder mapear el historial
        // Este método se llamará después de cargar destinatarios
        watch(
          destinatarios,
          (newDestinatarios) => {
            if (newDestinatarios.length > 0 && historialIds.length > 0) {
              historialDestinatarios.value = historialIds
                .map((histItem) => {
                  const destinatario = newDestinatarios.find((d) => d.id === histItem.id)
                  return destinatario ? { ...destinatario, ...histItem } : null
                })
                .filter(Boolean)

              actualizarFrecuentes()
            }
          },
          { immediate: true },
        )
      }
    } catch (error) {
      console.error('Error al cargar historial:', error)
    }
  }

  /**
   * Limpia el historial de destinatarios
   */
  const limpiarHistorial = () => {
    historialDestinatarios.value = []
    destinatariosFrecuentes.value = []
    localStorage.removeItem('historial_destinatarios')
    localStorage.removeItem('destinatarios_frecuentes')
  }

  // Computed properties
  const destinatariosCount = computed(() => destinatarios.value.length)
  const hasDestinatarios = computed(() => destinatarios.value.length > 0)
  const hasFrecuentes = computed(() => destinatariosFrecuentes.value.length > 0)
  const hasGrupos = computed(() => grupos.value.length > 0)

  return {
    // Estado
    destinatarios: computed(() => destinatarios.value),
    destinatariosFrecuentes: computed(() => destinatariosFrecuentes.value),
    historialDestinatarios: computed(() => historialDestinatarios.value),
    grupos: computed(() => grupos.value),
    isLoading: computed(() => isLoading.value),

    // Computed properties
    destinatariosCount,
    hasDestinatarios,
    hasFrecuentes,
    hasGrupos,

    // Métodos principales
    loadDestinatarios,
    loadDestinatariosFrecuentes,
    loadGrupos,
    searchDestinatarios,
    registrarEnHistorial,
    getSugerenciasInteligentes,

    // Utilidades
    puedeRecibirDocumento,
    formatDestinatario,
    loadHistorialFromStorage,
    limpiarHistorial,
  }
}
