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
  { name: 'actions', label: 'Acciones', align: 'center' },
]
const editPersona = (row) => {
  router.push(`/persona/editar/${row.id}`)
}
const table = {
  endpoint: '/api/base/personas/',
  columns,
  handleEdit: editPersona,
}
</script>