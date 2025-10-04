<template>
  <q-layout>
    <q-page-container>
      <q-page class="flex flex-center bg-gradient-amaris">
        <div class="login-container">
          <div class="row q-gutter-lg">
            <!-- Columna izquierda - Información y branding -->
            <div class="col-12 col-md-5">
              <!-- Logo y Título -->
              <div class="text-center q-mb-xl">
                <h4 class="q-my-md text-white">AMARIS</h4>
                <p class="text-white text-opacity-90">Sistema de Gestión Documentaria</p>
                <!-- Información de la entidad -->
                <div v-if="entityInfo" class="entity-info q-mt-md">
                  <p class="text-white text-weight-medium q-mb-none">{{ entityInfo }}</p>
                  <!-- Ejemplo de uso dinámico (comentado para no duplicar info)
                  <p class="text-white text-weight-light q-mb-none text-caption">
                    Dinámico: {{ dynamicEntityInfo }}
                  </p>
                  -->
                </div>
              </div>

              <!-- Espacio reservado para contenido futuro -->
              <div class="future-content-area">
                <!-- Mensaje del sistema si está activo -->
                <div
                  v-if="mensajeActivar.value === 'true' || mensajeActivar.value === true"
                  class="system-message q-mb-md"
                >
                  <q-card class="message-card">
                    <q-card-section class="q-pa-md">
                      <div class="text-center">
                        <q-icon
                          :name="
                            mensajeTipo.value === 'warning'
                              ? 'warning'
                              : mensajeTipo.value === 'error'
                                ? 'error'
                                : 'info'
                          "
                          :color="
                            mensajeTipo.value === 'warning'
                              ? 'warning'
                              : mensajeTipo.value === 'error'
                                ? 'negative'
                                : 'info'
                          "
                          size="2em"
                          class="q-mb-sm"
                        />
                        <div class="text-white text-weight-medium">
                          {{ mensajeTexto.value }}
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </div>

            <!-- Columna derecha - Formulario de login -->
            <div class="col-12 col-md-6 col-md-offset-1">
              <!-- Formulario de Login -->
              <q-card class="login-card">
                <q-card-section class="q-pa-lg">
                  <div class="text-center q-mb-lg">
                    <h5 class="text-grey-8 q-my-sm">Iniciar Sesión</h5>
                    <p class="text-grey-6">Ingrese sus credenciales para acceder</p>
                  </div>

                  <q-form @submit="handleLogin" class="q-gutter-md">
                    <!-- Campo Usuario -->
                    <q-input
                      v-model="loginForm.username"
                      label="Usuario"
                      type="text"
                      outlined
                      dense
                      :error="!!errors.username"
                      :error-message="errors.username"
                      @keyup.enter="handleLogin"
                    >
                      <template v-slot:prepend>
                        <q-icon name="person" color="grey-6" />
                      </template>
                    </q-input>

                    <!-- Campo Contraseña -->
                    <q-input
                      v-model="loginForm.password"
                      label="Contraseña"
                      :type="showPassword ? 'text' : 'password'"
                      outlined
                      dense
                      :error="!!errors.password"
                      :error-message="errors.password"
                      @keyup.enter="handleLogin"
                    >
                      <template v-slot:prepend>
                        <q-icon name="lock" color="grey-6" />
                      </template>
                      <template v-slot:append>
                        <q-icon
                          :name="showPassword ? 'visibility_off' : 'visibility'"
                          class="cursor-pointer"
                          color="grey-6"
                          @click="showPassword = !showPassword"
                        />
                      </template>
                    </q-input>

                    <!-- Recordar sesión -->
                    <div class="row items-center justify-between">
                      <q-checkbox
                        v-model="loginForm.remember"
                        label="Recordar sesión"
                        color="primary"
                        dense
                      />
                      <q-btn
                        flat
                        dense
                        color="primary"
                        label="¿Olvidó su contraseña?"
                        class="text-caption"
                        @click="showForgotPassword"
                      />
                    </div>

                    <!-- Botón de Login -->
                    <div>
                      <q-btn
                        type="submit"
                        color="warning"
                        text-color="black"
                        label="Iniciar Sesión"
                        size="lg"
                        class="full-width q-mt-lg"
                        :loading="loading"
                        :disable="!isFormValid"
                        unelevated
                      >
                        <template v-slot:loading>
                          <q-spinner-hourglass class="on-left" />
                          Verificando...
                        </template>
                      </q-btn>
                    </div>
                  </q-form>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <!-- Footer mejorado con columnas -->
          <div class="footer-container q-mt-lg">
            <div class="row q-gutter-md">
              <!-- Columna 1 - Información institucional -->
              <div class="col-12 col-md-5">
                <div class="institutional-info text-center text-md-left">
                  <div class="text-white text-weight-medium q-mb-xs">
                    <q-icon name="account_balance" class="q-mr-sm" />
                    {{ entityInfo }}
                  </div>
                  <div class="text-white text-opacity-80 text-body2">
                    <q-icon name="computer" class="q-mr-sm" />
                    AMARIS - Sistema de Gestión Documentaria
                  </div>
                </div>
              </div>

              <!-- Columna 2 - Información de soporte -->
              <div class="col-12 col-md-3">
                <div class="support-info text-center">
                  <div class="text-white text-weight-medium text-body2 q-mb-xs">
                    <q-icon name="support_agent" class="q-mr-sm" />
                    Soporte rápido
                  </div>
                  <div class="text-white text-opacity-80 text-caption q-mb-xs">
                    <q-icon name="phone" class="q-mr-xs" />
                    940-413-610 o 984-755-860
                  </div>
                  <div class="text-white text-opacity-80 text-caption">
                    <q-icon name="email" class="q-mr-xs" />
                    soporte@abastecimiento.pe
                  </div>
                </div>
              </div>

              <!-- Columna 3 - Información de desarrollo -->
              <div class="col-12 col-md-3 col-md-offset-1">
                <div class="developer-info text-center text-md-right">
                  <div class="text-white text-opacity-80 text-caption q-mb-xs">
                    <q-icon name="code" class="q-mr-xs" />
                    Hecho por <strong>soncco.com</strong>
                  </div>
                  <div class="text-white text-opacity-70 text-caption">
                    <q-icon name="copyright" class="q-mr-xs" />
                    Braulio A. Soncco Pimentel
                  </div>
                  <div class="text-white text-opacity-70 text-caption">
                    RUC: 10409032597 © 2026
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import { useConfig } from 'src/composables/useConfig'

const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()

// Configuración del sistema (pública, sin token)
const {
  publicEntidad,
  publicTipoEntidad,
  mensajeTipo,
  mensajeTexto,
  mensajeActivar,
  loadPublicEssentialConfig,
  publicLoaded,
} = useConfig()

// Nota: usePublicConfig está disponible para acceso dinámico a configuraciones
// Ver documentación en: src/composables/CONFIG_DOCUMENTATION.md

// Estado reactivo
const loading = ref(false)
const showPassword = ref(false)

// Formulario de login
const loginForm = ref({
  username: '',
  password: '',
  remember: false,
})

// Errores de validación
const errors = ref({
  username: '',
  password: '',
})

// Información de la entidad (computed para reactividad)
const entityInfo = computed(() => {
  if (publicEntidad.value && publicTipoEntidad.value) {
    return `${publicTipoEntidad.value} ${publicEntidad.value}`
  }
  return null
}) // Opciones de años dinámicas basadas en configuración

// Validación del formulario
const isFormValid = computed(() => {
  return loginForm.value.username.trim() !== '' && loginForm.value.password.trim() !== ''
})

// Limpiar errores
function clearErrors() {
  errors.value = {
    username: '',
    password: '',
  }
}

// Validar formulario
function validateForm() {
  clearErrors()
  let isValid = true

  if (!loginForm.value.username.trim()) {
    errors.value.username = 'El usuario es obligatorio'
    isValid = false
  }

  if (!loginForm.value.password.trim()) {
    errors.value.password = 'La contraseña es obligatoria'
    isValid = false
  }

  return isValid
}

// Manejar envío del formulario
async function handleLogin() {
  if (!validateForm()) {
    return
  }

  loading.value = true

  try {
    // Preparar credenciales
    const credentials = {
      username: loginForm.value.username.trim(),
      password: loginForm.value.password.trim(),
    }

    // Intentar login
    await authStore.login(credentials)

    // Guardar preferencias si "recordar sesión" está activado
    if (loginForm.value.remember) {
      localStorage.setItem('remember_user', loginForm.value.username)
    } else {
      localStorage.removeItem('remember_user')
    }

    // Mostrar mensaje de éxito
    $q.notify({
      type: 'positive',
      message: `¡Bienvenido al sistema!`,
      position: 'top',
      timeout: 2000,
    })

    // Redirigir al dashboard
    router.push('/')
  } catch (error) {
    console.error('🖥️ LoginPage: Error de login:', error)
    console.error('🖥️ LoginPage: Error message:', error.message)

    // Usar el mensaje de error del servicio si está disponible
    let errorMessage = error.message || 'Error al iniciar sesión'

    // Fallback para errores de respuesta HTTP (por si el servicio no los captura)
    //if (!error.message && error.response) {
    if (error.response.status === 401) {
      errorMessage = 'Usuario o contraseña incorrectos'
    } else if (error.response.status === 400) {
      errorMessage = 'Datos de acceso inválidos'
    } else if (error.response.status >= 500) {
      errorMessage = 'Error del servidor. Intente más tarde'
    }
    //}

    // Limpiar campos en caso de credenciales incorrectas
    if (errorMessage.includes('Credenciales incorrectas') || errorMessage.includes('incorrectos')) {
      loginForm.value.password = ''
      errors.value.password = 'Verifique su contraseña'
    }

    console.log('🖥️ LoginPage: Mostrando notificación de error:', errorMessage)

    $q.notify({
      type: 'negative',
      message: errorMessage,
      position: 'top',
      timeout: 5000,
    })
  } finally {
    loading.value = false
  }
}

// Mostrar diálogo de recuperación de contraseña
function showForgotPassword() {
  $q.dialog({
    title: 'Recuperar Contraseña',
    message: 'Contacte con el encargado de sistemas para recuperar su contraseña.',
    ok: 'Entendido',
    color: 'primary',
  })
}

// Cargar datos guardados al montar el componente
onMounted(async () => {
  // Cargar configuración pública esencial del sistema (sin token)
  if (!publicLoaded.value) {
    await loadPublicEssentialConfig()
  }

  // Cargar usuario y año recordados
  const rememberedUser = localStorage.getItem('remember_user')

  if (rememberedUser) {
    loginForm.value.username = rememberedUser
    loginForm.value.remember = true
  }

  // Si ya está autenticado, redirigir
  if (authStore.isAuthenticated) {
    router.push('/')
  }
})
</script>

<style scoped>
/* Gradiente de fondo principal */
.bg-gradient-amaris {
  background: linear-gradient(135deg, #17a9da 0%, #1a8bb0 50%, #0b5ea8 100%);
  min-height: 100vh;
}

.login-container {
  width: 100%;
  max-width: 1200px;
  padding: 2rem;
}

/* Área para contenido futuro */
.future-content-area {
  min-height: 200px;
  /* Espacio reservado para expansión futura */
}

/* Mensaje del sistema */
.system-message {
  animation: slideDown 0.6s ease-out;
}

.message-card {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Información de entidad */
.entity-info {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Card de login mejorada */
.login-card {
  border-radius: 16px;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  width: 100%;
}

/* Footer container con columnas */
.footer-container {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  width: 100%;
}

/* Secciones del footer */
.institutional-info,
.support-info,
.developer-info {
  padding: 0.5rem;
}

/* Separadores visuales en desktop */
@media (min-width: 1024px) {
  .support-info {
    border-left: 1px solid rgba(255, 255, 255, 0.2);
    border-right: 1px solid rgba(255, 255, 255, 0.2);
  }
}

/* Opacidad de texto para jerarquía visual */
.text-opacity-90 {
  opacity: 0.9;
}

.text-opacity-80 {
  opacity: 0.8;
}

.text-opacity-70 {
  opacity: 0.7;
}

/* Animaciones suaves */
.login-card {
  animation: slideUp 0.5s ease-out;
}

.footer-container {
  animation: fadeIn 0.7s ease-out;
}

.entity-info {
  animation: fadeIn 0.8s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Estilos responsivos */
@media (max-width: 1023px) {
  .login-container {
    padding: 1rem;
    max-width: 600px;
  }

  .login-card {
    margin-top: 1rem;
  }

  .footer-container {
    margin-top: 1rem;
    padding: 1rem;
  }

  /* En móviles, centrar todo el texto */
  .institutional-info,
  .support-info,
  .developer-info {
    text-align: center !important;
    margin-bottom: 1rem;
  }

  .support-info {
    border: none;
  }
}

@media (max-width: 600px) {
  .login-container {
    padding: 0.5rem;
  }

  .future-content-area {
    min-height: 100px;
  }

  .footer-container {
    padding: 0.75rem;
  }
}

/* Mejoras visuales para inputs */
.q-field--outlined .q-field__control:before {
  border-color: rgba(0, 0, 0, 0.12);
}

.q-field--outlined.q-field--focused .q-field__control:before,
.q-field--outlined.q-field--focused .q-field__control:after {
  border-color: #1976d2;
}

/* Asegurar que los iconos tengan buen espaciado */
.q-icon {
  font-size: 1.1em;
}

/* Mejoras para el botón de login */
.q-btn.full-width {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
