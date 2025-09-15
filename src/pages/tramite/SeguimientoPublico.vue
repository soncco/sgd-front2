<template>
  <q-page padding>
    <PageTitle title="Seguimiento de Expediente" icon="search" />

    <div class="q-pa-md">
      <!-- Formulario de búsqueda -->
      <q-form @submit.prevent="buscar" class="q-gutter-md">
        <q-option-group
          v-model="modoBusqueda"
          :options="[
            { label: 'Por número de expediente', value: 'expediente' },
            { label: 'Por documento', value: 'documento' },
          ]"
          type="radio"
          inline
        />

        <q-input
          v-if="modoBusqueda === 'expediente'"
          outlined
          v-model="form.expediente"
          label="Número de expediente"
          maxlength="50"
          clearable
        />

        <div v-else class="row q-col-gutter-md">
          <div class="col-6">
            <APISelect
              v-model="form.tipo_documento"
              label="Tipo de documento"
              url="/api/base/tipos-documento-publicos/"
              field="nombre"
              option-value="id"
              option-label="nombre"
              dense
              clearable
            />
          </div>
          <div class="col-6">
            <q-input
              outlined
              v-model="form.numero_documento"
              label="Número de documento"
              maxlength="50"
              clearable
            />
          </div>
        </div>

        <q-btn
          label="Buscar"
          type="submit"
          color="primary"
          icon="search"
          class="q-mt-md"
          :loading="loading"
        />
      </q-form>

      <!-- Resultado básico -->
      <div v-if="expediente" class="q-mt-xl">
        <q-card flat bordered class="q-pa-md">
          <div class="text-h6 q-mb-md">Resultado del Seguimiento</div>
          <q-separator />

          <div class="q-mt-md">
            <div><b>Expediente:</b> {{ expediente.numero }}</div>
            <div><b>Fecha:</b> {{ formatDate(expediente.fecha) }}</div>
            <div><b>Estado:</b> {{ expediente.estado_display }}</div>
            <div>
              <b>Último estado:</b> {{ expediente.ultimo_estado?.estado }} ({{
                formatDate(expediente.ultimo_estado?.fecha)
              }})
            </div>
          </div>
        </q-card>
      </div>

      <!-- Timeline -->
      <div v-if="events.length" class="q-mt-lg">
        <q-card flat bordered>
          <q-card-section>
            <q-timeline color="primary">
              <q-timeline-entry
                v-for="(ev, idx) in events"
                :key="idx"
                :title="ev.label"
                :subtitle="formatDate(ev.ts)"
                :icon="iconFor(ev.kind)"
              >
                <div class="text-caption">
                  <div v-if="ev.doc_numero" class="row items-center no-wrap">
                    <div><b>Documento:</b> {{ ev.doc_tipo }} {{ ev.doc_numero }}</div>
                  </div>
                  <div v-if="ev.doc_asunto"><b>Asunto:</b> {{ ev.doc_asunto }}</div>
                  <div v-if="ev.estado"><b>Estado:</b> {{ ev.estado }}</div>
                </div>
              </q-timeline-entry>
            </q-timeline>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { Notify } from 'quasar'
import { api } from 'src/boot/axios'
import PageTitle from 'src/components/PageTitle.vue'
import APISelect from 'src/components/APISelect.vue'

const modoBusqueda = ref('expediente')
const form = reactive({
  expediente: '',
  tipo_documento: null,
  numero_documento: '',
})

const expediente = ref(null)
const events = ref([])
const loading = ref(false)

function formatDate(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}
function iconFor(kind) {
  if (kind === 'movimiento') return 'swap_horiz'
  if (kind === 'destino') return 'send'
  if (kind === 'estado') return 'flag'
  return 'event'
}

async function buscar() {
  try {
    loading.value = true
    expediente.value = null
    events.value = []

    let params = {}
    if (modoBusqueda.value === 'expediente') {
      if (!form.expediente) {
        return Notify.create({ type: 'warning', message: 'Ingrese el número de expediente' })
      }
      params = { numero_expediente: form.expediente }
    } else {
      if (!form.tipo_documento || !form.numero_documento) {
        return Notify.create({ type: 'warning', message: 'Ingrese tipo y número de documento' })
      }
      params = {
        tipo_documento: form.tipo_documento.id || form.tipo_documento,
        numero_documento: form.numero_documento,
      }
    }

    // 👇 Llamada al endpoint de búsqueda pública
    const res = await api.get('/api/tramite/seguimiento/publico/', { params })

    if (res.data.resultados_encontrados > 0) {
      expediente.value = res.data.expedientes[0]

      // Construir eventos básicos desde JSON
      events.value = [
        {
          label: 'Expediente creado',
          ts: expediente.value.fecha,
          kind: 'estado',
          estado: expediente.value.estado_display,
        },
        ...(expediente.value.documentos || []).map((doc) => ({
          label: 'Documento asociado',
          ts: doc.fecha,
          kind: 'documento',
          doc_numero: doc.numero,
          doc_tipo: doc.tipo,
          doc_asunto: doc.asunto,
        })),
        {
          label: 'Última actualización',
          ts: expediente.value.ultimo_estado?.fecha,
          kind: 'estado',
          estado: expediente.value.ultimo_estado?.estado,
        },
      ]
    } else {
      Notify.create({ type: 'negative', message: 'No se encontró información del expediente' })
    }
  } catch (err) {
    console.error('Error en búsqueda:', err)
    Notify.create({ type: 'negative', message: 'Error en la búsqueda del expediente' })
  } finally {
    loading.value = false
  }
}
</script>
