<template>
  <q-page class="q-pa-md">
    <h1>Bienvenido, {{ authStore.user.username || 'Usuario' }}</h1>
    <p v-if="authStore.isAdmin">Eres administrador</p>
  </q-page>
</template>

<script setup>
import { useAuthStore } from 'src/stores/auth'

const authStore = useAuthStore()
console.log(authStore)
</script>
