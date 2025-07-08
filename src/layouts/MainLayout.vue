<template>
  <q-layout view="lHh Lpr lFf">
    <!-- HEADER -->
    <q-header elevated class="bg-secondary" v-if="authStore.isAuthenticated">
      <q-toolbar>
        <q-btn flat @click="drawer = !drawer" round dense icon="menu" />
        <q-toolbar-title>
          <q-btn flat size="lg" to="/">SGD</q-btn>
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
            <!--
            <q-btn
              color="warning"
              text-color="black"
              square
              size="sm"
              icon="edit"
              :to="`/persona/editar/${getMe().persona}/`"
            />
            -->
            <q-btn
              color="negative"
              text-color="black"
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
  </q-layout>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'

const router = useRouter()

const drawer = ref(false)
const menu = ref([
  {
    label: 'Tramites',
    subMenu: [
      { label: 'Crear nuevo documento', route: '/tramite/nuevo' },
      { label: 'Bandeja de entrada', route: '/bandeja/entrada' },
      { label: 'Bandeja de salida', route: '/bandeja/salida' },
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
  return `https://api.dicebear.com/8.x/initials/svg?backgroundColor=26A69A&seed=${
    getMe()?.first_name || 'SGD'
  }`
}

function isAdmin() {
  return authStore.isAdmin || false
}

function getMe() {
  console.log('Usuario:', authStore.user)
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
