<template>
  <DynamicPage :titulo="titulo" :form="form" />
</template>

<script setup>
import DynamicPage from 'src/components/DynamicPage.vue'

const fields = [
  { field: 'nombre', label: 'Nombre', type: 'text' },
  { field: 'descripcion', label: 'Descripción', type: 'textarea' },
  { field: 'icono', label: 'Ícono', type: 'text' },
]

const titulo = {
  title: 'Nueva Acción',
  icon: 'edit',
  buttons: [{ label: 'Ver todas las Acciones', icon: 'list', route: '/acciones' }],
}

const form = {
  endpoint: `/api/base/acciones/`,
  fields,
  urlLista: '/acciones',
}
</script>
