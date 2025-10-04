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
  {
    field: 'tipos_documento_permitidos',
    label: 'Tipos de Documento Permitidos',
    type: 'apiselect',
    url: '/api/base/tipos_documento/',
    comboField: 'nombre',
    multiple: true,
    required: false,
  },
  {
    field: 'acciones_permitidas',
    label: 'Acciones Permitidas',
    type: 'apiselect',
    url: '/api/base/acciones/',
    comboField: 'nombre',
    multiple: true,
    required: false,
  },
]

// Configuración del título dinámico
const titulo = {
  title: isEdit ? 'Editar Cargo' : 'Nuevo Cargo',
  icon: 'work',
  buttons: [{ label: 'Ver todos los Cargos', icon: 'list', route: '/cargos' }],
}

// Configuración del formulario dinámico
const form = {
  endpoint: isEdit ? `/api/base/cargos/${id}/` : `/api/base/cargos/`,
  fields,
  urlLista: '/cargos',
  isEdit,
}
</script>
