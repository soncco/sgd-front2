<template>
  <ListPage :titulo="titulo" :table="table" />
</template>

<script setup>
import { ref, computed } from 'vue'
import ListPage from 'src/components/ListPage.vue'

const titulo = {
  title: 'Bandeja de Salida',
  icon: 'send',
}

// Acciones múltiples por fila (solo Ver en este caso)
const multiActions = ref([
  {
    label: 'Ver',
    icon: 'visibility',
    action: (row) => {
      console.log('Ver acción ejecutada', row.id)
      // can use router.push
    },
  },
])

// Columnas de la tabla (se eliminaron oficina_destino y destinatario)
const columns = [
  {
    name: 'expediente',
    label: 'Expediente',
    align: 'left',
    field: 'expediente',
    sortable: true,
  },
  {
    name: 'numero_documento',
    label: 'Documento',
    align: 'left',
    field: 'numero',
    sortable: true,
  },
  {
    name: 'fecha',
    label: 'Fecha',
    align: 'left',
    field: 'fecha',
    format: (val) => new Date(val).toLocaleDateString(),
    sortable: true,
  },
  {
    name: 'tipo_documento',
    label: 'Tipo de documento',
    align: 'left',
    field: (row) => row.tipo_documento,
    sortable: true,
  },
  {
    name: 'multiactions',
    label: 'Acciones',
    align: 'center',
  },
]

// Filtros (no cambiamos, aunque podrías también quitar los de oficina y destinatario si ya no son útiles)
const filters = [
  {
    label: 'Buscar',
    type: 'text',
    field: 'term',
  },
  {
    label: 'Tipo de documento',
    type: 'api-select',
    field: 'tipo',
    endpoint: '/api/base/tipos-documento/',
    endpointName: 'nombre',
  },
  {
    label: 'Fecha',
    type: 'date-range',
    field: 'fecha',
  },
]

// Tabla computada con las columnas, filtros y acciones
const table = computed(() => ({
  endpoint: '/api/tramite/bandeja-salida/',
  columns,
  filters,
  multiActions: multiActions.value,
}))
</script>
