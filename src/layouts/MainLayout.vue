<template>
  <q-layout view="lHh Lpr fff">
    <!-- HEADER -->
    <q-header elevated class="bg-amaris" v-if="authStore.isAuthenticated">
      <q-toolbar>
        <q-btn flat @click="drawer = !drawer" round dense icon="menu" />
        <q-toolbar-title>
          <q-btn flat size="lg" to="/">AMARIS</q-btn>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <!-- DRAWER (solo si autenticado) -->
    <q-drawer v-model="drawer" :width="300" bordered v-if="authStore.isAuthenticated" show-if-above>
      <q-img
        class="absolute-top"
        src="https://cdn.quasar.dev/img/material.png"
        style="height: 150px"
      >
        <div class="absolute-bottom bg-transparent row inline justify-between items-end">
          <div>
            <q-avatar size="56px" class="q-mb-sm">
              <img :src="avatar()" />
            </q-avatar>
            <div class="text-weight-bold" v-if="me">
              <p class="q-ma-none">{{ me.first_name }}</p>
              <p class="q-ma-none">@{{ me.username }}</p>
            </div>
          </div>

          <div class="column">
            <q-btn
              color="indigo-7"
              text-color="white"
              square
              size="sm"
              icon="logout"
              class="q-mt-md"
            >
              <q-menu transition-show="jump-down" transition-hide="jump-up">
                <q-list style="min-width: 180px">
                  <q-item clickable v-ripple @click="goToEditProfile">
                    <q-item-section avatar>
                      <q-icon name="edit" />
                    </q-item-section>
                    <q-item-section>Editar Usuario</q-item-section>
                  </q-item>
                  <q-item clickable v-ripple @click="goToChangePassword">
                    <q-item-section avatar>
                      <q-icon name="lock" />
                    </q-item-section>
                    <q-item-section>Cambiar Contraseña</q-item-section>
                  </q-item>
                  <q-item clickable v-ripple @click="onLogout">
                    <q-item-section avatar>
                      <q-icon name="logout" />
                    </q-item-section>
                    <q-item-section>Cerrar Sesión</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>
        </div>
      </q-img>

      <q-scroll-area style="height: calc(100% - 150px); margin-top: 150px">
        <q-list dense>
          <!-- Menú colapsable "Documentos" -->
          <q-expansion-item
            v-for="(item, index) in filteredMenu"
            :key="index"
            :label="item.label"
            dense
          >
            <q-item-section>
              <q-list dense>
                <q-item
                  v-for="(subItem, subIndex) in item.subMenu"
                  :key="subIndex"
                  clickable
                  :to="subItem.route"
                >
                  <q-item-section>
                    <q-item-label class="q-pl-sm">{{ subItem.label }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-item-section>
          </q-expansion-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <!-- CONTENIDO -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer class="bg-grey-8 text-white">
      <div class="footer-container">
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
              <div class="text-white text-opacity-70 text-caption">RUC: 10409032597 © 2026</div>
            </div>
          </div>
        </div>
      </div>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'
import { useConfig } from 'src/composables/useConfig'

const router = useRouter()

const { entidad, tipo_entidad, loadEssentialConfig, loaded } = useConfig()

// Cargar configuración esencial al montar el componente
onMounted(async () => {
  if (!loaded.value) {
    await loadEssentialConfig()
  }
})

// Información de la entidad (computed para reactividad)
const entityInfo = computed(() => {
  if (entidad.value && tipo_entidad.value) {
    return `${tipo_entidad.value} ${entidad.value}`
  }
  return 'Entidad'
})

const drawer = ref(false)
const menu = ref([
  {
    label: 'Tramites',
    subMenu: [
      { label: 'Crear nuevo documento', route: '/tramite/nuevo' },
      { label: 'Bandeja de entrada', route: '/bandeja/entrada' },
      { label: 'Bandeja de salida', route: '/bandeja/salida' },
      { label: 'Expedientes', route: '/expedientes' },
    ],
  },
  {
    label: 'Sistema',
    subMenu: [
      { label: 'Oficinas', route: '/oficinas' },
      { label: 'Tipos de documento', route: '/tipos-documento' },
      { label: 'Acciones', route: '/acciones' },
      { label: 'Cargos', route: '/cargos' },
      { label: 'Personas', route: '/personas' },
      { label: 'Opciones del sistema', route: '/opciones' },
    ],
  },
])

const authStore = useAuthStore()
const me = computed(() => authStore.user)

watch(
  () => authStore.isAuthenticated,
  (newVal) => {
    if (newVal) {
      drawer.value = true
    }
  },
)

const goToEditProfile = () => {
  router.push(`/editarusuario`)
}

const goToChangePassword = () => {
  router.push('/editarcontrasena')
}

const onLogout = () => {
  authStore.logout()
  router.push('/login')
}

function avatar() {
  return `https://api.dicebear.com/8.x/initials/svg?backgroundColor=0b5ea8&seed=${
    getMe()?.first_name || 'SGD'
  }`
}

function isAdmin() {
  return authStore.isAdmin || false
}

function getMe() {
  return authStore.user
}

const filteredMenu = computed(() => {
  return menu.value.filter((item) => {
    if (item.label === 'Sistema') {
      return isAdmin()
    }
    return true
  })
})
</script>

<style scoped>
/* Footer container */
.footer-container {
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.1);
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

/* Estilos responsivos */
@media (max-width: 1023px) {
  .footer-container {
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
  .footer-container {
    padding: 0.75rem;
  }
}

/* Asegurar que los iconos tengan buen espaciado */
.q-icon {
  font-size: 1.1em;
}
</style>
