// composables/useConfig.js
import { computed } from 'vue'
import { useConfigStore } from 'src/stores/config'
import { storeToRefs } from 'pinia'

export function useConfig() {
  const configStore = useConfigStore()

  // Usar storeToRefs para obtener referencias reactivas correctas
  const { config, publicConfig, loading, publicLoading, loaded, publicLoaded } =
    storeToRefs(configStore)

  // Cargar configuración si no existe
  const ensureConfig = async (key) => {
    if (!config.value[key]) {
      await configStore.getConfig(key)
    }
    return config.value[key]
  }

  // Cargar configuración pública si no existe
  const ensurePublicConfig = async (key) => {
    if (!publicConfig.value[key]) {
      await configStore.getPublicConfig(key)
    }
    return publicConfig.value[key]
  }

  // Getter reactivo para configuración específica
  const getConfigValue = (key, defaultValue = '') => {
    return computed(() => config.value[key] || defaultValue)
  }

  // Getter reactivo para configuración pública específica
  const getPublicConfigValue = (key, defaultValue = '') => {
    return computed(() => publicConfig.value[key] || defaultValue)
  }

  // Función dinámica para obtener cualquier configuración pública
  const usePublicConfig = (key, defaultValue = '') => {
    return computed(() => publicConfig.value[key] || defaultValue)
  }

  // Función dinámica para obtener cualquier configuración privada
  const usePrivateConfig = (key, defaultValue = '') => {
    return computed(() => config.value[key] || defaultValue)
  }

  // Configuraciones privadas (con token) - usando el método dinámico
  const entidad = usePrivateConfig('entidad', 'GRACE')
  const tipo_entidad = usePrivateConfig('tipo_entidad', 'Municipalidad distrital de')

  // Configuraciones públicas (sin token) - usando el método dinámico
  const publicEntidad = usePublicConfig('entidad', 'GRACE')
  const publicTipoEntidad = usePublicConfig('tipo_entidad', 'Municipalidad distrital de')
  const mensajeTipo = usePublicConfig('mensaje_tipo', '')
  const mensajeTexto = usePublicConfig('mensaje_texto', '')
  const mensajeActivar = usePublicConfig('mensaje_activar', 'false')

  return {
    // Store methods
    getConfig: configStore.getConfig,
    loadConfigs: configStore.loadConfigs,
    loadEssentialConfig: configStore.loadEssentialConfig,

    // Public store methods
    getPublicConfig: configStore.getPublicConfig,
    loadPublicConfigs: configStore.loadPublicConfigs,
    loadPublicEssentialConfig: configStore.loadPublicEssentialConfig,

    // Dynamic methods for accessing configs
    usePublicConfig, // Nueva función dinámica para configs públicos
    usePrivateConfig, // Nueva función dinámica para configs privados

    // Legacy computed value getters (para compatibilidad)
    getConfigValue,
    getPublicConfigValue,
    ensureConfig,
    ensurePublicConfig,

    // Private configs (with token)
    entidad,
    tipo_entidad,

    // Public configs (without token) - for login
    publicEntidad,
    publicTipoEntidad,
    mensajeTipo,
    mensajeTexto,
    mensajeActivar,

    // State (usando storeToRefs para reactividad correcta)
    loading,
    publicLoading,
    loaded,
    publicLoaded,
    config,
    publicConfig,
  }
}
