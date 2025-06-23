<template>
  <DynamicPage :titulo="titulo" :form="form" />
</template>

<script setup>
import DynamicPage from 'src/components/DynamicPage.vue'

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

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
  title: 'Editar Cargo',
  icon: 'edit',
  buttons: [{ label: 'Ver todos los cargos', icon: 'list', route: '/cargos' }],
}

const form = {
  endpoint: `/api/base/cargos/${props.id}/`,
  fields,
  urlLista: '/cargos',
  isEdit: true,
}
</script>
