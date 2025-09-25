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
              readonly
              required
              v-model="info.expediente"
              label="Expediente"
              maxlength="50"
              :error-message="errores_texto.expediente"
              :error="errores.expediente"
            />
            <q-input
              outlined
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
            <q-input
              outlined
              required
              v-model="info.oficina_nombre"
              label="Oficina"
              maxlength="255"
              :error-message="errores_texto.oficina"
              :error="errores.oficina"
              readonly
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
            <SimpleTitle title="Destinatario" />

            <q-input
              outlined
              required
              :model-value="`${info.destinatarios[0]?.persona.nombre_completo} - ${info.destinatarios[0]?.oficina.nombre}`"
              label="Destinatario"
              maxlength="255"
              readonly
            />

            <SimpleTitle title="Archivos" />
            <q-file
              v-model="info.archivos"
              label="Adjuntar archivos"
              multiple
              filled
              class="q-mt-md"
            />
            <div v-for="(f, i) in info.archivos" :key="i" class="q-mt-sm">
              <div class="text-caption">{{ f.name }} ({{ (f.size / 1024).toFixed(1) }} KB)</div>
              <q-input
                dense
                v-model="info.archivosDescripciones[i]"
                label="Descripción (opcional)"
              />
            </div>
          </div>
        </div>
        <q-btn
          label="Guardar"
          type="submit"
          color="primary"
          icon="save"
          class="full-width q-mt-md"
        />
      </q-form>
    </div>
  </q-page>
</template>

<script setup>
import { reactive, onMounted, watch, ref } from 'vue'
import { Notify } from 'quasar'
import { useRouter, useRoute } from 'vue-router'
import { api } from 'src/boot/axios'
import { usePersonaStore } from 'src/stores/persona'
import PageTitle from 'src/components/PageTitle.vue'
import APISelect from 'src/components/APISelect.vue'
import SimpleTitle from 'src/components/SimpleTitle.vue'

const router = useRouter()
const route = useRoute()
const personaStore = usePersonaStore()

const titulo = reactive({
  title: 'Responder Documento',
  icon: 'reply',
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
  destinatarios: [],
  archivos: [],
  archivosDescripciones: [],
})

const persona = ref({})

const errores = reactive({})
const errores_texto = reactive({})

const today = new Date().toISOString().slice(0, 10)
info.fecha_documento = today

// Format for date display
function formatFecha(fecha) {
  if (!fecha) return ''
  const date = new Date(fecha)
  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }) /* +
    ' ' +
    date.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
    })*/
}

// Datos de documento a responder
async function fetchDocumento() {
  try {
    const id = route.params.id
    const res = await api.get(`/api/tramite/documentos/${id}/`)
    const data = res.data
    console.log('Documento data:', data)

    // Documento padre
    info.documento_padre = data.id || null

    // Expediente
    info.expediente_id = data.expediente || ''
    info.expediente = data.expediente_numero || ''
    info.fecha_expediente = formatFecha(data.expediente_fecha) || ''

    // Remitente
    // Corregido aqui: ya esta llenado por el fetchPersonaActual

    // Buscar la oficina que conincide con el id de la persona actual
    const destinoPersona = data.destinos.find((d) => d.destinatario === persona.value.id)

    if (destinoPersona) {
      info.oficina = destinoPersona.oficina_destino
      info.oficina_nombre = destinoPersona.oficina_destino_nombre
    } else {
      info.oficina = null
      info.oficina_nombre = 'desconocido'
    }

    // Destinatario del documento
    info.destinatarios = [
      {
        persona: { id: data.remitente, nombre_completo: data.remitente_nombre },
        oficina: {
          id: data.remitente_oficina,
          nombre: data.remitente_oficina_nombre,
        },
      },
    ]
  } catch (error) {
    console.error('Error al obtener documento:', error)
    Notify.create({
      type: 'negative',
      message: 'No se pudo cargar el documento',
    })
    router.push('/bandeja/salida')
  }
}

async function fetchPersonaActual() {
  try {
    await personaStore.initialize()
    persona.value = personaStore.persona

    info.remitente = `${persona.value.nombres} ${persona.value.apellidos}`
  } catch (error) {
    console.error('Error al obtener persona actual:', error)
    Notify.create({
      type: 'negative',
      message: 'No se pudo obtener los datos de la persona actual',
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
      params: { tipo_id },
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
  console.log('fetchDocumento() iniciado, id:', route.params.id)
  fetchPersonaActual()
  fetchDocumento()
})

watch(
  () => info.tipo_documento,
  (newTipo) => {
    fetchNumeroDocumento(newTipo?.id || newTipo)
  },
)

// ... dentro de <script setup>

const submitForm = async () => {
  // Limpiar errores
  Object.keys(errores).forEach((k) => (errores[k] = false))
  Object.keys(errores_texto).forEach((k) => (errores_texto[k] = ''))

  try {
    const expedienteId = info.expediente_id
    const endpoint = `/api/tramite/expedientes/${expedienteId}/documentos/`

    const asignacion = persona.value.asignaciones_cargo?.find((a) => a.oficina === info.oficina)

    // Preparar payload JSON por si no hay archivos
    const payload = {
      numero: info.numero,
      tipo: info.tipo_documento?.id || '',
      remitente: persona.value.id,
      asignacion_cargo: asignacion ? asignacion.id : 'xd',
      documento_padre: info.documento_padre || '',
      asunto: info.asunto,
      es_informativo: false,
      destinos_documento: info.destinatarios.map((d) => ({
        destinatario: d.persona.id,
        oficina_destino: d.oficina.id,
        es_delegacion: false,
      })),
    }

    // Si hay archivos, usar FormData
    if (info.archivos && info.archivos.length > 0) {
      const formData = new FormData()
      formData.append('numero', info.numero || '')
      formData.append('tipo', info.tipo_documento?.id || '')
      formData.append('remitente', persona.value.id)
      formData.append(
        'asignacion_cargo',
        persona.value.asignaciones_cargo?.find((a) => a.oficina_nombre === info.oficina)?.id || '',
      )
      formData.append('documento_padre', info.documento_padre || '')
      formData.append('asunto', info.asunto)
      formData.append('es_informativo', false)

      // Destinatarios
      info.destinatarios.forEach((dest, index) => {
        formData.append(`destinos_documento[${index}][destinatario]`, dest.persona.id)
        formData.append(`destinos_documento[${index}][oficina_destino]`, dest.oficina.id)
        formData.append(`destinos_documento[${index}][es_delegacion]`, false)
      })

      // Archivos
      info.archivos.forEach((file, index) => {
        formData.append(`documento[archivos][${index}][archivo]`, file)
        formData.append(
          `documento[archivos][${index}][descripcion]`,
          info.archivosDescripciones[index] || '',
        )
      })

      console.log('FormData generado:', Object.fromEntries(formData.entries()))
      await api.post(endpoint, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    } else {
      console.log('Payload JSON:', payload)
      await api.post(endpoint, payload)
    }

    Notify.create({ type: 'positive', message: 'Documento creado con éxito' })
    router.push('/bandeja/salida')
  } catch (error) {
    if (error.response?.status === 400) {
      const data = error.response.data
      Object.entries(data).forEach(([field, msg]) => {
        errores[field] = true
        errores_texto[field] = Array.isArray(msg) ? msg[0] : msg
      })
      console.error('Error 400 del backend:', data)
    } else {
      console.error('Error desconocido:', error)
    }
    Notify.create({ type: 'negative', message: 'Revisa los errores en el formulario' })
  }
}
</script>
