<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title> Sistema de Trámites </q-toolbar-title>
        <q-btn v-if="authStore.isAuthenticated" flat label="Cerrar Sesión" @click="onLogout" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

function onLogout() {
  authStore.logout()
  router.push('/login')
}
</script>
