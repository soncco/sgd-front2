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
              <q-banner
                v-if="oficinaOptions.showNoOficinaMsg"
                class="q-mt-sm"
                color="negative"
                dense
              >
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
              <div class="row items-center">
                <div class="col">
                  <APISelect
                    v-model="info.destinatarios[index]"
                    label="Destinatario"
                    :url="urlPersonasConOficina"
                    :field="
                      (item) =>
                        `${item.persona.nombre_completo}: ${item.cargo.nombre} de ${item.oficina.nombre}`
                    "
                    :option-value="(item) => item"
                    option-label="nombre_completo"
                    dense
                    :return-object="true"
                    :error-message="errores_texto[`destinatarios.${index}`]"
                    :error="errores[`destinatarios.${index}`]"
                  />
                </div>
                <div class="col-auto">
                  <q-btn
                    dense
                    flat
                    round
                    icon="delete"
                    color="negative"
                    @click="removeDestinatario(index)"
                  />
                </div>
              </div>
            </div>

            <q-btn
              flat
              color="primary"
              icon="add"
              label="Añadir destinatario"
              @click="addDestinatario"
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
import { Notify, Loading } from 'quasar'
import { useRouter } from 'vue-router'
import { api } from 'src/boot/axios'
import { usePersonaStore } from 'src/stores/persona'
import PageTitle from 'src/components/PageTitle.vue'
import APISelect from 'src/components/APISelect.vue'
import SimpleTitle from 'src/components/SimpleTitle.vue'

const router = useRouter()

const personaStore = usePersonaStore()

const titulo = reactive({
  title: 'Nuevo Documento',
  icon: 'description',
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
  archivos: [],
  archivosDescripciones: [],
})

const persona = ref({})

const errores = reactive({})
const errores_texto = reactive({})

const endpoint = '/api/tramite/expedientes/completo/'

const urlPersonasConOficina = '/api/base/personas-con-oficina/'

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
    await personaStore.initialize()
    persona.value = personaStore.persona

    info.remitente = `${persona.value.nombres} ${persona.value.apellidos}`

    const oficinas =
      persona.value.asignaciones_cargo?.map((a) => ({
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
  } catch (error) {
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
function removeDestinatario(index) {
  if (info.destinatarios.length > 1) {
    info.destinatarios.splice(index, 1)
  } else {
    Notify.create({
      type: 'warning',
      message: 'Debe haber al menos un destinatario',
    })
  }
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
  fetchNumeroExpediente()
  fetchPersonaActual()
})

watch(
  () => info.tipo_documento,
  (newTipo) => {
    fetchNumeroDocumento(newTipo?.id || newTipo)
  },
)

const submitForm = async () => {
  Object.keys(errores).forEach((k) => (errores[k] = false))
  Object.keys(errores_texto).forEach((k) => (errores_texto[k] = ''))

  try {
    Loading.show({
      message: 'Guardando documento...',
      spinnerColor: 'white',
    })

    const formData = new FormData()
    formData.append('numero', info.expediente)
    formData.append('estado', 'Abierto')
    formData.append('responsable', persona.value.id)

    formData.append('documento[tipo]', info.tipo_documento?.id || info.tipo_documento || '')
    formData.append('documento[remitente]', persona.value.id)
    formData.append('documento[numero]', info.numero)
    formData.append(
      'documento[asignacion_cargo]',
      persona.value.asignaciones_cargo?.find((a) => a.oficina_nombre === info.oficina)?.id || '',
    )
    formData.append('documento[asunto]', info.asunto)
    formData.append('documento[resumen]', '')
    formData.append('documento[es_informativo]', false)

    info.destinatarios
      .filter((d) => d.persona !== null)
      .forEach((dest, index) => {
        formData.append(`documento[destinos_documento][${index}][destinatario]`, dest.persona.id)
        formData.append(`documento[destinos_documento][${index}][oficina_destino]`, dest.oficina.id)
      })

    info.archivos.forEach((file, index) => {
      formData.append(`documento[archivos][${index}][archivo]`, file)
      formData.append(
        `documento[archivos][${index}][descripcion]`,
        info.archivosDescripciones[index] || '',
      )
    })

    const response = await api.post(endpoint, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    console.log('Documento creado:', response.data)

    Notify.create({
      type: 'positive',
      message: 'Documento creado con éxito',
    })
    router.push('/bandeja/salida')
  } catch (error) {
    if (error.response?.status === 400) {
      console.error('❌ Error 400 - Detalles del backend:', error.response.data)
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
  } finally {
    Loading.hide()
  }
}
</script>
