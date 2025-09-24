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
      :return-object="returnObject"
      :readonly="readonly"
      :use-chips="multiple"
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
  /**
   * Endpoint para obtener un elemento específico por ID
   * Usado para hacer prefetch del valor inicial si no está en las opciones
   * Si no se proporciona, se usará el URL base + '/ID/'
   */
  prefetchEndpoint: {
    type: String,
    default: '',
  },
  /**
   * Hacer prefetch automático del valor inicial si no está en las opciones
   */
  autoPrefetch: {
    type: Boolean,
    default: true,
  },
  /**
   * Nombre del parámetro para búsqueda en la URL
   */
  searchParam: {
    type: String,
    default: 'search',
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
  returnObject: {
    type: Boolean,
    default: false,
  },
  readonly: {
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
  return props.returnObject
    ? {
        label,
        value: item, // el objeto entero se convierte en el valor
      }
    : {
        label,
        value: item.id,
        original: item, // sigue disponible si lo necesitas para otra lógica
      }
}

/**
 * fetchData: carga datos de la API con un término de búsqueda
 */
function fetchData(term = '') {
  isLoading.value = true

  // Construir URL con parámetro de búsqueda si se proporciona un término
  let urlWithParam = props.url
  if (term && term.trim()) {
    const separator = props.url.includes('?') ? '&' : '?'
    urlWithParam = `${props.url}${separator}${props.searchParam}=${encodeURIComponent(term.trim())}`
  }

  api
    .get(urlWithParam)
    .then((response) => {
      // Manejar diferentes formatos de respuesta de la API
      let data = response.data
      if (data.results && Array.isArray(data.results)) {
        // Formato paginado estándar de Django REST framework
        options.value = data.results.map((item) => buildOption(item))
      } else if (Array.isArray(data)) {
        // Formato array directo
        options.value = data.map((item) => buildOption(item))
      } else {
        console.warn('Formato de respuesta de API no reconocido:', data)
        options.value = []
      }
    })
    .catch((error) => {
      console.error('Error al cargar datos de la API:', error)
      options.value = []
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
      // Manejar diferentes formatos de respuesta de la API
      let data = response.data
      let items = []

      if (data.results && Array.isArray(data.results)) {
        // Formato paginado estándar de Django REST framework
        items = data.results
      } else if (Array.isArray(data)) {
        // Formato array directo
        items = data
      } else {
        console.warn('Formato de respuesta de API no reconocido para defaultIds:', data)
        return
      }

      const defaultOptions = items.map((item) => buildOption(item))

      options.value = [...options.value, ...defaultOptions]

      model.value = props.multiple
        ? defaultOptions.map((opt) => (props.returnObject ? opt.original : opt.value))
        : (props.returnObject ? defaultOptions[0]?.original : defaultOptions[0]?.value) || null
    })
    .catch((error) => {
      console.error('Error al cargar datos por defecto:', error)
    })
    .finally(() => {
      isLoading.value = false
    })
}

/**
 * Hacer prefetch de un valor específico si no está en las opciones actuales
 */
async function prefetchValue(value, setLoading = true) {
  if (!value || !props.autoPrefetch) return

  // Si ya tenemos este valor en las opciones, no hacer nada
  const exists = options.value.some((opt) => opt.value == value)
  if (exists) return

  try {
    if (setLoading) isLoading.value = true

    // Determinar el endpoint para prefetch
    let endpoint = props.prefetchEndpoint
    if (!endpoint) {
      // Usar el URL base + '/ID/'
      const baseUrl = props.url.replace(/\/$/, '') // Remover trailing slash si existe
      endpoint = `${baseUrl}/${value}/`
    }

    const response = await api.get(endpoint)
    const item = response.data
    const option = buildOption(item)

    // Agregar la opción al inicio de la lista
    options.value.unshift(option)
  } catch (error) {
    console.error('Error al hacer prefetch del valor:', error)
    // No hacer nada más, simplemente el valor se mostrará como ID
  } finally {
    if (setLoading) isLoading.value = false
  }
}

/**
 * Hacer prefetch de múltiples valores de forma eficiente
 */
async function prefetchMultipleValues(values) {
  if (!values || !Array.isArray(values) || values.length === 0 || !props.autoPrefetch) return

  // Filtrar valores que ya existen en las opciones
  const missingValues = values.filter((value) => {
    return !options.value.some((opt) => opt.value == value)
  })

  if (missingValues.length === 0) return

  try {
    isLoading.value = true

    // Intentar hacer una llamada batch si el endpoint lo soporta
    const separator = props.url.includes('?') ? '&' : '?'
    const batchUrl = `${props.url}${separator}id__in=${missingValues.join(',')}`

    const response = await api.get(batchUrl)

    if (response.data && response.data.results) {
      // La API soporta batch, procesamos todos los resultados
      const newOptions = response.data.results.map((item) => buildOption(item))
      options.value = [...options.value, ...newOptions]
    } else if (response.data && Array.isArray(response.data)) {
      // La API devuelve array directo
      const newOptions = response.data.map((item) => buildOption(item))
      options.value = [...options.value, ...newOptions]
    } else {
      // Fallback: hacer llamadas individuales
      await Promise.all(missingValues.map((value) => prefetchValue(value, false)))
    }
  } catch (error) {
    console.error('Error al hacer prefetch batch, intentando individual:', error)
    // Fallback: hacer llamadas individuales sin setLoading para evitar conflictos
    await Promise.all(missingValues.map((value) => prefetchValue(value, false)))
  } finally {
    isLoading.value = false
  }
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
      model.value.push(props.returnObject ? newOption.original : newOption.value)
    } else {
      // si es single
      model.value = props.returnObject ? newOption.original : newOption.value
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
onMounted(async () => {
  fetchData()
  fetchDefaultData()

  // Hacer prefetch del valor inicial si existe
  if (model.value && !props.multiple) {
    await prefetchValue(model.value)
  } else if (model.value && props.multiple && Array.isArray(model.value)) {
    // Para múltiples valores, hacer prefetch en batch
    await prefetchMultipleValues(model.value)
  }
})

// Watcher para hacer prefetch cuando cambie el valor del modelo externamente
watch(
  () => model.value,
  async (newValue, oldValue) => {
    if (newValue !== oldValue && newValue) {
      if (!props.multiple) {
        await prefetchValue(newValue)
      } else if (Array.isArray(newValue)) {
        await prefetchMultipleValues(newValue)
      }
    }
  },
  { immediate: false },
)

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
    if (!val) return

    const hasSelection = props.multiple
      ? Array.isArray(model.value) && model.value.length > 0
      : model.value !== null && model.value !== undefined

    if (!hasSelection) {
      fetchDefaultData()
    }
  },
  { immediate: true },
)
</script>

<!--
APISelect - Componente para seleccionar elementos desde una API

Uso básico:
<APISelect
  v-model="selectedValue"
  url="/api/productos/"
  field="nombre"
  label="Seleccionar Producto"
/>

Búsqueda con término personalizado:
<APISelect
  v-model="selectedValue"
  url="/api/productos/"
  field="nombre"
  search-param="search"
  label="Buscar Producto"
/>
Cuando el usuario escriba "cemento" hará: GET /api/productos/?search=cemento

Prefetch automático:
Si tienes un valor inicial (ej: ID 100) y no está en las primeras opciones cargadas,
el componente automáticamente hará una petición para obtener la información completa
de ese elemento y mostrarlo correctamente.

Para personalizar el endpoint de prefetch:
<APISelect
  v-model="selectedValue"
  url="/api/productos/"
  prefetch-endpoint="/api/productos/detalle/"
  field="nombre"
/>

Para desactivar el prefetch automático:
<APISelect
  v-model="selectedValue"
  url="/api/productos/"
  :auto-prefetch="false"
  field="nombre"
/>

Props principales:
- url: Endpoint base para cargar opciones
- field: Campo a mostrar como label (string o función)
- multiple: Permitir selección múltiple
- searchParam: Nombre del parámetro de búsqueda (default: 'term')
- autoPrefetch: Hacer prefetch automático del valor inicial (default: true)
- prefetchEndpoint: Endpoint personalizado para prefetch (opcional)
-->
