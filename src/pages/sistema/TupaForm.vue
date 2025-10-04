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
  { field: 'denominacion', label: 'Denominación', type: 'text', required: true },
  { field: 'descripcion', label: 'Descripción', type: 'text', required: true },
  { field: 'requisitos', label: 'Requisitos', type: 'textarea', required: true },
  {
    field: 'unidad_organizativa',
    comboField: 'nombre',
    label: 'Unidad Organizativa',
    type: 'apiselect',
    url: '/api/base/oficinas/',
    required: true,
  },
]

// Configuración del título dinámico
const titulo = {
  title: isEdit ? 'Editar TUPA' : 'Nuevo TUPA',
  icon: 'business',
  buttons: [{ label: 'Ver todos los TUPA', icon: 'list', route: '/tupas' }],
}

// Configuración del formulario dinámico
const form = {
  endpoint: isEdit ? `/api/base/tupas/${id}/` : `/api/base/tupas/`,
  fields,
  urlLista: '/tupas',
  isEdit,
}
</script>
