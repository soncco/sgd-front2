<template>
  <ListPage :titulo="titulo" :table="table" />
</template>

<script setup>
import { useRouter } from "vue-router";
import ListPage from "src/components/ListPage.vue";

const router = useRouter();

const titulo = {
  title: "Oficinas",
  icon: "list",
  buttons: [
    {
      label: "Agregar Oficina",
      icon: "add",
      route: "/oficina/nuevo",
    },
  ],
};

const columns = [
  {
    name: "abreviatura",
    label: "Abreviatura",
    align: "left",
    field: "abreviatura",
    sortable: true,
  },
  {
    name: "nombre",
    label: "Nombre",
    align: "left",
    field: "nombre",
    sortable: true,
  },
  { name: "actions", label: "Acciones", align: "center" },
];

const editOficina = (row) => {
  router.push(`/oficina/editar/${row.id}`);
};

const table = {
  endpoint: "/api/base/oficinas/",
  columns,
  handleEdit: editOficina,
};
</script>
