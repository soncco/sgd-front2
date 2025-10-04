<template>
  <ListPage :titulo="titulo" :table="table" />
</template>

<script setup>
import { useRouter } from 'vue-router'
import ListPage from 'src/components/ListPage.vue'

const router = useRouter()

const titulo = {
  title: 'TUPA',
  icon: 'list',
  buttons: [
    {
      label: 'Agregar TUPA',
      icon: 'add',
      route: '/tupa/nuevo',
    },
  ],
}

const columns = [
  {
    name: 'denominacion',
    label: 'Denominación',
    align: 'left',
    field: 'denominacion',
    sortable: true,
  },
  {
    name: 'unidad_organizativa',
    label: 'Unidad Organizativa',
    align: 'left',
    field: 'unidad_organizativa_nombre',
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
    label: 'Unidad Organizativa',
    type: 'api-select',
    field: 'unidad_organizativa',
    endpoint: '/api/base/oficinas/',
    endpointName: 'nombre',
  },
]

const editTupa = (row) => {
  router.push(`/tupa/editar/${row.id}`)
}

const table = {
  endpoint: '/api/base/tupas/',
  columns,
  handleEdit: editTupa,
  filters,
}
</script>
