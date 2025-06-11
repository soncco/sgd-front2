<template>
  <div class="q-pb-md">
    <q-select
      v-model="model"
      :options="options"
      option-value="value"
      option-label="label"
      :label="label"
      :loading="isLoading"
      use-input
      clearable
      @filter="filterFn"
      @clear="clearSelection"
      @popup-show="fetchData"
      filled
      :multiple="multiple"
      @input-value="onInputValue"
      :dense="dense"
      emit-value
      map-options
    >
      <!-- Slot personalizado para cuando no hay opciones -->
      <template v-slot:no-option>
        <q-item>
          <q-item-section class="text-grey"> No hay resultados </q-item-section>
        </q-item>
        <!-- Si creatable está activo, mostramos un botón para crear -->
        <q-item v-if="creatable && searchTerm">
          <q-item-section>
            <q-btn
              color="primary"
              size="sm"
              dense
              :label="`Crear nuevo con '${searchTerm}'`"
              @click.stop="openCreateDialog"
            />
          </q-item-section>
        </q-item>
      </template>
    </q-select>

    <!-- Diálogo para crear un nuevo elemento -->
    <q-dialog v-model="showCreateDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Crear nuevo registro</div>
        </q-card-section>

        <!-- Aquí podrías usar tu DynamicEntityPage o un mini-form -->
        <q-card-section>
          <div v-for="field in createFields" :key="field.field" class="q-my-sm">
            <DynamicMasterForm v-model="createFormData[field.field]" :field="field" />
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="negative" @click="cancelCreate" />
          <q-btn flat label="Guardar" color="primary" @click="handleCreate" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, reactive } from 'vue'
import { api } from 'src/boot/axios'
import DynamicMasterForm from 'src/components/DynamicMasterForm.vue'
// O si deseas usar DynamicEntityPage, importas ese componente y adaptas la lógica

/**
 * Props
 */
const props = defineProps({
  url: {
    type: String,
    required: true,
  },
  field: {
    type: [String, Function],
    required: true,
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  defaultIds: {
    type: Array,
    required: false,
  },
  label: {
    type: String,
    default: 'Select',
  },
  /**
   * Indica si se puede crear un nuevo registro desde aquí
   */
  creatable: {
    type: Boolean,
    default: false,
  },
  /**
   * Configuración para el formulario de creación (en caso de creatable=true)
   */
  createEndpoint: {
    type: String,
    default: '',
  },
  createFields: {
    type: Array,
    default: () => [],
  },
  dense: {
    type: Boolean,
    default: false,
  },
})

/**
 * Reemplazamos modelValue + update:modelValue por defineModel
 */
const model = defineModel({
  type: [Array, String, Number, Object],
  default: null,
})

const options = ref([])
const isLoading = ref(false)
const searchTerm = ref('')

/**
 * Diálogo y formulario para "crear nuevo"
 */
const showCreateDialog = ref(false)
const createFormData = reactive({})

/**
 * Función para construir la opción "label/value"
 */
function buildOption(item) {
  const label = typeof props.field === 'function' ? props.field(item) : item[props.field]
  return {
    label,
    value: item.id,
    original: item,
  }
}

/**
 * fetchData: carga datos de la API con un término de búsqueda
 */
function fetchData(term = '') {
  isLoading.value = true
  const urlWithParam = `${props.url}?term=${encodeURIComponent(term)}`
  api
    .get(urlWithParam)
    .then((response) => {
      options.value = response.data.results.map((item) => buildOption(item))
    })
    .finally(() => {
      isLoading.value = false
    })
}

function fetchDefaultData() {
  if (!props.defaultIds || props.defaultIds.length === 0) return

  isLoading.value = true
  const urlWithParam = `${props.url}?id__in=${props.defaultIds.join(',')}`
  api
    .get(urlWithParam)
    .then((response) => {
      const defaultOptions = response.data.results.map((item) => buildOption(item))

      options.value = [...options.value, ...defaultOptions]

      model.value = props.multiple
        ? defaultOptions.map((opt) => opt.value)
        : defaultOptions[0]?.value || null
    })
    .finally(() => {
      isLoading.value = false
    })
}

/**
 * Filtrado al escribir
 */
function filterFn(val, update) {
  update(() => {
    fetchData(val)
  })
}

/**
 * Captura el texto que escribe el usuario en el input
 */
function onInputValue(val) {
  searchTerm.value = val
}

/**
 * Limpiar selección
 */
function clearSelection() {
  if (props.multiple) {
    model.value = []
  } else {
    model.value = null
  }
  searchTerm.value = ''
  fetchData()
}

/**
 * Abrir el diálogo para crear un nuevo registro
 * Podrías inicializar el createFormData con algo basado en searchTerm
 */
function openCreateDialog() {
  // Reiniciamos la data del form
  props.createFields.forEach((field) => {
    createFormData[field.field] =
      searchTerm.value && field.field === 'nombre' ? searchTerm.value : ''
  })
  showCreateDialog.value = true
}

/**
 * Cancelar
 */
function cancelCreate() {
  showCreateDialog.value = false
}

/**
 * Guardar (crear) el nuevo elemento
 * Este ejemplo usa axios, pero podrías usar fetch
 */
async function handleCreate() {
  if (!props.createEndpoint) {
    // No hay endpoint para crear
    showCreateDialog.value = false
    return
  }
  try {
    isLoading.value = true
    const response = await api.post(props.createEndpoint, createFormData)
    const createdItem = response.data // Asumiendo que viene el objeto creado
    // 1. Creamos la opción y la agregamos a 'options'
    const newOption = buildOption(createdItem)
    options.value.push(newOption)
    // 2. Seleccionamos este nuevo valor
    if (props.multiple) {
      // si es multiple, push al array
      if (!Array.isArray(model.value)) {
        model.value = []
      }
      model.value.push(newOption)
    } else {
      // si es single
      model.value = newOption
    }
    // 3. Cerrar el diálogo
    showCreateDialog.value = false
  } catch (error) {
    console.error('Error al crear:', error)
  } finally {
    isLoading.value = false
  }
}

/**
 * Watchers y lifecycle
 */
onMounted(() => {
  fetchData()
  fetchDefaultData()
})

watch(
  () => props.multiple,
  (newVal) => {
    if (newVal && !Array.isArray(model.value)) {
      model.value = []
    } else if (!newVal && Array.isArray(model.value)) {
      model.value = null
    }
  },
)

watch(
  () => props.defaultIds?.join(','),
  (val) => {
    if (val) {
      fetchDefaultData()
    }
  },
  { immediate: true },
)
</script>
