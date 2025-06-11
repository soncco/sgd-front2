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

const fields = [{ field: "nombre", label: "Nombre", type: "text" }];

const titulo = {
  title: "Editar tipo de documento",
  icon: "edit",
  buttons: [
    { label: "Ver todos los tipos", icon: "list", route: "/tipos-documento" },
  ],
};

const form = {
  endpoint: `/api/base/tipos-documento/${props.id}/`,
  fields,
  urlLista: "/tipos-documento",
  isEdit: true,
};
</script>
