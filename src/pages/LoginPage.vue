<template>
  <q-page class="flex flex-center">
    <q-card class="q-pa-md" style="width: 400px">
      <q-form @submit="onSubmit">
        <q-input
          v-model="username"
          label="Usuario"
          filled
          class="q-mb-md"
          :error="!!errorMessage"
        />
        <q-input
          v-model="password"
          label="Contraseña"
          filled
          type="password"
          class="q-mb-md"
          :error="!!errorMessage"
          :error-message="errorMessage"
        />
        <q-btn label="Iniciar Sesión" type="submit" color="primary" :loading="loading" />
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'

const username = ref('')
const password = ref('')
const errorMessage = ref('')
const loading = ref(false)
const router = useRouter()
const authStore = useAuthStore()

async function onSubmit() {
  loading.value = true
  errorMessage.value = ''
  try {
    await authStore.login({ username: username.value, password: password.value })
    router.push('/')
  } catch (error) {
    console.log(error)
    errorMessage.value = 'Usuario o contraseña incorrectos'
  } finally {
    loading.value = false
  }
}
</script>
