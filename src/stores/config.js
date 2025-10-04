// stores/config.js
import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'
import { ref, readonly } from 'vue'

export const useConfigStore = defineStore('config', () => {
  const config = ref({})
  const publicConfig = ref({}) // Nueva configuración pública
  const loading = ref(false)
  const publicLoading = ref(false) // Loading específico para config pública
  const loaded = ref(false)
  const publicLoaded = ref(false) // Loaded específico para config pública

  // Cargar configuración específica (con token)
  const getConfig = async (key) => {
    if (config.value[key]) {
      return config.value[key]
    }

    loading.value = true
    try {
      const response = await api.get(`/api/base/opcion/${key}`)
      config.value[key] = response.data.valor || response.data
      return config.value[key]
    } catch (error) {
      console.error(`Error cargando configuración ${key}:`, error)
      return null
    } finally {
      loading.value = false
    }
  }

  // Cargar múltiples configuraciones
  const loadConfigs = async (keys = []) => {
    if (keys.length === 0) return

    loading.value = true
    try {
      const promises = keys.map((key) =>
        api.get(`/api/base/opcion/${key}`).then((res) => ({
          key,
          value: res.data.valor || res.data,
        })),
      )

      const results = await Promise.all(promises)

      results.forEach(({ key, value }) => {
        config.value[key] = value
      })

      loaded.value = true
    } catch (error) {
      console.error('Error cargando configuraciones:', error)
    } finally {
      loading.value = false
    }
  }

  // Configuraciones esenciales del sistema
  const loadEssentialConfig = async () => {
    await loadConfigs([
      'tipo_entidad',
      'entidad',
      'mensaje_activar',
      'mensaje_tipo',
      'mensaje_texto',
    ])
  }

  // Cargar configuración pública específica (sin token)
  const getPublicConfig = async (key) => {
    if (publicConfig.value[key]) {
      return publicConfig.value[key]
    }

    publicLoading.value = true
    try {
      const response = await api.get(`/api/base/amaris/${key}`)
      publicConfig.value[key] = response.data.valor || response.data
      return publicConfig.value[key]
    } catch (error) {
      console.error(`Error cargando configuración pública ${key}:`, error)
      return null
    } finally {
      publicLoading.value = false
    }
  }

  // Cargar múltiples configuraciones públicas (sin token)
  const loadPublicConfigs = async (keys = []) => {
    if (keys.length === 0) return

    publicLoading.value = true
    try {
      const promises = keys.map((key) =>
        api.get(`/api/base/amaris/${key}`).then((res) => ({
          key,
          value: res.data.valor || res.data,
        })),
      )

      const results = await Promise.all(promises)

      results.forEach(({ key, value }) => {
        publicConfig.value[key] = value
      })

      publicLoaded.value = true
    } catch (error) {
      console.error('Error cargando configuraciones públicas:', error)
    } finally {
      publicLoading.value = false
    }
  }

  // Configuraciones públicas esenciales para login
  const loadPublicEssentialConfig = async () => {
    await loadPublicConfigs([
      'entidad',
      'tipo_entidad',
      'mensaje_tipo',
      'mensaje_texto',
      'mensaje_activar',
    ])
  }

  // Método $reset para compatibilidad con auth logout
  const $reset = () => {
    config.value = {}
    publicConfig.value = {}
    loading.value = false
    publicLoading.value = false
    loaded.value = false
    publicLoaded.value = false
  }

  return {
    config: readonly(config),
    publicConfig: readonly(publicConfig),
    loading,
    publicLoading,
    loaded,
    publicLoaded,
    getConfig,
    loadConfigs,
    loadEssentialConfig,
    getPublicConfig,
    loadPublicConfigs,
    loadPublicEssentialConfig,
    $reset,
  }
})
