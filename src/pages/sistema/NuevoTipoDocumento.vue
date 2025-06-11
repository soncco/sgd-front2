<template>
  <DynamicPage :titulo="titulo" :form="form" />
</template>

<script setup>
import DynamicPage from 'src/components/DynamicPage.vue'

const fields = [{ field: 'nombre', label: 'Nombre', type: 'text' }]

const titulo = {
  title: 'Crear tipo de documento',
  icon: 'add',
  buttons: [
    {
      label: 'Ver todos los tipos de documento',
      icon: 'arrow_back',
      route: '/tipos-documento',
    },
  ],
}

const form = {
  endpoint: `/api/base/tipos-documento/`,
  fields,
  urlLista: '/tipos-documento',
}
</script>
