// Composable para validaciones usando Quasar validation

/**
 * Composable para validaciones usando Quasar validation
 * Proporciona reglas de validación comunes y utilidades
 */
export function useValidation() {
  /**
   * Reglas de validación comunes
   */
  const rules = {
    /**
     * Campo requerido
     * @param {string} message - Mensaje personalizado de error
     */
    required:
      (message = 'Este campo es requerido') =>
      (val) =>
        (val !== null && val !== '' && val !== undefined) || message,

    /**
     * Validación de email
     * @param {string} message - Mensaje personalizado de error
     */
    email:
      (message = 'Ingrese un email válido') =>
      (val) =>
        !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || message,

    /**
     * Longitud mínima
     * @param {number} min - Longitud mínima
     * @param {string} message - Mensaje personalizado de error
     */
    minLength:
      (min, message = null) =>
      (val) =>
        !val || val.length >= min || message || `Mínimo ${min} caracteres`,

    /**
     * Longitud máxima
     * @param {number} max - Longitud máxima
     * @param {string} message - Mensaje personalizado de error
     */
    maxLength:
      (max, message = null) =>
      (val) =>
        !val || val.length <= max || message || `Máximo ${max} caracteres`,

    /**
     * Validación de número entero positivo
     * @param {string} message - Mensaje personalizado de error
     */
    positiveInteger:
      (message = 'Debe ser un número entero positivo') =>
      (val) =>
        !val || (Number.isInteger(Number(val)) && Number(val) > 0) || message,

    /**
     * Validación de número
     * @param {string} message - Mensaje personalizado de error
     */
    numeric:
      (message = 'Debe ser un número válido') =>
      (val) =>
        !val || !isNaN(Number(val)) || message,

    /**
     * Validación de DNI peruano
     * @param {string} message - Mensaje personalizado de error
     */
    dni:
      (message = 'DNI debe tener 8 dígitos') =>
      (val) =>
        !val || /^\d{8}$/.test(val) || message,

    /**
     * Validación de RUC peruano
     * @param {string} message - Mensaje personalizado de error
     */
    ruc:
      (message = 'RUC debe tener 11 dígitos') =>
      (val) =>
        !val || /^\d{11}$/.test(val) || message,

    /**
     * Validación de teléfono peruano
     * @param {string} message - Mensaje personalizado de error
     */
    phone:
      (message = 'Número de teléfono inválido') =>
      (val) =>
        !val || /^9\d{8}$/.test(val.replace(/\s/g, '')) || message,

    /**
     * Confirmación de contraseña
     * @param {string} originalPassword - Contraseña original a comparar
     * @param {string} message - Mensaje personalizado de error
     */
    passwordConfirm:
      (originalPassword, message = 'Las contraseñas no coinciden') =>
      (val) =>
        !val || val === originalPassword || message,

    /**
     * Validación de fecha no futura
     * @param {string} message - Mensaje personalizado de error
     */
    notFutureDate:
      (message = 'La fecha no puede ser futura') =>
      (val) => {
        if (!val) return true
        const inputDate = new Date(val)
        const today = new Date()
        today.setHours(23, 59, 59, 999) // Permitir hasta final del día actual
        return inputDate <= today || message
      },

    /**
     * Validación de fecha no pasada
     * @param {string} message - Mensaje personalizado de error
     */
    notPastDate:
      (message = 'La fecha no puede ser pasada') =>
      (val) => {
        if (!val) return true
        const inputDate = new Date(val)
        const today = new Date()
        today.setHours(0, 0, 0, 0) // Permitir desde inicio del día actual
        return inputDate >= today || message
      },

    /**
     * Validación de archivo
     * @param {Array} allowedTypes - Tipos de archivo permitidos (ej: ['pdf', 'doc', 'docx'])
     * @param {number} maxSizeMB - Tamaño máximo en MB
     */
    file:
      (allowedTypes = [], maxSizeMB = 10) =>
      (val) => {
        if (!val) return true

        // Si es un array de archivos, validar cada uno
        const files = Array.isArray(val) ? val : [val]

        for (const file of files) {
          if (file && file.size && file.name) {
            // Validar tamaño
            const sizeMB = file.size / (1024 * 1024)
            if (sizeMB > maxSizeMB) {
              return `El archivo ${file.name} excede el tamaño máximo de ${maxSizeMB}MB`
            }

            // Validar tipo si se especifica
            if (allowedTypes.length > 0) {
              const extension = file.name.split('.').pop().toLowerCase()
              if (!allowedTypes.includes(extension)) {
                return `El archivo ${file.name} no es de un tipo permitido. Tipos permitidos: ${allowedTypes.join(', ')}`
              }
            }
          }
        }

        return true
      },
  }

  /**
   * Combina múltiples reglas en una sola
   * @param {Array} ruleArray - Array de reglas de validación
   */
  const combineRules = (...ruleArray) => {
    return (val) => {
      for (const rule of ruleArray) {
        const result = rule(val)
        if (result !== true) {
          return result
        }
      }
      return true
    }
  }

  /**
   * Crea reglas de validación para un formulario específico
   * @param {Object} formRules - Objeto con las reglas para cada campo
   */
  const createFormRules = (formRules) => {
    const compiledRules = {}

    for (const [fieldName, fieldRules] of Object.entries(formRules)) {
      if (Array.isArray(fieldRules)) {
        compiledRules[fieldName] = fieldRules
      } else {
        compiledRules[fieldName] = [fieldRules]
      }
    }

    return compiledRules
  }

  /**
   * Valida un objeto completo contra un conjunto de reglas
   * @param {Object} data - Datos a validar
   * @param {Object} validationRules - Reglas de validación
   */
  const validateObject = (data, validationRules) => {
    const errors = {}

    for (const [fieldName, rules] of Object.entries(validationRules)) {
      const value = data[fieldName]
      const fieldRules = Array.isArray(rules) ? rules : [rules]

      for (const rule of fieldRules) {
        const result = rule(value)
        if (result !== true) {
          errors[fieldName] = result
          break // Parar en el primer error
        }
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    }
  }

  /**
   * Reglas específicas para el dominio del sistema de trámites
   */

  const tramiteRules = {
    numeroExpediente: combineRules(
      rules.required('Número de expediente es requerido'),
      rules.maxLength(20, 'Máximo 20 caracteres'),
    ),

    numeroDocumento: combineRules(
      rules.required('Número de documento es requerido'),
      rules.maxLength(50, 'Máximo 50 caracteres'),
    ),

    asunto: combineRules(
      rules.required('Asunto es requerido'),
      rules.minLength(5, 'Mínimo 5 caracteres'),
      rules.maxLength(255, 'Máximo 255 caracteres'),
    ),

    documentoIdentidad: (tipo) => {
      if (tipo === '1') {
        // DNI
        return rules.dni()
      } else if (tipo === '6') {
        // RUC
        return rules.ruc()
      }
      return rules.required('Documento de identidad requerido')
    },

    archivosTramite: rules.file(['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'xls', 'xlsx'], 10),
  }

  return {
    rules,
    tramiteRules,
    combineRules,
    createFormRules,
    validateObject,
  }
}
