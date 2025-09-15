<template>
  <ListPage :titulo="titulo" :table="table" />
</template>

<script setup>
import { ref, computed } from 'vue'
import ListPage from 'src/components/ListPage.vue'
import router from 'src/router'

const titulo = {
  title: 'Expedientes',
  icon: 'folder',
}

// Acciones múltiples por fila (solo Ver en este caso)
const multiActions = ref([
  {
    label: 'Ver seguimiento',
    icon: 'visibility',
    action: (row) => {
      router.push(`/expediente/${row.id}/seguimiento`)
      // console.log('Ver acción ejecutada', row.id)
      // can use router.push
    },
  },
])

// Columnas de la tabla
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
    field: 'fecha',
    format: (val) => new Date(val).toLocaleDateString(),
    sortable: true,
  },
  {
    name: 'responsable',
    label: 'Responsable',
    align: 'left',
    field: 'responsable_nombre',
    sortable: true,
  },
  {
    name: 'estado',
    label: 'Estado',
    align: 'left',
    field: 'estado_display',
    sortable: true,
  },
  {
    name: 'multiactions',
    label: 'Acciones',
    align: 'center',
  },
]

const filters = [
  {
    label: 'Estado',
    type: 'select',
    field: 'estado',
    options: [
      { label: 'Todos', value: '' },
      { label: 'Abierto', value: '1' },
      { label: 'Cerrado', value: '2' },
      { label: 'Archivado', value: '3' },
    ],
  },
  {
    label: 'Número',
    type: 'text',
    field: 'numero',
  },
  {
    label: 'Fecha',
    type: 'date-range',
    field: 'fecha',
  },
]

const table = computed(() => ({
  endpoint: '/api/tramite/expedientes/',
  columns,
  multiActions: multiActions.value,
  filters,
}))
</script>
