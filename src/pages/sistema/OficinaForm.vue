<template>
  <DynamicPage :titulo="titulo" :form="form" />
</template>

<script setup>
import { useRoute } from 'vue-router'
import DynamicPage from 'src/components/DynamicPage.vue'

// Obtener parámetros de la URL
const route = useRoute()
const id = route.params.id

// Verificamos si es edición o creación
const isEdit = !!id

// Campos del formulario
const fields = [
  { field: 'nombre', label: 'Nombre', type: 'text', required: true },
  { field: 'abreviatura', label: 'Abreviatura', type: 'text', required: true },
  {
    field: 'depende_de',
    comboField: 'nombre',
    label: 'Depende de',
    type: 'apiselect',
    url: '/api/base/oficinas/',
    required: false,
  },
]

// Configuración del título dinámico
const titulo = {
  title: isEdit ? 'Editar Oficina' : 'Nueva Oficina',
  icon: 'business',
  buttons: [{ label: 'Ver todas las Oficinas', icon: 'list', route: '/oficinas' }],
}

// Configuración del formulario dinámico
const form = {
  endpoint: isEdit ? `/api/base/oficinas/${id}/` : `/api/base/oficinas/`,
  fields,
  urlLista: '/oficinas',
  isEdit,
}
</script>
