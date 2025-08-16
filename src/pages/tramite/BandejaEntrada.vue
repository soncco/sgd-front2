<template>
  <ListPage :titulo="titulo" :table="table" />
</template>

<script setup>
import { computed } from 'vue'
import { api } from 'boot/axios'
import ListPage from 'src/components/ListPage.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const titulo = {
  title: 'Bandeja de Entrada',
  icon: 'inbox',
}

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
    name: 'fecha_documento',
    label: 'Fecha',
    align: 'left',
    field: 'fecha_documento',
    format: (val) => new Date(val).toLocaleDateString(),
    sortable: true,
  },
  {
    name: 'tipo_documento',
    label: 'Tipo de documento',
    align: 'left',
    field: 'tipo_documento',
    sortable: true,
  },
  {
    name: 'oficina_origen',
    label: 'Oficina origen',
    align: 'left',
    field: 'oficina_origen',
    sortable: true,
  },
  {
    name: 'remitente',
    label: 'Remitente',
    align: 'left',
    field: 'remitente',
    sortable: true,
  },
  { name: 'multiactions', label: 'Acciones', align: 'center' },
]

const filters = [
  {
    label: 'Buscar',
    type: 'text',
    field: 'search',
  },
  {
    label: 'Tipo de documento',
    type: 'api-select',
    field: 'documento__tipo',
    endpoint: '/api/base/tipos-documento/',
    endpointName: 'nombre',
  },
  {
    label: 'Oficina origen',
    type: 'api-select',
    field: 'documento__asignacion_cargo__oficina',
    endpoint: '/api/base/oficinas/',
    endpointName: 'nombre',
  },
  {
    label: 'Fecha',
    type: 'date-range',
    field: ['fecha_after', 'fecha_before'],
    range: true,
  },
]

const table = computed(() => ({
  endpoint: '/api/tramite/bandeja-entrada/',
  columns,
  filters,
  multiActions: [
    {
      label: 'Ver',
      icon: 'visibility',
      color: 'primary',
      action: (row) => {
        console.log('Ver documento', row)
      },
    },
  ],
  getDynamicActions: async (row) => {
    const response = await api.get(`/api/base/acciones-usuario/?idOficina=${row.id}`)
    return response.data.results.map((action) => ({
      label: action.nombre,
      action: (row) => {
        console.log(`Acción ejecutada: ${action.nombre}`, row.id)
        router.push(`/accion/${action.id}/${row.id}`)
      },
      icon: action.icono,
      color: action.color,
    }))
  },
}))
</script>
