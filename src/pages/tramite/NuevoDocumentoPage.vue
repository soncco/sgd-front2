<template>
  <q-page padding>
    <PageTitle :title="titulo.title" :icon="titulo.icon" :buttons="titulo.buttons" />
    <div class="q-pa-md">
      <q-form @submit.prevent="submitForm" class="q-gutter-md">
        <div class="row q-col-gutter-lg">
          <!-- INFORMACION -->
          <div class="col-4 q-gutter-md">
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
              readonly
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

            <!-- Oficina: readonly, vacío con mensaje, o APISelect -->
            <template v-if="oficinaOptions.readonly">
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
              <q-banner v-if="oficinaOptions.showNoOficinaMsg" class="q-mt-sm" color="negative" dense>
                No tiene oficinas asignadas
              </q-banner>
            </template>
            <q-select
              v-else
              outlined
              label="Oficina"
              v-model="info.oficina"
              :options="oficinaOptions.options"
              option-label="label"
              option-value="value"
              :error-message="errores_texto.oficina"
              :error="errores.oficina"
              dense
              clearable
            />

            <!-- Tipo de documento -->
            <APISelect
              v-model="info.tipo_documento"
              label="Tipo de documento"
              url="/api/base/tipos-documento/"
              field="nombre"
              option-value="id"
              option-label="nombre"
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
          <div class="col-8 q-gutter-md">
            <SimpleTitle title="Documento" />
            <q-input
              outlined
              required
              v-model="info.asunto"
              label="Asunto"
              maxlength="255"
              type="textarea"
              autogrow
              :error-message="errores_texto.asunto"
              :error="errores.asunto"
            />
            <SimpleTitle title="Destinatarios" />
            <div v-for="(dest, index) in info.destinatarios" :key="index" class="q-mb-md">
              <APISelect
                v-model="info.destinatarios[index]"
                label="Destinatario"
                url="/api/base/personas/"
                field="nombre_completo"
                option-value="id"
                option-label="nombre_completo"
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
import { reactive, onMounted, watch } from 'vue'
import { Notify } from 'quasar'
import { useRouter } from 'vue-router'
import { api } from 'src/boot/axios'
import PageTitle from 'src/components/PageTitle.vue'
import APISelect from 'src/components/APISelect.vue'
import SimpleTitle from 'src/components/SimpleTitle.vue'

const router = useRouter()

const titulo = reactive({
  title: 'Nuevo Documento',
  icon: 'description',
  buttons: [{ label: 'Ver todos los Documentos', icon: 'list', route: '/documentos' }],
})

const info = reactive({
  expediente: '',
  fecha_expediente: '',
  remitente: '',
  oficina: '',
  tipo_documento: null,
  numero: '',
  fecha_documento: '',
  asunto: '',
  destinatarios: [null],
})

const errores = reactive({})
const errores_texto = reactive({})

const endpoint = '/api/documentos/'

const today = new Date().toISOString().slice(0, 10)
info.fecha_expediente = today
info.fecha_documento = today


const oficinaOptions = reactive({
  readonly: true,
  showNoOficinaMsg: false,
  options: [],
})

async function fetchPersonaActual() {
  try {
    const meRes = await api.get('/api/base/me/')
    const personaId = meRes.data.persona.id
    const res = await api.get(`/api/base/personas/${personaId}/`)
    const persona = res.data

    info.remitente = persona.nombres + ' ' + persona.apellidos

    const oficinas = persona.asignaciones_cargo?.map(a => ({
      label: a.oficina_nombre,
      value: a.oficina,
    })) || []

    if (oficinas.length === 1) {
      info.oficina = oficinas[0].label
      oficinaOptions.readonly = true
      oficinaOptions.showNoOficinaMsg = false
    } else if (oficinas.length === 0) {
      info.oficina = ''
      oficinaOptions.readonly = true
      oficinaOptions.showNoOficinaMsg = true
    } else {
      oficinaOptions.options = oficinas
      oficinaOptions.readonly = false
      oficinaOptions.showNoOficinaMsg = false
    }
  }  catch (error) {
  console.error('Error al obtener persona actual:', error)
  Notify.create({
    type: 'negative',
    message: 'No se pudo obtener los datos de la persona actual',
  })
}

}



function addDestinatario() {
  info.destinatarios.push(null)
}

async function fetchNumeroExpediente() {
  try {
    const res = await api.get('/api/tramite/expedientes/next-number/')
    info.expediente = res.data.next_number
  } catch (error) {
    console.error('Error al obtener número de expediente:', error)
    Notify.create({
      type: 'negative',
      message: 'No se pudo obtener el número de expediente',
    })
  }
}

async function fetchNumeroDocumento(tipo_id) {
  if (!tipo_id) {
    info.numero = ''
    return
  }

  try {
    const res = await api.get('/api/tramite/documentos/next-number/', {
      params: { tipo_id }
    })
    info.numero = res.data.next_number
  } catch (error) {
    console.error('Error al obtener número de documento:', error)
    Notify.create({
      type: 'negative',
      message: 'No se pudo obtener el número de documento',
    })
  }
}

onMounted(() => {
  fetchNumeroExpediente()
  fetchPersonaActual()
})

watch(() => info.tipo_documento, (newTipo) => {
  fetchNumeroDocumento(newTipo?.id || newTipo)
})

const submitForm = async () => {
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
