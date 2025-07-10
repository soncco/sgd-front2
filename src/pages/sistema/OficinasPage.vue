<template>
  <ListPage :titulo="titulo" :table="table" />
</template>

<script setup>
import { useRouter } from 'vue-router'
import ListPage from 'src/components/ListPage.vue'

const router = useRouter()

const titulo = {
  title: 'Oficinas',
  icon: 'list',
  buttons: [
    {
      label: 'Agregar Oficina',
      icon: 'add',
      route: '/oficina/nuevo',
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
    name: 'abreviatura',
    label: 'Abreviatura',
    align: 'left',
    field: 'abreviatura',
    sortable: true,
  },
  {
    name: 'depende_de',
    label: 'Depende de',
    align: 'left',
    field: 'depende_de_nombre',
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
    label: 'Dependencia',
    type: 'api-select',
    field: 'depende_de',
    endpoint: '/api/base/oficinas/',
    endpointName: 'nombre',
  },
]

const editOficina = (row) => {
  router.push(`/oficina/editar/${row.id}`)
}

const table = {
  endpoint: '/api/base/oficinas/',
  columns,
  handleEdit: editOficina,
  filters,
}
</script>
