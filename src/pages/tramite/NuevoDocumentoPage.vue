<template>
  <q-page padding>
    <PageTitle :title="titulo.title" :icon="titulo.icon" :buttons="titulo.buttons" />
    <div class="q-pa-md">
      <q-form @submit.prevent="submitForm" class="q-gutter-md">
        <div class="row q-col-gutter-lg">
          <!-- INFORMACION -->
          <div class="col-6 q-gutter-md">
            <SimpleTitle title="Información" />
            <q-input
              outlined
              required
              v-model="info.expediente"
              label="Expediente"
              maxlength="50"
              :error-message="errores_texto.expediente"
              :error="errores.expediente"
              readonly
            />
            <q-input
              outlined
              type="date"
              required
              v-model="info.fecha_expediente"
              label="Fecha expediente"
              :error-message="errores_texto.fecha_expediente"
              :error="errores.fecha_expediente"
            />
            <q-input
              outlined
              required
              v-model="info.remitente"
              label="Remitente"
              maxlength="255"
              :error-message="errores_texto.remitente"
              :error="errores.remitente"
              readonly
            />
            <q-input
              outlined
              required
              v-model="info.oficina"
              label="Oficina"
              maxlength="255"
              :error-message="errores_texto.oficina"
              :error="errores.oficina"
              readonly
            />
            <APISelect
              v-model="info.tipo_documento"
              label="Tipo de documento"
              url="/api/tipos-documento/"
              field="nombre"
              dense
              :error-message="errores_texto.tipo_documento"
              :error="errores.tipo_documento"
            />
            <q-input
              outlined
              required
              v-model="info.numero"
              label="Número"
              maxlength="50"
              :error-message="errores_texto.numero"
              :error="errores.numero"
              readonly
            />
            <q-input
              outlined
              type="date"
              required
              v-model="info.fecha_documento"
              label="Fecha documento"
              :error-message="errores_texto.fecha_documento"
              :error="errores.fecha_documento"
              readonly
            />
          </div>

          <!-- Documento y destinatarios -->
          <div class="col-6 q-gutter-md">
            <SimpleTitle title="Documento" />
            <q-input
              outlined
              required
              v-model="info.asunto"
              label="Asunto"
              maxlength="255"
              :error-message="errores_texto.asunto"
              :error="errores.asunto"
            />
            <SimpleTitle title="Destinatarios" />
            <div v-for="(dest, index) in info.destinatarios" :key="index" class="q-mb-md">
              <APISelect
                v-model="info.destinatarios[index]"
                label="Destinatario"
                url="/api/destinatarios/"
                field="nombre"
                dense
                :error-message="errores_texto[`destinatarios.${index}`]"
                :error="errores[`destinatarios.${index}`]"
              />
            </div>
            <q-btn
              flat
              color="primary"
              icon="add"
              label="Añadir destinatario"
              @click="addDestinatario"
            />
          </div>
        </div>
        <q-btn label="Guardar" type="submit" color="primary" icon="save" class="full-width q-mt-md" />
      </q-form>
    </div>
  </q-page>
</template>

<script setup>
import { reactive } from 'vue'
import { Notify } from 'quasar'
import { useRouter } from 'vue-router'
import { api } from 'src/boot/axios'
import PageTitle from 'src/components/PageTitle.vue'
import APISelect from 'src/components/APISelect.vue'
import SimpleTitle from 'src/components/SimpleTitle.vue'

const router = useRouter()

// Título de la página
const titulo = reactive({
  title: 'Nuevo Documento',
  icon: 'description',
  buttons: [{ label: 'Ver todos los Documentos', icon: 'list', route: '/documentos' }],
})

// Datos del formulario
const info = reactive({
  expediente: '',
  fecha_expediente: '',
  remitente: '',
  oficina: '',
  tipo_documento: null,
  numero: '',
  fecha_documento: '',
  asunto: '',
  destinatarios: [null], // Soporta múltiples destinatarios
})

// Fecha actual
const today = new Date().toISOString().slice(0, 10)
info.fecha_expediente = today
info.fecha_documento = today

// Errores del formulario
const errores = reactive({})
const errores_texto = reactive({})

// Endpoint para crear documento  
const endpoint = '/api/documentos/'

function addDestinatario() {
  info.destinatarios.push(null)
}

// Enviar formulario
const submitForm = async () => {
  // Limpiar errores previos
  Object.keys(errores).forEach((k) => (errores[k] = false))
  Object.keys(errores_texto).forEach((k) => (errores_texto[k] = ''))

  try {
    const payload = { ...info }
    await api.post(endpoint, payload)

    Notify.create({
      type: 'positive',
      message: 'Documento creado con éxito',
    })

    router.push('/documentos')
  } catch (error) {
    if (error.response?.status === 400) {
      const data = error.response.data
      Object.entries(data).forEach(([field, msg]) => {
        errores[field] = true
        errores_texto[field] = Array.isArray(msg) ? msg[0] : msg
      })
    } else {
      console.error('Error desconocido:', error)
    }
    Notify.create({
      type: 'negative',
      message: 'Revisa los errores en el formulario',
    })
  }
}
</script>
