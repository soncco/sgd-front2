<template>
  <q-input
    v-if="field.type === 'text' || field.type === 'textarea'"
    v-model="model"
    :label="field.label"
    :type="field.type"
    filled
    :error="error"
    :error-message="errorMessage"
  />

  <q-select
    v-else-if="field.type === 'combo'"
    v-model="model"
    :label="field.label"
    filled
    :options="field.options"
    :error="error"
    :error-message="errorMessage"
  />

  <APISelect
    v-else-if="field.type === 'apiselect'"
    v-model="model"
    :label="field.label"
    :url="field.url"
    :field="field.apiLabel"
    :error="error"
    :error-message="errorMessage"
    :creatable="field.creatable"
    :create-endpoint="field.createEndpoint"
    :create-fields="field.createFields"
  />

  <DatePicker
    v-else-if="field.type === 'date'"
    v-model="model"
    :label="field.label"
    :error="error"
    :error-message="errorMessage"
  />
</template>

<script setup>
import DatePicker from './DatePicker.vue'
import APISelect from './APISelect.vue'

defineProps({
  field: {
    type: Object,
    required: true,
  },
  error: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: '',
  },
})

const model = defineModel({
  type: [String, Number, Array, Object],
  default: '',
})
</script>
