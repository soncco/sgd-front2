<template>
  <q-page padding>
    <PageTitle :title="titulo.title" :icon="titulo.icon" />

    <div class="q-pa-md">
      <div class="row q-col-gutter-lg">
        <!-- INFORMACIÓN -->
        <div class="col-4 q-gutter-md">
          <SimpleTitle title="Información" />

          <q-input outlined readonly :model-value="info.expediente" label="Expediente" />
          <q-input
            outlined
            readonly
            :model-value="info.fecha_expediente"
            label="Fecha expediente"
          />
          <q-input outlined readonly :model-value="info.remitente" label="Remitente" />

          <!-- Oficina -->
          <q-input outlined readonly :model-value="info.oficina || 'Sin oficina'" label="Oficina" />

          <!-- Tipo de documento -->
          <q-input
            outlined
            readonly
            :model-value="info.tipo_documento || ''"
            label="Tipo de documento"
          />

          <q-input outlined readonly :model-value="info.numero" label="Número" />
          <q-input outlined readonly :model-value="info.fecha_documento" label="Fecha documento" />
        </div>

        <!-- Documento y destinatarios -->
        <div class="col-8 q-gutter-md">
          <SimpleTitle title="Documento" />
          <q-input
            outlined
            type="textarea"
            autogrow
            readonly
            :model-value="info.asunto"
            label="Asunto"
          />

          <SimpleTitle title="Destinatarios" />
          <div v-for="(dest, index) in info.destinatarios" :key="index">
            <q-input
              outlined
              readonly
              :model-value="formatDestinatario(dest)"
              label="Destinatario"
            />
          </div>

          <SimpleTitle title="Archivos" />
          <div v-if="info.archivos.length">
            <div v-for="arch in info.archivos" :key="arch.id" class="q-mb-sm">
              <q-item clickable tag="a" :href="arch.url" target="_blank">
                <q-item-section>
                  <q-item-label>{{ arch.descripcion }}</q-item-label>
                  <q-item-label caption>{{ arch.url }}</q-item-label>
                </q-item-section>
              </q-item>
            </div>
          </div>
          <div v-else>
            <q-item-label caption>No hay archivos adjuntos</q-item-label>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { Notify } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import { api } from 'src/boot/axios'
import PageTitle from 'src/components/PageTitle.vue'
import SimpleTitle from 'src/components/SimpleTitle.vue'

const router = useRouter()
const route = useRoute()

const titulo = reactive({
  title: 'Ver Documento',
  icon: 'description',
  buttons: [{ label: 'Volver', icon: 'arrow_back', route: '/bandeja/salida' }],
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

function formatDestinatario(dest) {
  if (dest?.persona) {
    const persona = dest.persona.nombre_completo || 'Sin nombre'
    const estado = dest.estado?.nombre || 'Sin estado'
    const oficina = dest.oficina?.nombre || 'Sin oficina'
    return `${persona}, Oficina: ${oficina}, Estado: ${estado}`
  }
  return ''
}

function formatFecha(fecha) {
  if (!fecha) return ''
  const date = new Date(fecha)
  return (
    date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }) +
    ' ' +
    date.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
    })
  )
}

async function fetchDocumento() {
  try {
    const id = route.params.id
    const res = await api.get(`/api/tramite/documentos/${id}/`)
    const data = res.data
    console.log('Documento data:', data)

    // Llenar info con lo que venga del backend
    info.expediente = data.expediente_numero || ''
    info.fecha_expediente = formatFecha(data.fecha) || ''
    info.remitente = data.remitente_nombre || ''
    info.oficina = data.remitente_oficina || ''
    info.tipo_documento = data.tipo_nombre // puedes poner objeto o solo id
    info.numero = data.numero
    info.fecha_documento = formatFecha(data.fecha)
    info.asunto = data.asunto

    // Destinatarios
    info.destinatarios =
      data.destinos?.map((dest) => {
        const ultimoEstado = dest.estados?.[dest.estados.length - 1] || null
        return {
          persona: { id: dest.destinatario, nombre_completo: dest.destinatario_nombre },
          estado: {
            id: ultimoEstado?.id || null,
            nombre: ultimoEstado?.estado_display || 'Sin estado',
          },
          oficina: { id: dest.oficina_destino, nombre: dest.oficina_destino_nombre },
        }
      }) || []

    // Archivos
    info.archivos =
      data.archivos?.map((arch) => ({
        id: arch.id,
        url: arch.archivo, // el link real
        descripcion: arch.descripcion || 'Sin descripción',
      })) || []
    info.archivosDescripciones = data.archivos?.map((a) => a.descripcion) || []
    console.log(info)
  } catch (error) {
    console.error('Error al obtener documento:', error)
    Notify.create({
      type: 'negative',
      message: 'No se pudo cargar el documento',
    })
    router.push('/bandeja/salida')
  }
}

onMounted(() => {
  fetchDocumento()
})
</script>
