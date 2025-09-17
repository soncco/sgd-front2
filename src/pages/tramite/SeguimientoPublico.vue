<template>
  <q-page padding>
    <PageTitle title="Seguimiento de Expediente" icon="search" />

    <div class="q-pa-md">
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
            <q-select
              v-model="form.tipo_documento_identidad"
              :options="tiposDocOptions"
              label="Tipo de documento"
              outlined
              dense
              emit-value
              map-options
              clearable
            />
          </div>
          <div class="col-6">
            <q-input
              outlined
              v-model="form.numero_documento_identidad"
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

      <!-- Resultados en tabla -->
      <div v-if="expedientes.length" class="q-mt-xl">
        <q-table
          :rows="expedientes"
          :columns="columns"
          row-key="numero"
          flat
          bordered
          :loading="loading"
          no-data-label="No se encontraron expedientes"
        >
          <template v-slot:body-cell-acciones="props">
            <q-td :props="props" class="text-center">
              <q-btn
                size="sm"
                color="primary"
                icon="visibility"
                label="Ver"
                @click="verSeguimiento(props.row)"
              />
            </q-td>
          </template>
        </q-table>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { Notify } from 'quasar'
import { api } from 'src/boot/axios'
import router from 'src/router'
import PageTitle from 'src/components/PageTitle.vue'

// opciones fijas de tipo de documento
const tiposDocOptions = ref([
  { value: '1', label: 'DNI' },
  { value: '2', label: 'RUC' },
  { value: '3', label: 'Carnet de extranjería' },
  { value: '4', label: 'Pasaporte' },
  { value: '5', label: 'Sin documento (Código temporal)' },
  { value: '6', label: 'Permiso temporal del permanencia' },
])

const modoBusqueda = ref('expediente')
const form = reactive({
  expediente: '',
  tipo_documento_identidad: null,
  numero_documento_identidad: '',
})

const expedientes = ref([])
const loading = ref(false)

function formatDate(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString()
  } catch {
    return iso
  }
}

const columns = [
  {
    name: 'numero',
    label: 'Número',
    align: 'left',
    field: 'numero',
    sortable: true,
  },
  {
    name: 'fecha',
    label: 'Fecha de creación',
    align: 'left',
    field: (row) => row.fecha || row.events?.[0]?.ts,
    format: (val) => formatDate(val),
    sortable: true,
  },
  {
    name: 'estado',
    label: 'Estado',
    align: 'left',
    field: (row) =>
      row.estado_display || row.events?.find((ev) => ev.kind === 'estado')?.estado_nombre,
    sortable: true,
  },
  {
    name: 'acciones',
    label: 'Acciones',
    align: 'center',
  },
]

function verSeguimiento(row) {
  router.push(`/expediente/${row.numero}/seguimiento`)
}

async function buscar() {
  try {
    loading.value = true
    expedientes.value = []

    let params = {}
    if (modoBusqueda.value === 'expediente') {
      if (!form.expediente) {
        return Notify.create({ type: 'warning', message: 'Ingrese el número de expediente' })
      }
      params = { numero_expediente: form.expediente }
    } else {
      if (!form.tipo_documento_identidad || !form.numero_documento_identidad) {
        return Notify.create({ type: 'warning', message: 'Ingrese tipo y número de documento' })
      }
      params = {
        tipo_documento_identidad: form.tipo_documento_identidad,
        numero_documento_identidad: form.numero_documento_identidad,
      }
    }

    const res = await api.get('/api/tramite/seguimiento/publico/', { params })

    if (res.data.resultados_encontrados > 0) {
      expedientes.value = res.data.expedientes
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
