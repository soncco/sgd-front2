<template>
  <q-page padding>
    <PageTitle :title="titulo.title" :icon="titulo.icon" :buttons="titulo.buttons" />
    <APITable
      :endpoint="table.endpoint"
      :columns="table.columns"
      :handleEdit="table.handleEdit"
      :multi-actions="table.multiActions"
    />
  </q-page>
</template>

<script setup>
import APITable from 'src/components/APITable.vue'
import PageTitle from 'src/components/PageTitle.vue'

defineProps({
  titulo: {
    type: Object,
    required: true,
  },
  table: {
    type: Object,
    required: true,
  },
})
</script>
