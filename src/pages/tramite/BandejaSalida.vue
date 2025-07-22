<template>
  <ListPage :titulo="titulo" :table="table" />
</template>

<script setup>
import ListPage from 'src/components/ListPage.vue'

const titulo = {
  title: 'Bandeja de Salida',
  icon: 'send'
}

// Columnas de la tabla
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
    field: 'fecha',
    format: val => new Date(val).toLocaleDateString(),
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
    name: 'oficina_destino',
    label: 'Oficina destino',
    align: 'left',
    field: 'oficina_destino',
    sortable: true,
  },
  {
    name: 'destinatario',
    label: 'Destinatario',
    align: 'left',
    field: 'destinatario',
    sortable: true,
  },
]

// Filtros para buscar
const filters = [
  {
    label: 'Buscar',
    type: 'text',
    field: 'term',
  },
  {
    label: 'Tipo de documento',
    type: 'api-select',
    field: 'tipo_documento',
    endpoint: '/api/base/tipos-documento/',
    endpointName: 'nombre',
  },
  {
    label: 'Oficina destino',
    type: 'api-select',
    field: 'oficina_destino',
    endpoint: '/api/base/oficinas/',
    endpointName: 'nombre',
  },
]


  // se espera  endpoint del backend para obtener la data
  const table = {
    endpoint: '/api/tramite/bandeja-salida/', // endpoint esperado
    columns,
    filters,
  }


</script>