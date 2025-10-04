import { api } from 'boot/axios'
import { useErrorHandler } from './useErrorHandler'

/**
 * Composable para operaciones de API con retry logic y optimistic updates
 */
export function useApiOperations() {
  const { handleAsync, showSuccessNotification } = useErrorHandler()

  /**
   * Configuración por defecto para retry
   */
  const defaultRetryConfig = {
    retries: 3,
    delay: 1000,
    backoff: 2,
    retryCondition: (error) => {
      // Reintentar solo para errores de red y 5xx
      return !error.response || error.response.status >= 500
    },
  }

  /**
   * Implementa retry con backoff exponencial
   * @param {Function} operation - Operación a ejecutar
   * @param {Object} config - Configuración de retry
   */
  const withRetry = async (operation, config = {}) => {
    const retryConfig = { ...defaultRetryConfig, ...config }
    let lastError

    for (let attempt = 0; attempt <= retryConfig.retries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error

        // No reintentar si no cumple la condición
        if (!retryConfig.retryCondition(error)) {
          throw error
        }

        // No reintentar en el último intento
        if (attempt === retryConfig.retries) {
          break
        }

        // Esperar antes del siguiente intento
        const delay = retryConfig.delay * Math.pow(retryConfig.backoff, attempt)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }

    throw lastError
  }

  /**
   * Operación GET con retry
   * @param {string} url - URL del endpoint
   * @param {Object} config - Configuración adicional
   */
  const get = async (url, config = {}) => {
    return withRetry(() => api.get(url, config), config.retry)
  }

  /**
   * Operación POST con optimistic updates
   * @param {string} url - URL del endpoint
   * @param {Object} data - Datos a enviar
   * @param {Object} options - Opciones de configuración
   */
  const post = async (url, data, options = {}) => {
    const {
      optimistic = null,
      onOptimisticUpdate = null,
      onOptimisticRevert = null,
      successMessage = 'Operación exitosa',
      ...config
    } = options

    // Aplicar update optimista si se proporciona
    if (optimistic && onOptimisticUpdate) {
      onOptimisticUpdate(optimistic)
    }

    try {
      const result = await withRetry(() => api.post(url, data, config), config.retry)

      if (successMessage) {
        showSuccessNotification(successMessage)
      }

      return result
    } catch (error) {
      // Revertir cambio optimista en caso de error
      if (optimistic && onOptimisticRevert) {
        onOptimisticRevert()
      }
      throw error
    }
  }

  /**
   * Operación PUT con optimistic updates
   * @param {string} url - URL del endpoint
   * @param {Object} data - Datos a actualizar
   * @param {Object} options - Opciones de configuración
   */
  const put = async (url, data, options = {}) => {
    const {
      optimistic = null,
      onOptimisticUpdate = null,
      onOptimisticRevert = null,
      successMessage = 'Actualización exitosa',
      ...config
    } = options

    // Aplicar update optimista si se proporciona
    if (optimistic && onOptimisticUpdate) {
      onOptimisticUpdate(optimistic)
    }

    try {
      const result = await withRetry(() => api.put(url, data, config), config.retry)

      if (successMessage) {
        showSuccessNotification(successMessage)
      }

      return result
    } catch (error) {
      // Revertir cambio optimista en caso de error
      if (optimistic && onOptimisticRevert) {
        onOptimisticRevert()
      }
      throw error
    }
  }

  /**
   * Operación DELETE con optimistic updates
   * @param {string} url - URL del endpoint
   * @param {Object} options - Opciones de configuración
   */
  const del = async (url, options = {}) => {
    const {
      optimistic = null,
      onOptimisticUpdate = null,
      onOptimisticRevert = null,
      successMessage = 'Eliminación exitosa',
      ...config
    } = options

    // Aplicar update optimista si se proporciona
    if (optimistic && onOptimisticUpdate) {
      onOptimisticUpdate(optimistic)
    }

    try {
      const result = await withRetry(() => api.delete(url, config), config.retry)

      if (successMessage) {
        showSuccessNotification(successMessage)
      }

      return result
    } catch (error) {
      // Revertir cambio optimista en caso de error
      if (optimistic && onOptimisticRevert) {
        onOptimisticRevert()
      }
      throw error
    }
  }

  /**
   * Operación PATCH con optimistic updates
   * @param {string} url - URL del endpoint
   * @param {Object} data - Datos a actualizar parcialmente
   * @param {Object} options - Opciones de configuración
   */
  const patch = async (url, data, options = {}) => {
    const {
      optimistic = null,
      onOptimisticUpdate = null,
      onOptimisticRevert = null,
      successMessage = 'Actualización exitosa',
      ...config
    } = options

    // Aplicar update optimista si se proporciona
    if (optimistic && onOptimisticUpdate) {
      onOptimisticUpdate(optimistic)
    }

    try {
      const result = await withRetry(() => api.patch(url, data, config), config.retry)

      if (successMessage) {
        showSuccessNotification(successMessage)
      }

      return result
    } catch (error) {
      // Revertir cambio optimista en caso de error
      if (optimistic && onOptimisticRevert) {
        onOptimisticRevert()
      }
      throw error
    }
  }

  return {
    get,
    post,
    put,
    patch,
    del,
    withRetry,
    handleAsync,
  }
}
