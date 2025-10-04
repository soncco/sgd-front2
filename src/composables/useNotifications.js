import { ref, computed } from 'vue'
import { Notify } from 'quasar'

/**
 * Composable para manejo de notificaciones en tiempo real
 * Este es un placeholder para futuras implementaciones con WebSockets
 */
export function useNotifications() {
  const notifications = ref([])
  const unreadCount = ref(0)
  const isConnected = ref(false)

  /**
   * Agrega una notificación al sistema
   * @param {Object} notification - Objeto de notificación
   * @param {string} notification.id - ID único de la notificación
   * @param {string} notification.type - Tipo de notificación (info, warning, error, success)
   * @param {string} notification.title - Título de la notificación
   * @param {string} notification.message - Mensaje de la notificación
   * @param {Date} notification.timestamp - Fecha y hora de la notificación
   * @param {boolean} notification.read - Si la notificación ha sido leída
   * @param {Object} notification.data - Datos adicionales de la notificación
   */
  const addNotification = (notification) => {
    const newNotification = {
      id: notification.id || `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: notification.type || 'info',
      title: notification.title || 'Notificación',
      message: notification.message || '',
      timestamp: notification.timestamp || new Date(),
      read: notification.read || false,
      data: notification.data || {},
      ...notification,
    }

    notifications.value.unshift(newNotification)

    if (!newNotification.read) {
      unreadCount.value++
    }

    // Mostrar notificación visual usando Quasar
    showVisualNotification(newNotification)

    // Auto-remover notificaciones muy antiguas (más de 50)
    if (notifications.value.length > 50) {
      const removedNotifs = notifications.value.splice(50)
      // Actualizar contador de no leídas
      const removedUnread = removedNotifs.filter((n) => !n.read).length
      unreadCount.value = Math.max(0, unreadCount.value - removedUnread)
    }
  }

  /**
   * Muestra notificación visual usando Quasar Notify
   * @param {Object} notification - Notificación a mostrar
   */
  const showVisualNotification = (notification) => {
    const notifyConfig = {
      message: notification.message,
      caption: notification.title,
      position: 'top-right',
      timeout: getTimeoutByType(notification.type),
      actions: [
        {
          label: 'Ver',
          color: 'white',
          handler: () => {
            markAsRead(notification.id)
            // Aquí podrías agregar lógica para navegar a la página relacionada
          },
        },
        {
          label: 'Cerrar',
          color: 'white',
          handler: () => {},
        },
      ],
    }

    // Configurar tipo y color según el tipo de notificación
    switch (notification.type) {
      case 'success':
        notifyConfig.type = 'positive'
        notifyConfig.icon = 'check_circle'
        break
      case 'warning':
        notifyConfig.type = 'warning'
        notifyConfig.icon = 'warning'
        break
      case 'error':
        notifyConfig.type = 'negative'
        notifyConfig.icon = 'error'
        break
      case 'document':
        notifyConfig.type = 'info'
        notifyConfig.icon = 'description'
        notifyConfig.color = 'blue'
        break
      default:
        notifyConfig.type = 'info'
        notifyConfig.icon = 'info'
    }

    Notify.create(notifyConfig)
  }

  /**
   * Obtiene el timeout apropiado según el tipo de notificación
   * @param {string} type - Tipo de notificación
   * @returns {number} - Timeout en milisegundos
   */
  const getTimeoutByType = (type) => {
    switch (type) {
      case 'error':
        return 8000 // Errores se muestran más tiempo
      case 'warning':
        return 6000
      case 'success':
        return 3000
      default:
        return 5000
    }
  }

  /**
   * Marca una notificación como leída
   * @param {string} notificationId - ID de la notificación
   */
  const markAsRead = (notificationId) => {
    const notification = notifications.value.find((n) => n.id === notificationId)
    if (notification && !notification.read) {
      notification.read = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  }

  /**
   * Marca todas las notificaciones como leídas
   */
  const markAllAsRead = () => {
    notifications.value.forEach((notification) => {
      notification.read = true
    })
    unreadCount.value = 0
  }

  /**
   * Elimina una notificación específica
   * @param {string} notificationId - ID de la notificación
   */
  const removeNotification = (notificationId) => {
    const index = notifications.value.findIndex((n) => n.id === notificationId)
    if (index > -1) {
      const notification = notifications.value[index]
      if (!notification.read) {
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
      notifications.value.splice(index, 1)
    }
  }

  /**
   * Limpia todas las notificaciones
   */
  const clearAllNotifications = () => {
    notifications.value = []
    unreadCount.value = 0
  }

  /**
   * Obtiene notificaciones filtradas por tipo
   * @param {string} type - Tipo de notificación a filtrar
   * @returns {Array} - Array de notificaciones filtradas
   */
  const getNotificationsByType = (type) => {
    return notifications.value.filter((n) => n.type === type)
  }

  /**
   * Obtiene solo notificaciones no leídas
   * @returns {Array} - Array de notificaciones no leídas
   */
  const getUnreadNotifications = computed(() => {
    return notifications.value.filter((n) => !n.read)
  })

  /**
   * Verifica si hay notificaciones no leídas
   * @returns {boolean}
   */
  const hasUnreadNotifications = computed(() => {
    return unreadCount.value > 0
  })

  /**
   * Conectar a WebSocket para notificaciones en tiempo real
   * PLACEHOLDER: Esta función se implementará cuando se configure WebSocket en el backend
   */
  const connectToNotifications = async () => {
    try {
      // TODO: Implementar conexión WebSocket
      console.log('Conectando a notificaciones en tiempo real...')

      // Simulación de conexión exitosa
      isConnected.value = true

      // Aquí iría la lógica real de WebSocket:
      /*
      const ws = new WebSocket('ws://localhost:8000/ws/notifications/')

      ws.onopen = () => {
        isConnected.value = true
        console.log('Conectado a notificaciones en tiempo real')
      }

      ws.onmessage = (event) => {
        const notification = JSON.parse(event.data)
        addNotification(notification)
      }

      ws.onclose = () => {
        isConnected.value = false
        console.log('Desconectado de notificaciones')
      }

      ws.onerror = (error) => {
        console.error('Error en WebSocket:', error)
        isConnected.value = false
      }
      */
    } catch (error) {
      console.error('Error al conectar notificaciones:', error)
      isConnected.value = false
    }
  }

  /**
   * Desconectar de notificaciones en tiempo real
   */
  const disconnectFromNotifications = () => {
    // TODO: Cerrar conexión WebSocket
    isConnected.value = false
    console.log('Desconectado de notificaciones')
  }

  /**
   * Helpers para tipos específicos de notificaciones del sistema de trámites
   */
  const tramiteNotifications = {
    /**
     * Notificación de documento recibido
     */
    documentoRecibido: (documento) => {
      addNotification({
        type: 'document',
        title: 'Documento Recibido',
        message: `Nuevo documento: ${documento.asunto}`,
        data: { documentoId: documento.id, tipo: 'documento_recibido' },
      })
    },

    /**
     * Notificación de documento derivado
     */
    documentoDerivado: (documento, oficina) => {
      addNotification({
        type: 'info',
        title: 'Documento Derivado',
        message: `Documento derivado a ${oficina}`,
        data: { documentoId: documento.id, tipo: 'documento_derivado' },
      })
    },

    /**
     * Notificación de expediente actualizado
     */
    expedienteActualizado: (expediente) => {
      addNotification({
        type: 'info',
        title: 'Expediente Actualizado',
        message: `El expediente ${expediente.numero} ha sido actualizado`,
        data: { expedienteId: expediente.id, tipo: 'expediente_actualizado' },
      })
    },

    /**
     * Notificación de vencimiento próximo
     */
    vencimientoProximo: (documento, diasRestantes) => {
      addNotification({
        type: 'warning',
        title: 'Vencimiento Próximo',
        message: `El documento ${documento.numero} vence en ${diasRestantes} días`,
        data: { documentoId: documento.id, tipo: 'vencimiento_proximo' },
      })
    },
  }

  return {
    // Estado
    notifications: computed(() => notifications.value),
    unreadCount: computed(() => unreadCount.value),
    isConnected: computed(() => isConnected.value),
    hasUnreadNotifications,
    getUnreadNotifications,

    // Métodos principales
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    getNotificationsByType,

    // Conexión WebSocket
    connectToNotifications,
    disconnectFromNotifications,

    // Helpers específicos del dominio
    tramiteNotifications,
  }
}
