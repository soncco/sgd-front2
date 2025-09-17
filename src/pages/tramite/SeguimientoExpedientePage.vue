<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h6">Seguimiento del expediente {{ numero }}</div>
        <div class="text-caption text-grey-7" v-if="expediente?.numero">
          N° {{ expediente.numero }}
        </div>
      </div>
      <div class="col-auto">
        <q-btn dense flat icon="refresh" :loading="loading" @click="fetchData" />
      </div>
    </div>

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
              <div v-if="ev.doc_id" class="row items-center no-wrap">
                <div><b>Documento:</b> {{ ev.doc_tipo }} {{ ev.doc_numero }}</div>
                <q-btn
                  dense
                  flat
                  round
                  size="sm"
                  icon="visibility"
                  class="q-ml-sm"
                  @click="goToDocumento(ev.doc_id)"
                />
              </div>

              <div v-if="ev.doc_asunto"><b>Asunto:</b> {{ ev.doc_asunto }}</div>
              <div v-if="ev.destino_id"><b>Destino:</b> {{ ev.destino_oficina }}</div>
              <div v-if="ev.estado"><b>Estado:</b> {{ ev.estado_nombre }}</div>
            </div>
          </q-timeline-entry>
        </q-timeline>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from 'boot/axios'

const route = useRoute()
const router = useRouter()
const id = computed(() => route.params.id)

const loading = ref(false)
const expediente = ref(null)
const events = ref([])

function formatDate(iso) {
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

async function fetchData() {
  loading.value = true
  try {
    const { data } = await api.get(`/api/tramite/expedientes/${id.value}/seguimiento/`)
    expediente.value = data.expediente
    events.value = (data.events || []).slice().sort((a, b) => a.ts.localeCompare(b.ts))
  } finally {
    loading.value = false
  }
}

function goToDocumento(id) {
  router.push(`/documento/${id}`)
}

onMounted(fetchData)
</script>
