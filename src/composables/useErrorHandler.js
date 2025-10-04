import { ref, computed } from 'vue'
import { Notify } from 'quasar'

/**
 * Composable para manejo centralizado de errores
 * Proporciona una API consistente para manejar errores de validación y de red
 */
export function useErrorHandler() {
  const errors = ref({})
  const isLoading = ref(false)

  /**
   * Limpia todos los errores
   */
  const clearErrors = () => {
    errors.value = {}
  }

  /**
   * Limpia errores de un campo específico
   * @param {string} field - Nombre del campo
   */
  const clearFieldError = (field) => {
    if (errors.value[field]) {
      delete errors.value[field]
    }
  }

  /**
   * Establece errores desde una respuesta de API
   * @param {Object} errorResponse - Respuesta de error del backend
   */
  const setErrors = (errorResponse) => {
    if (typeof errorResponse === 'string') {
      // Error simple como string
      showErrorNotification(errorResponse)
      return
    }

    if (errorResponse?.response?.data) {
      const errorData = errorResponse.response.data

      // Manejar errores de validación (400)
      if (errorResponse.response.status === 400) {
        if (typeof errorData === 'object') {
          // Guardar errores de campo
          errors.value = { ...errorData }

          // Crear un mensaje de error genérico
          let errorMessage = 'Error de validación'

          // Extraer el primer error disponible de forma genérica
          const firstErrorKey = Object.keys(errorData)[0]
          const firstError = errorData[firstErrorKey]

          if (Array.isArray(firstError)) {
            // Si es un array, puede contener objetos de error o strings
            const firstItem = firstError[0]
            if (typeof firstItem === 'string') {
              errorMessage = `${firstErrorKey}: ${firstItem}`
            } else if (typeof firstItem === 'object' && firstItem !== null) {
              // Si es un objeto, buscar message, detail o convertir a string
              const itemMessage = firstItem.message || firstItem.detail || JSON.stringify(firstItem)
              errorMessage = `${firstErrorKey}: ${itemMessage}`
            }
          } else if (typeof firstError === 'string') {
            errorMessage = `${firstErrorKey}: ${firstError}`
          } else if (typeof firstError === 'object' && firstError !== null) {
            // Si el error es un objeto, buscar propiedades comunes
            const objectMessage =
              firstError.message || firstError.detail || 'Error en los datos enviados'
            errorMessage = `${firstErrorKey}: ${objectMessage}`
          }

          showErrorNotification(errorMessage)
        } else {
          const message = errorData.detail || 'Error de validación'
          showErrorNotification(message)
        }
        return
      }

      // Manejar otros errores HTTP
      const message =
        errorData.detail || errorData.message || `Error ${errorResponse.response.status}`
      showErrorNotification(message)
    } else {
      // Error de red o desconocido
      showErrorNotification('Error de conexión. Verifique su conexión a internet.')
    }
  }

  /**
   * Obtiene el mensaje de error para un campo específico
   * @param {string} field - Nombre del campo
   * @returns {string|null} - Mensaje de error o null
   */
  const getFieldError = (field) => {
    const error = errors.value[field]
    if (Array.isArray(error)) {
      return error[0] // Tomar el primer error si es un array
    }
    return error || null
  }

  /**
   * Verifica si un campo tiene error
   * @param {string} field - Nombre del campo
   * @returns {boolean}
   */
  const hasFieldError = (field) => {
    return !!errors.value[field]
  }

  /**
   * Verifica si hay algún error
   * @returns {boolean}
   */
  const hasErrors = computed(() => {
    return Object.keys(errors.value).length > 0
  })

  /**
   * Muestra notificación de error
   * @param {string} message - Mensaje de error
   */
  const showErrorNotification = (message) => {
    Notify.create({
      type: 'negative',
      message: message,
      position: 'top',
      timeout: 5000,
      actions: [
        {
          label: 'Cerrar',
          color: 'white',
          handler: () => {},
        },
      ],
    })
  }

  /**
   * Muestra notificación de éxito
   * @param {string} message - Mensaje de éxito
   */
  const showSuccessNotification = (message) => {
    Notify.create({
      type: 'positive',
      message: message,
      position: 'top',
      timeout: 3000,
    })
  }

  /**
   * Muestra notificación de advertencia
   * @param {string} message - Mensaje de advertencia
   */
  const showWarningNotification = (message) => {
    Notify.create({
      type: 'warning',
      message: message,
      position: 'top',
      timeout: 4000,
    })
  }

  /**
   * Wrapper para operaciones async que maneja errores automáticamente
   * @param {Function} operation - Función async a ejecutar
   * @param {Object} options - Opciones adicionales
   * @returns {Promise} - Resultado de la operación
   */
  const handleAsync = async (operation, options = {}) => {
    const { loadingMessage = null, successMessage = null, showErrors = true } = options

    try {
      clearErrors()
      isLoading.value = true

      if (loadingMessage) {
        Notify.create({
          type: 'ongoing',
          message: loadingMessage,
          spinner: true,
        })
      }

      const result = await operation()

      if (successMessage) {
        showSuccessNotification(successMessage)
      }

      return result
    } catch (error) {
      if (showErrors) {
        setErrors(error)
      }
      throw error
    } finally {
      isLoading.value = false
    }
  }

  return {
    errors: computed(() => errors.value),
    isLoading: computed(() => isLoading.value),
    hasErrors,
    clearErrors,
    clearFieldError,
    setErrors,
    getFieldError,
    hasFieldError,
    showErrorNotification,
    showSuccessNotification,
    showWarningNotification,
    handleAsync,
  }
}
