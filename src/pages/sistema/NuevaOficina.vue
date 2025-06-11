<template>
  <DynamicPage :titulo="titulo" :form="form" />
</template>

<script setup>
import DynamicPage from 'src/components/DynamicPage.vue'

const fields = [
  { field: 'nombre', label: 'Nombre', type: 'text' },
  { field: 'abreviatura', label: 'Abreviatura', type: 'text' },
  {
    field: 'depende_de',
    comboField: 'nombre',
    label: 'Depende de',
    type: 'apiselect',
    url: '/api/base/oficinas/',
  },
]

const titulo = {
  title: 'Nueva Oficina',
  icon: 'edit',
  buttons: [{ label: 'Ver todas las Oficinas', icon: 'list', route: '/oficinas' }],
}

const form = {
  endpoint: `/api/base/oficinas/`,
  fields,
  urlLista: '/oficinas',
}
</script>
