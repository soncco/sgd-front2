<template>
  <DynamicPage :titulo="titulo" :form="form" />
</template>

<script setup>
import DynamicPage from 'src/components/DynamicPage.vue'

const fields = [
  { field: 'nombre', label: 'Nombre', type: 'text' },
  { field: 'descripcion', label: 'Descripción', type: 'text' },
  {
    field: 'tipos_documento_permitidos',
    comboField: 'nombre',
    label: 'Tipos de Documento Permitidos',
    type: 'apiselect',
    url: '/api/base/tipos-documento/',
    multiple: true,
  },
  {
    field: 'acciones_permitidas',
    comboField: 'nombre',
    label: 'Acciones Permitidas',
    type: 'apiselect',
    url: '/api/base/acciones/',
    multiple: true,
  },
]

const titulo = {
  title: 'Nuevo Cargo',
  icon: 'edit',
  buttons: [{ label: 'Ver todos los Cargo', icon: 'list', route: '/cargos' }],
}

const form = {
  endpoint: `/api/base/cargos/`,
  fields,
  urlLista: '/cargos',
}
</script>
