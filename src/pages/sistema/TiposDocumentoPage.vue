<template>
  <ListPage :titulo="titulo" :table="table" />
</template>

<script setup>
import { useRouter } from 'vue-router'
import ListPage from 'src/components/ListPage.vue'

const router = useRouter()

const titulo = {
  title: 'Lista de tipos de documento',
  icon: 'list',
  buttons: [
    {
      label: 'Crear nuevo tipo de documento',
      icon: 'add',
      route: '/tipos-documento/nuevo',
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
  { name: 'actions', label: 'Acciones', align: 'center' },
]

const filters = [
  {
    label: 'Buscar',
    type: 'text',
    field: 'term',
  },
]

const editTipoDocumento = (row) => {
  router.push(`/tipos-documento/editar/${row.id}`)
}

const table = {
  endpoint: '/api/base/tipos_documento/',
  columns,
  handleEdit: editTipoDocumento,
  filters,
}
</script>
