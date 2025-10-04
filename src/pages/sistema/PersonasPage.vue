<template>
  <ListPage :titulo="titulo" :table="table" />
</template>

<script setup>
import { useRouter } from 'vue-router'
import ListPage from 'src/components/ListPage.vue'

const router = useRouter()

const titulo = {
  title: 'Personas',
  icon: 'list',
  buttons: [
    {
      label: 'Agregar Persona',
      icon: 'add',
      route: '/persona/nuevo',
    },
  ],
}
const columns = [
  {
    name: 'nombres',
    label: 'Nombres',
    align: 'left',
    field: 'nombres',
    sortable: true,
  },
  {
    name: 'apellidos',
    label: 'Apellidos',
    align: 'left',
    field: 'apellidos',
    sortable: true,
  },
  {
    name: 'tipo_documento',
    label: 'Tipo Doc.',
    align: 'center',
    field: 'tipo_doc_display',
    sortable: true,
  },
  {
    name: 'documento',
    label: 'Documento',
    align: 'left',
    field: 'documento',
    sortable: true,
  },
  {
    name: 'celular',
    label: 'Celular',
    align: 'left',
    field: 'celular',
    sortable: false,
  },
  {
    name: 'email',
    label: 'Email',
    align: 'left',
    field: 'email',
    sortable: false,
  },
  { name: 'actions', label: 'Acciones', align: 'center' },
]

const filters = [
  {
    label: 'Buscar',
    type: 'text',
    field: 'search', // Según la documentación, el parámetro es 'search'
  },
  {
    label: 'Tipo de Documento',
    type: 'select',
    field: 'tipo_doc',
    options: [
      { label: 'DNI', value: '1' },
      { label: 'RUC', value: '2' },
      { label: 'Carnet de extranjería', value: '3' },
      { label: 'Pasaporte', value: '4' },
      { label: 'Sin documento (Código temporal)', value: '5' },
      { label: 'Permiso temporal del permanencia', value: '6' },
    ],
  },
]

const editPersona = (row) => {
  router.push(`/persona/editar/${row.id}`)
}
const table = {
  endpoint: '/api/base/personas/',
  columns,
  handleEdit: editPersona,
  filters,
}
</script>
