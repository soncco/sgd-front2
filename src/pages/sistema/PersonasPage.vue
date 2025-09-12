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
    name: 'nombre_completo',
    label: 'Nombre Completo',
    align: 'left',
    field: 'nombre_completo',
    sortable: true,
  },
  {
    name: 'tipo_documento',
    label: 'Tipo de Documento',
    align: 'left',
    field: 'tipo_doc_display',
    sortable: true,
  },
  {
    name: 'documento',
    label: 'Número de documento',
    align: 'left',
    field: 'documento',
    sortable: true,
  },
  { name: 'actions', label: 'Acciones', align: 'center' },
]

const filters = [
  {
    label: 'Buscar',
    type: 'text',
    field: 'term',
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
