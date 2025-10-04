import { ref, computed } from 'vue'
import { Loading } from 'quasar'

/**
 * Composable para manejo de estados de carga
 * Proporciona una API consistente para manejar múltiples estados de loading
 */
export function useLoading() {
  const loadingStates = ref(new Map())
  const globalLoading = ref(false)

  /**
   * Establece el estado de carga para una operación específica
   * @param {string} key - Identificador único de la operación
   * @param {boolean} loading - Estado de carga
   * @param {string} message - Mensaje opcional para mostrar
   */
  const setLoading = (key, loading, message = null) => {
    if (loading) {
      loadingStates.value.set(key, { loading: true, message })
    } else {
      loadingStates.value.delete(key)
    }

    // Actualizar el estado del Map para reactividad
    loadingStates.value = new Map(loadingStates.value)
  }

  /**
   * Verifica si una operación específica está cargando
   * @param {string} key - Identificador de la operación
   * @returns {boolean}
   */
  const isLoading = (key) => {
    return loadingStates.value.has(key)
  }

  /**
   * Obtiene el mensaje de carga para una operación específica
   * @param {string} key - Identificador de la operación
   * @returns {string|null}
   */
  const getLoadingMessage = (key) => {
    const state = loadingStates.value.get(key)
    return state?.message || null
  }

  /**
   * Verifica si hay alguna operación cargando
   * @returns {boolean}
   */
  const hasAnyLoading = computed(() => {
    return loadingStates.value.size > 0 || globalLoading.value
  })

  /**
   * Obtiene todas las operaciones que están cargando
   * @returns {Array}
   */
  const getAllLoadingOperations = computed(() => {
    return Array.from(loadingStates.value.keys())
  })

  /**
   * Limpia todos los estados de carga
   */
  const clearAllLoading = () => {
    loadingStates.value.clear()
    loadingStates.value = new Map(loadingStates.value) // Trigger reactivity
  }

  /**
   * Wrapper para operaciones async que maneja loading automáticamente
   * @param {string} key - Identificador de la operación
   * @param {Function} operation - Función async a ejecutar
   * @param {Object} options - Opciones adicionales
   * @returns {Promise}
   */
  const withLoading = async (key, operation, options = {}) => {
    const {
      message = 'Cargando...',
      showGlobalLoader = false,
      onStart = null,
      onComplete = null,
    } = options

    try {
      setLoading(key, true, message)

      if (showGlobalLoader) {
        Loading.show({
          message: message,
          spinner: undefined, // usar spinner por defecto
          spinnerColor: 'primary',
          spinnerSize: 140,
          backgroundColor: 'white',
          messageColor: 'black',
        })
      }

      if (onStart) {
        onStart()
      }

      const result = await operation()

      if (onComplete) {
        onComplete(result)
      }

      return result
    } finally {
      setLoading(key, false)

      if (showGlobalLoader) {
        Loading.hide()
      }
    }
  }

  /**
   * Establece loading global (para toda la aplicación)
   * @param {boolean} loading - Estado de carga
   * @param {string} message - Mensaje opcional
   */
  const setGlobalLoading = (loading, message = 'Cargando...') => {
    globalLoading.value = loading

    if (loading) {
      Loading.show({
        message: message,
        spinner: undefined,
        spinnerColor: 'primary',
        spinnerSize: 140,
        backgroundColor: 'white',
        messageColor: 'black',
      })
    } else {
      Loading.hide()
    }
  }

  /**
   * Estados de loading específicos para operaciones comunes
   */
  const commonLoadingKeys = {
    SAVING: 'saving',
    LOADING_DATA: 'loading_data',
    DELETING: 'deleting',
    UPLOADING: 'uploading',
    SEARCHING: 'searching',
    VALIDATING: 'validating',
  }

  /**
   * Helpers para operaciones comunes
   */
  const loadingHelpers = {
    /**
     * Loading para operaciones de guardado
     */
    withSaving: (operation, message = 'Guardando...') =>
      withLoading(commonLoadingKeys.SAVING, operation, { message }),

    /**
     * Loading para carga de datos
     */
    withDataLoading: (operation, message = 'Cargando datos...') =>
      withLoading(commonLoadingKeys.LOADING_DATA, operation, { message }),

    /**
     * Loading para operaciones de eliminación
     */
    withDeleting: (operation, message = 'Eliminando...') =>
      withLoading(commonLoadingKeys.DELETING, operation, { message }),

    /**
     * Loading para operaciones de subida de archivos
     */
    withUploading: (operation, message = 'Subiendo archivos...') =>
      withLoading(commonLoadingKeys.UPLOADING, operation, {
        message,
        showGlobalLoader: true,
      }),

    /**
     * Loading para operaciones de búsqueda
     */
    withSearching: (operation, message = 'Buscando...') =>
      withLoading(commonLoadingKeys.SEARCHING, operation, { message }),

    // Getters para estados específicos
    isSaving: computed(() => isLoading(commonLoadingKeys.SAVING)),
    isLoadingData: computed(() => isLoading(commonLoadingKeys.LOADING_DATA)),
    isDeleting: computed(() => isLoading(commonLoadingKeys.DELETING)),
    isUploading: computed(() => isLoading(commonLoadingKeys.UPLOADING)),
    isSearching: computed(() => isLoading(commonLoadingKeys.SEARCHING)),
  }

  return {
    // Estado
    globalLoading: computed(() => globalLoading.value),
    hasAnyLoading,
    getAllLoadingOperations,

    // Métodos principales
    setLoading,
    isLoading,
    getLoadingMessage,
    clearAllLoading,
    withLoading,
    setGlobalLoading,

    // Helpers para operaciones comunes
    ...loadingHelpers,

    // Constantes
    commonLoadingKeys,
  }
}
