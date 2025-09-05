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
  { field: 'abreviatura', label: 'Abreviatura', type: 'text' },
  {
    field: 'depende_de',
    comboField: 'nombre',
    label: 'Depende de',
    type: 'apiselect',
    url: `/api/base/oficinas/?exclude=${props.id}`,
  },
]

const titulo = {
  title: 'Editar Oficina',
  icon: 'edit',
  buttons: [{ label: 'Ver todas las Oficinas', icon: 'list', route: '/oficinas' }],
}

const form = {
  endpoint: `/api/base/oficinas/${props.id}/`,
  fields,
  urlLista: '/oficinas',
  isEdit: true,
}
</script>
