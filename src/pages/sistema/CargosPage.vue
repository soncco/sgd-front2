<template>
  <ListPage :titulo="titulo" :table="table" />
</template>

<script setup>
import { useRouter } from 'vue-router'
import ListPage from 'src/components/ListPage.vue'

const router = useRouter()

const titulo = {
  title: 'Cargos',
  icon: 'list',
  buttons: [
    {
      label: 'Agregar Cargo',
      icon: 'add',
      route: '/cargo/nuevo',
    },
  ],
}

const columns = [
  {
    name: 'nombre',
    label: 'Nombre',
    align: 'left',
    field: 'nombre',
    sortable: true,
  },
  {
    name: 'descripcion',
    label: 'Descripción',
    align: 'left',
    field: 'descripcion',
    sortable: true,
  },
  { name: 'actions', label: 'Acciones', align: 'center' },
]

const editCargo = (row) => {
  router.push(`/cargo/editar/${row.id}`)
}

const table = {
  endpoint: '/api/base/cargos/',
  columns,
  handleEdit: editCargo,
}
</script>
