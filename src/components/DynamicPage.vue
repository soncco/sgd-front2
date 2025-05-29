<template>
  <q-page padding>
    <PageTitle :title="titulo.title" :icon="titulo.icon" :buttons="titulo.buttons" />
    <DynamicForm
      :endpoint="form.endpoint"
      :fields="form.fields"
      :url-lista="form.urlLista"
      :isEdit="form.isEdit"
    />
  </q-page>
</template>

<script setup>
import DynamicForm from 'src/components/DynamicForm.vue'
import PageTitle from 'src/components/PageTitle.vue'

defineProps({
  titulo: {
    type: Object,
    required: true,
  },
  form: {
    type: Object,
    required: true,
  },
})
</script>
