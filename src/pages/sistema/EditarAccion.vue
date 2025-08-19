<template>
  <DynamicPage :titulo="titulo" :form="form" />
</template>

<script setup>
import DynamicPage from "src/components/DynamicPage.vue";

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});

const fields = [
  { field: "nombre", label: "Nombre", type: "text" },
  { field: "icono", label: "Ícono", type: "text" }, 
];

const titulo = {
  title: "Editar acción",
  icon: "edit",
  buttons: [
    { label: "Ver todas las acciones", icon: "list", route: "/acciones" },
  ],
};

const form = {
  endpoint: `/api/base/acciones/${props.id}/`,
  fields,
  urlLista: "/acciones",
  isEdit: true,
};
</script>
