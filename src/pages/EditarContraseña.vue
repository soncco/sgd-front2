<template>
  <q-page padding>
    <PageTitle title="Cambiar Contraseña" icon="lock" />
    <div class="q-pa-md">
      <q-form @submit="submitForm" class="q-gutter-md">
        <q-input
          outlined
          v-model="form.old_password"
          label="Contraseña Actual"
          type="password"
          :error="errores.old_password"
          :error-message="errores_texto.old_password"
          required
        />
        <q-input
          outlined
          v-model="form.new_password"
          label="Nueva Contraseña"
          type="password"
          :error="errores.new_password"
          :error-message="errores_texto.new_password"
          required
        />
        <q-input
          outlined
          v-model="form.confirm_password"
          label="Confirmar Nueva Contraseña"
          type="password"
          :error="errores.confirm_password"
          :error-message="errores_texto.confirm_password"
          required
        />

        <q-btn label="Cambiar Contraseña" type="submit" color="primary" icon="save" />
      </q-form>
    </div>
  </q-page>
</template>

<script setup>
import { reactive } from 'vue'
import { Notify } from 'quasar'
import { api } from 'src/boot/axios'
import PageTitle from 'src/components/PageTitle.vue'

const form = reactive({
  old_password: '',
  new_password: '',
  confirm_password: '',
})

const errores = reactive({
  old_password: false,
  new_password: false,
  confirm_password: false,
})
const errores_texto = reactive({
  old_password: '',
  new_password: '',
  confirm_password: '',
})

const submitForm = async () => {
  // Limpia errores previos
  Object.keys(errores).forEach((k) => (errores[k] = false))
  Object.keys(errores_texto).forEach((k) => (errores_texto[k] = ''))

  // Validación: nueva contraseña debe coincidir
  if (form.new_password !== form.confirm_password) {
    errores.confirm_password = true
    errores_texto.confirm_password = 'Las contraseñas no coinciden.'
    Notify.create({
      type: 'negative',
      message: 'Las contraseñas nuevas no coinciden.',
    })
    return
  }

  try {
    const payload = {
      old_password: form.old_password,
      new_password: form.new_password,
    }
    await api.post('http://localhost:8000/api/base/password/', payload)
    Notify.create({
      type: 'positive',
      message: 'Contraseña actualizada con éxito.',
    })
    // Limpiar formulario
    form.old_password = ''
    form.new_password = ''
    form.confirm_password = ''
  } catch (error) {
    if (error.response?.status === 400) {
      const data = error.response.data
      Object.entries(data).forEach(([field, msg]) => {
        errores[field] = true
        errores_texto[field] = Array.isArray(msg) ? msg[0] : msg
      })
    } else {
      console.error('Error al cambiar contraseña:', error)
    }
    Notify.create({
      type: 'negative',
      message: 'No se pudo actualizar la contraseña.',
    })
  }
}
</script>
