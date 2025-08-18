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

// Campos del formulario (descripción es opcional, así que siempre lo mostramos)
const fields = [
  { field: 'nombre', label: 'Nombre', type: 'text' },
  { field: 'descripcion', label: 'Descripción', type: 'textarea', required: false },
  { field: 'icono', label: 'Ícono', type: 'text' },
]

// Configuración del título dinámico
const titulo = {
  title: isEdit ? 'Editar Acción' : 'Nueva Acción',
  icon: 'edit',
  buttons: [{ label: 'Ver todas las Acciones', icon: 'list', route: '/acciones' }],
}

// Configuración del formulario dinámico
const form = {
  endpoint: isEdit ? `/api/base/acciones/${id}/` : `/api/base/acciones/`,
  fields,
  urlLista: '/acciones',
  isEdit,
}
</script>
