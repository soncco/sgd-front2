<template>
  <q-page padding>
    <PageTitle
      title="Editar Oficina"
      icon="edit"
      :buttons="[
        {
          label: 'Ver todas las oficinas',
          route: '/oficinas',
          icon: 'list',
        },
      ]"
    />
    <div class="q-pa-md">
      <q-form @submit="submitForm" class="q-gutter-md">
        <div class="row q-col-gutter-lg">
          <div class="col-12 q-gutter-md">
            <q-input
              outlined
              v-model="info.nombre"
              label="Nombre"
              maxlength="150"
              :error-message="errores_texto.nombre"
              :error="errores.nombre"
              type="text"
            />
            <q-input
              outlined
              v-model="info.abreviatura"
              label="Abreviatura"
              maxlength="255"
              :error-message="errores_texto.abreviatura"
              :error="errores.abreviatura"
              type="text"
            />
            <APISelect
              v-model="info.depende_de"
              field="nombre"
              label="Depende de"
              url="/api/base/oficinas/"
              :error-message="errores_texto.depende_de"
              :error="errores.depende_de"
              :defaultIds="[info.depende_de]"
            />
            <q-btn type="submit" label="Guardar" color="primary" icon="save" />
          </div>
        </div>
      </q-form>
    </div>
  </q-page>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from 'src/boot/axios'
import PageTitle from 'src/components/PageTitle.vue'
import APISelect from 'src/components/APISelect.vue'
import { useQuasar } from 'quasar'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()

const id = route.params.id

const info = reactive({
  nombre: '',
  abreviatura: '',
})

const errores = reactive({})
const errores_texto = reactive({})

const fetchData = () => {
  $q.loading.show({ message: 'Cargando informacion...' })
  const url = `api/base/oficinas/${id}/`
  api
    .get(url, info)
    .then((response) => {
      Object.assign(info, response.data)
      console.log(info)
      $q.loading.hide()
    })
    .catch((error) => {
      console.log(error)
      $q.notify({
        type: 'negative',
        message: 'No se pudo conectar al servidor, por favor intente nuevamente en unos minutos.',
      })
      $q.loading.hide()
    })
}

const saveData = () => {
  const url = `api/base/oficinas/${id}/`
  const postObj = {
    ...info,
    depende_de: info.depende_de ? info.depende_de.value.id : null,
    depende_de_nombre: info.depende_de ? info.depende_de.value.nombre : null,
  }
  console.log(postObj)
  api
    .patch(url, postObj)
    .then(() => {
      const toPath = route.query.to || '/oficinas'
      $q.notify({
        type: 'info',
        message: 'Oficina actualizada correctamente.',
      })
      $q.loading.hide()
      router.push(toPath)
    })
    .catch((error) => {
      if (error?.response?.status === 400) {
        console.log(error.response.data)
        for (const campo in error.response.data) {
          errores[campo] = true
          errores_texto[campo] = error.response.data[campo][0]
        }
        for (const campo in errores) {
          if (!(campo in error.response.data)) {
            errores[campo] = false
          }
        }
      } else {
        $q.notify({
          type: 'negative',
          message: 'No se pudo conectar al servidor, por favor intente nuevamente en unos minutos.',
        })
      }
      $q.loading.hide()
    })
}

const submitForm = (e) => {
  if (e && e.preventDefault) e.preventDefault()
  $q.loading.show({ message: 'Enviando informacion...' })
  saveData()
}

onMounted(fetchData)
</script>
