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
  { field: 'descripcion', label: 'Descripción', type: 'textarea', required: false },
]

// Configuración del título dinámico
const titulo = {
  title: isEdit ? 'Editar Tipo de Documento' : 'Nuevo Tipo de Documento',
  icon: 'description',
  buttons: [{ label: 'Ver todos los Tipos de Documento', icon: 'list', route: '/tipos-documento' }],
}

// Configuración del formulario dinámico
const form = {
  endpoint: isEdit ? `/api/base/tipos_documento/${id}/` : `/api/base/tipos_documento/`,
  fields,
  urlLista: '/tipos-documento',
  isEdit,
}
</script>
