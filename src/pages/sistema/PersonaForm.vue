<template>
  <DynamicPage :titulo="titulo" :form="form" />
</template>

<script setup>
import { useRoute } from 'vue-router'
import DynamicPage from 'src/components/DynamicPage.vue'

const route = useRoute()
const id = route.params.id

const isEdit = !!id

const fields = [
    { field: 'email', label: 'Email', type: 'email' },
    { field: 'nombres', label: 'Nombres', type: 'text' },
    { field: 'apellidos', label: 'Apellidos', type: 'text' },
    { field: 'empresa', label: 'Empresa', type: 'text' },
    { field: 'celular', label: 'Celular', type: 'tel' },
    { field: 'tipo_persona', label: 'Tipo de persona', type: 'apiselect' },
    { field: 'tipo_doc', label: 'Tipo de documento', type: 'apiselect' },
    { field: 'documento', label: 'Documento', type: 'text' },
    //{ field: 'oficina', label: 'Oficina', type: 'apiselect' },
    //{ field: 'password', label: 'Contraseña', type: 'password' },
    //{ field: 'password_verification', label: 'Contraseña', type: 'password' },
]

const titulo = {
  title: isEdit ? 'Editar Persona' : 'Nueva Persona',
  icon: 'edit',
  buttons: [
    { label: 'Ver todas las Personas', icon: 'list', route: '/personas' },
  ],
}

const form = {
    endpoint: isEdit ? `/api/base/personas/${id}/` : '/api/base/personas/',
    fields,
    urlLista: '/personas',
    isEdit,
}
</script>