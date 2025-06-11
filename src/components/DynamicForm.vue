<template>
  <q-form @submit.prevent="handleSubmit" class="q-pa-md">
    <div v-for="field in fields" :key="field.field">
      <q-input
        v-if="field.type !== 'apiselect'"
        v-model="formData[field.field]"
        :label="field.label"
        :type="field.type"
        filled
        :error="!!errors[field.field]"
        :error-message="errors[field.field] ? errors[field.field][0] : ''"
      />
      <APISelect
        v-else-if="field.type === 'apiselect'"
        v-model="formData[field.field]"
        :field="field.comboField"
        :url="field.url"
        :label="field.label"
        :default-ids="getDefaultId(field.field)"
      />
    </div>
    <q-btn type="submit" label="Guardar" color="primary" :loading="loading" />
  </q-form>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { api } from 'boot/axios'
import { Notify } from 'quasar'
import { useRouter } from 'vue-router'

import APISelect from 'src/components/APISelect.vue'

const props = defineProps({
  endpoint: {
    type: String,
    required: true,
  },
  fields: {
    type: Array,
    required: true,
  },
  urlLista: {
    type: String,
    required: true,
  },
  isEdit: {
    type: Boolean,
    default: false,
  },
})

const formData = ref({})
const errors = ref({})
const loading = ref(false)
const router = useRouter()

// Función para obtener los datos del endpoint y llenar el formulario
const fetchData = async () => {
  if (!props.isEdit) return
  loading.value = true
  try {
    const response = await api.get(props.endpoint)
    formData.value = response.data // Llena el formData con los datos obtenidos
    errors.value = {} // Limpia los errores al cargar los datos
  } catch (error) {
    console.error('Error al cargar los datos:', error)
    Notify.create({
      type: 'negative',
      message: 'Error al cargar los datos.',
    })
  } finally {
    loading.value = false
  }
}

// Función para manejar el envío del formulario y hacer un PATCH al endpoint
const handleSubmit = async () => {
  try {
    loading.value = true
    if (props.isEdit) {
      await api.patch(props.endpoint, formData.value)
    } else {
      await api.post(props.endpoint, formData.value)
    }
    Notify.create({
      type: 'positive',
      message: 'Datos guardados con éxito.',
    })
    router.push(props.urlLista)
    errors.value = {} // Limpia los errores al guardar con éxito
  } catch (error) {
    if (error.response && error.response.data) {
      errors.value = error.response.data // Asigna los errores recibidos del backend
    } else {
      Notify.create({
        type: 'negative',
        message: 'Error al guardar los datos.',
      })
      console.error('Error al guardar los datos:', error)
    }
  } finally {
    loading.value = false
  }
}

const getDefaultId = (fieldName) => {
  const val = formData.value[fieldName]
  return val ? [val.id || val] : []
}

// Llama a `fetchData` al montar el componente
onMounted(fetchData)

watch(
  () => formData.value,
  (newVal) => {
    console.log('Form data updated:', newVal)
  },
  { immediate: true },
)
</script>
