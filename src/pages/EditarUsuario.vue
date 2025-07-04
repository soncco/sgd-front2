<template>
  <q-page padding>
    <PageTitle :title="titulo.title" :icon="titulo.icon" />
    <div class="q-pa-md">
      <q-form @submit="submitForm" class="q-gutter-md">
        <div class="row q-col-gutter-lg">
          <div class="col-6 q-gutter-md">
            <SimpleTitle title="Editar Usuario" />

            <!-- Username (solo lectura) -->
            <q-input outlined readonly v-model="info.username" label="Usuario" />
            <q-input outlined readonly v-model="info.nombres" label="Nombres" />
            <q-input outlined readonly v-model="info.apellidos" label="Apellidos" />
            <q-input
              outlined
              v-model="info.email"
              label="Correo Electrónico"
              type="email"
              maxlength="255"
              :error-message="errores_texto.email"
              :error="errores.email"
              required
            />
            <q-input
              outlined
              v-model="info.celular"
              label="Celular"
              maxlength="15"
              :error-message="errores_texto.celular"
              :error="errores.celular"
              required
            />
          </div>
        </div>

        <q-btn label="Guardar" type="submit" color="primary" icon="save" />
      </q-form>
    </div>
  </q-page>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { Notify } from 'quasar'
import { api } from 'src/boot/axios'
import PageTitle from 'src/components/PageTitle.vue'
import SimpleTitle from 'src/components/SimpleTitle.vue'

const titulo = reactive({
  title: 'Editar Usuario',
  icon: 'edit',
})

const info = reactive({
  username: '',
  nombres: '',
  apellidos: '',
  email: '',
  celular: '',
})

const errores = reactive({})
const errores_texto = reactive({})

let personaId = null

const fetchData = () => {
  api
    .get('/api/base/me/')
    .then((response) => {
      const userData = response.data
      const persona = userData.persona
      personaId = persona.id

      info.username = userData.username
      info.nombres = persona.nombres
      info.apellidos = persona.apellidos
      info.email = persona.email
      info.celular = persona.celular
    })
    .catch((error) => {
      console.error('Error al obtener datos:', error)
    })
}

const submitForm = async () => {
  if (!personaId) {
    Notify.create({
      type: 'negative',
      message: 'No se pudo identificar al usuario.',
    })
    return
  }

  Object.keys(errores).forEach((k) => (errores[k] = false))
  Object.keys(errores_texto).forEach((k) => (errores_texto[k] = ''))
  try {
    const payload = {
      email: info.email,
      celular: info.celular,
    }
    await api.patch(`/api/base/personas/${personaId}/`, payload)
    Notify.create({
      type: 'positive',
      message: 'Usuario actualizado con éxito',
    })
  } catch (error) {
    if (error.response?.status === 400) {
      const data = error.response.data
      Object.entries(data).forEach(([field, msg]) => {
        errores[field] = true
        errores_texto[field] = Array.isArray(msg) ? msg[0] : msg
      })
    } else {
      console.error('Error al actualizar:', error)
    }
    Notify.create({
      type: 'negative',
      message: 'No se pudo actualizar el usuario',
    })
  }
}

onMounted(fetchData)
</script>
