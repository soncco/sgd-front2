<template>
  <q-page padding>
    <PageTitle :title="titulo.title" :icon="titulo.icon" />

    <div class="q-pa-md">
      <div class="row q-col-gutter-lg">
        <!-- INFORMACIÓN -->
        <div class="col-4 q-gutter-md">
          <SimpleTitle title="Información" />

          <div class="info-field">
            <div class="field-label">Expediente</div>
            <div class="field-value">{{ info.expediente }}</div>
          </div>

          <div class="info-field">
            <div class="field-label">Fecha expediente</div>
            <div class="field-value">{{ info.fecha_expediente }}</div>
          </div>

          <div class="info-field">
            <div class="field-label">Remitente</div>
            <div class="field-value">{{ info.remitente }}</div>
          </div>

          <div class="info-field">
            <div class="field-label">Oficina</div>
            <div class="field-value">{{ info.oficina || 'Sin oficina' }}</div>
          </div>

          <div class="info-field">
            <div class="field-label">Tipo de documento</div>
            <div class="field-value">{{ info.tipo_documento || '' }}</div>
          </div>

          <div class="info-field">
            <div class="field-label">Número</div>
            <div class="field-value">{{ info.numero }}</div>
          </div>

          <div class="info-field">
            <div class="field-label">Fecha documento</div>
            <div class="field-value">{{ info.fecha_documento }}</div>
          </div>
        </div>

        <!-- Documento y destinatarios -->
        <div class="col-8 q-gutter-md">
          <SimpleTitle title="Documento" />
          <div class="info-field">
            <div class="field-label">Asunto</div>
            <div class="field-value text-area">{{ info.asunto }}</div>
          </div>

          <SimpleTitle title="Destinatarios" />
          <div v-for="(dest, index) in info.destinatarios" :key="index">
            <div class="info-field">
              <div class="field-label">Destinatario</div>
              <div class="field-value">{{ formatDestinatario(dest) }}</div>
            </div>
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

<style scoped>
.info-field {
  margin-bottom: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #f8f9fa;
  border-left: 3px solid #2196f3;
}

.field-label {
  font-size: 0.7rem;
  color: #546e7a;
  margin-bottom: 0.25rem;
}

.field-value {
  font-size: 0.875rem;
  color: #37474f;
  line-height: 1.3;
}

.text-area {
  white-space: pre-wrap;
  min-height: 60px;
  background: #fff;
  padding: 0.5rem;
  border-radius: 3px;
  border: 1px solid #e0e0e0;
}

/* Estilos para la sección de archivos */
.q-item {
  border-radius: 4px;
  margin: 0.25rem 0;
  padding: 0.5rem;
  background: #f3f4f6;
}

.q-item:hover {
  background: #e5e7eb;
}

/* Estilos responsive */
@media (max-width: 768px) {
  .info-field {
    margin-bottom: 0.375rem;
    padding: 0.375rem 0.5rem;
  }

  .field-value {
    font-size: 0.8125rem;
  }

  .q-gutter-md > * {
    margin: 4px 0;
  }
}
</style>

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
    //console.log('Documento data:', data)

    // Llenar info con lo que venga del backend
    info.expediente = data.expediente_numero || ''
    info.fecha_expediente = formatFecha(data.expediente_fecha) || ''
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
    //console.log(info)
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
