<template>
  <q-page>
    <q-table
      :rows="rows"
      :columns="columns"
      row-key="id"
      v-model:pagination="pagination"
      :loading="loading"
      @request="onRequest"
      class="q-mt-md"
      :table-row-class-fn="tableRowClassFn"
      :table-row-style-fn="tableRowStyleFn"
      bordered
      separator="cell"
    >
      <!-- Slot genérico para campos de fecha -->
      <template v-for="col in dateColumns" :key="col.name" v-slot:[`body-cell-${col.name}`]="props">
        <q-td :props="props">
          <div class="row items-center q-gutter-xs">
            <q-icon name="event" color="grey-6" size="xs" />
            <span>{{ formatDate(props.value, col.format || 'date') }}</span>
          </div>
        </q-td>
      </template>

      <!-- Slot genérico para campos de fecha y hora -->
      <template
        v-for="col in datetimeColumns"
        :key="col.name"
        v-slot:[`body-cell-${col.name}`]="props"
      >
        <q-td :props="props">
          <div class="column q-gutter-xs">
            <div class="row items-center q-gutter-xs">
              <q-icon name="event" color="grey-6" size="xs" />
              <span class="text-weight-medium">{{ formatDate(props.value, 'date') }}</span>
            </div>
            <div class="row items-center q-gutter-xs">
              <q-icon name="schedule" color="grey-6" size="xs" />
              <span class="text-caption text-grey-7">{{ formatDate(props.value, 'time') }}</span>
            </div>
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td>
          <q-btn
            color="warning"
            title="Editar"
            icon="edit"
            text-color="black"
            @click="handleEdit(props.row)"
          />
        </q-td>
      </template>
      <template v-slot:body-cell-multiactions="props">
        <q-td>
          <q-btn-dropdown
            :label="props.col.label"
            color="primary"
            :loading="loadingActions[props.row.id]"
            @show="handleDropdownShow(props.row)"
          >
            <q-list>
              <q-item
                v-for="action in getRowActions(props.row.id)"
                :key="getActionKey(action, props.row)"
                clickable
                @click="action.action(props.row)"
              >
                <q-item-section avatar v-if="action.icon">
                  <q-avatar
                    :icon="action.icon"
                    :color="action.color || 'primary'"
                    :text-color="action.textColor || 'white'"
                  />
                </q-item-section>
                <q-item-section>{{ getActionLabel(action, props.row) }}</q-item-section>
              </q-item>
              <q-item
                v-if="getRowActions(props.row.id).length === 0 && !loadingActions[props.row.id]"
              >
                <q-item-section>No hay acciones disponibles</q-item-section>
              </q-item>
              <q-item v-if="loadingActions[props.row.id]">
                <q-item-section>
                  <q-spinner size="20px" />
                </q-item-section>
                <q-item-section>Cargando acciones...</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </q-td>
      </template>

      <template v-slot:top>
        <div class="row q-col-gutter-md full-width" v-if="filters.length > 0">
          <div
            v-for="filter in filters"
            :class="filter.type === 'date-range' ? 'col-md-4' : 'col-md-2' + ' col-12'"
            v-bind:key="filter.field"
          >
            <q-input
              v-if="filter.type === 'text'"
              v-model="tableFilters[filter.field]"
              :label="filter.label"
              outlined
              dense
              @update:model-value="onFilterChange"
            />
            <APISelect
              v-else-if="filter.type === 'api-select'"
              v-model="tableFilters[filter.field]"
              :label="filter.label"
              :url="filter.endpoint"
              dense
              @update:model-value="onFilterChange"
              :field="filter.endpointName"
            />
            <DatePicker
              v-else-if="filter.type === 'date'"
              v-model="tableFilters[filter.field]"
              :label="filter.label"
              outlined
              dense
              @update:model-value="onFilterChange"
            />
            <RangeDatePicker
              v-else-if="filter.type === 'date-range'"
              v-model="tableFilters[filter.field]"
              :label="filter.label"
              outlined
              dense
              :from-label="filter.fromLabel || 'Desde'"
              :to-label="filter.toLabel || 'Hasta'"
              @update:model-value="onFilterChange"
            />
            <q-select
              v-else-if="filter.type === 'select'"
              v-model="tableFilters[filter.field]"
              :label="filter.label"
              :options="filter.options"
              outlined
              dense
              emit-value
              map-options
              @update:model-value="onFilterChange"
            />
            <q-toggle
              v-else-if="filter.type === 'boolean'"
              v-model="tableFilters[filter.field]"
              :label="filter.label"
              dense
              @update:model-value="onFilterChange"
            />
          </div>
        </div>
        <q-separator />
      </template>
    </q-table>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { api } from 'boot/axios'
import { date } from 'quasar'

import APISelect from './APISelect.vue'
import DatePicker from './DatePicker.vue'
import RangeDatePicker from './RangeDatePicker.vue'

const props = defineProps({
  endpoint: {
    type: String,
    required: true,
  },
  columns: {
    type: Array,
    required: true,
  },
  rowsPerPage: {
    type: Number,
    default: 10,
  },
  handleEdit: {
    type: Function,
    default: (row) => {
      console.log('Editar:', row)
    },
  },
  multiActions: {
    type: Array,
    default: () => [],
  },
  filters: {
    type: Array,
    default: () => [],
  },
  getDynamicActions: {
    type: Function,
    default: null,
  },
  tableRowClassFn: {
    type: Function,
    default: () => null,
  },
  tableRowStyleFn: {
    type: Function,
    default: () => null,
  },
  /**
   * Configuración manual de columnas de fecha
   * Ejemplo: [{ name: 'fecha_creacion', format: 'datetime' }]
   */
  dateFields: {
    type: Array,
    default: () => [],
  },
  /**
   * Formato por defecto para fechas
   */
  defaultDateFormat: {
    type: String,
    default: 'date', // date, datetime, time, short, long
  },
})

// Computed para identificar columnas de fecha automáticamente
const dateColumns = computed(() => {
  // Combinar configuración manual con detección automática
  const manualDateFields = props.dateFields.filter(
    (field) =>
      !field.format ||
      field.format === 'date' ||
      field.format === 'short' ||
      field.format === 'long',
  )

  const autoDetected = props.columns.filter((col) => {
    // Verificar que field sea un string antes de usar toLowerCase
    const fieldName = typeof col.field === 'string' ? col.field : ''
    const colName = typeof col.name === 'string' ? col.name : ''

    return (
      fieldName &&
      (fieldName.toLowerCase().includes('fecha') ||
        fieldName.toLowerCase().includes('date') ||
        colName.toLowerCase().includes('fecha') ||
        colName.toLowerCase().includes('date')) &&
      !fieldName.toLowerCase().includes('time') &&
      !fieldName.toLowerCase().includes('hora') &&
      !fieldName.toLowerCase().includes('created') &&
      !fieldName.toLowerCase().includes('updated')
    )
  })

  // Evitar duplicados
  const manualNames = manualDateFields.map((field) => field.name)
  const filtered = autoDetected.filter((col) => !manualNames.includes(col.name))

  return [...manualDateFields, ...filtered]
})

const datetimeColumns = computed(() => {
  // Combinar configuración manual con detección automática
  const manualDatetimeFields = props.dateFields.filter(
    (field) => field.format === 'datetime' || field.format === 'time',
  )

  const autoDetected = props.columns.filter((col) => {
    // Verificar que field sea un string antes de usar toLowerCase
    const fieldName = typeof col.field === 'string' ? col.field : ''
    const colName = typeof col.name === 'string' ? col.name : ''

    return (
      fieldName &&
      (fieldName.toLowerCase().includes('created') ||
        fieldName.toLowerCase().includes('updated') ||
        fieldName.toLowerCase().includes('datetime') ||
        fieldName.toLowerCase().includes('timestamp') ||
        fieldName.toLowerCase().includes('hora') ||
        colName.toLowerCase().includes('actualizado'))
    )
  })

  // Evitar duplicados
  const manualNames = manualDatetimeFields.map((field) => field.name)
  const filtered = autoDetected.filter((col) => !manualNames.includes(col.name))

  return [...manualDatetimeFields, ...filtered]
})

// Función para formatear fechas de manera más legible
const formatDate = (dateValue, format = 'date') => {
  if (!dateValue) return '-'

  try {
    const dateObj = new Date(dateValue)

    // Verificar si la fecha es válida
    if (isNaN(dateObj.getTime())) return dateValue

    switch (format) {
      case 'date':
        return date.formatDate(dateObj, 'DD/MM/YYYY')
      case 'time':
        return date.formatDate(dateObj, 'HH:mm')
      case 'datetime':
        return date.formatDate(dateObj, 'DD/MM/YYYY HH:mm')
      case 'short':
        return date.formatDate(dateObj, 'DD/MM/YY')
      case 'long':
        return date.formatDate(dateObj, 'dddd DD [de] MMMM [de] YYYY')
      default:
        return date.formatDate(dateObj, 'DD/MM/YYYY')
    }
  } catch (error) {
    console.warn('Error formateando fecha:', error)
    return dateValue
  }
}

// Variables reactivas para almacenar los datos y el estado de la tabla
const rows = ref([])
const loading = ref(false)
const pagination = ref({
  page: 1,
  rowsPerPage: props.rowsPerPage,
  rowsNumber: 0,
  sortBy: '',
  descending: false,
})

// Manejar acciones dinámicas
const loadingActions = ref({})
const rowActionsCache = ref(new Map())

// Inicializar tableFilters basándose en la configuración de filters
const tableFilters = ref(
  props.filters.reduce((acc, filter) => {
    if (filter.type === 'date-range') {
      // Para date-range, inicializar como objeto con from/to
      acc[filter.field] = { from: null, to: null }
    } else {
      acc[filter.field] = ''
    }
    return acc
  }, {}),
)

const handleDropdownShow = (row) => {
  // Solo cargar acciones dinámicas asíncronas si la función está definida
  if (props.getDynamicActions && isAsyncFunction(props.getDynamicActions)) {
    loadActionsForRow(row)
  }
}

// Función para detectar si una función es asíncrona
const isAsyncFunction = (fn) => {
  return fn.constructor.name === 'AsyncFunction'
}

const loadActionsForRow = async (row) => {
  // Si no hay función de acciones dinámicas, no hacer nada
  if (!props.getDynamicActions) {
    return
  }

  // Si ya están cargadas, no volver a cargar
  if (rowActionsCache.value.has(row.id)) {
    return
  }

  loadingActions.value[row.id] = true

  try {
    const actions = await props.getDynamicActions(row)
    rowActionsCache.value.set(row.id, actions)
  } catch (error) {
    console.error('Error loading actions for row:', error)
    rowActionsCache.value.set(row.id, [])
  } finally {
    loadingActions.value[row.id] = false
  }
}

// Función para obtener acciones de una fila
const getRowActions = (rowId) => {
  const staticActions = props.multiActions || []

  // Obtener acciones dinámicas (síncronas o del cache asíncrono)
  let dynamicActions = []

  if (props.getDynamicActions) {
    if (isAsyncFunction(props.getDynamicActions)) {
      // Función asíncrona: usar cache
      dynamicActions = rowActionsCache.value.get(rowId) || []
    } else {
      // Función síncrona: ejecutar directamente
      const row = rows.value.find((r) => r.id === rowId)
      if (row) {
        dynamicActions = props.getDynamicActions(row) || []
      }
    }
  }

  // Combinar acciones estáticas y dinámicas
  return [...staticActions, ...dynamicActions]
}

// Función para obtener el label de una acción (puede ser string o función)
const getActionLabel = (action, row) => {
  if (typeof action.label === 'function') {
    return action.label(row)
  }
  return action.label
}

// Función para generar una key única para cada acción
const getActionKey = (action, row) => {
  const label = getActionLabel(action, row)
  return `${action.icon || 'no-icon'}-${label}-${row.id}`
}

// Construir parámetros de filtro para enviar al backend
const buildFilterParams = () => {
  const filterParams = {}

  props.filters.forEach((filter) => {
    if (filter.type === 'date-range') {
      const dateValue = tableFilters.value[filter.field]

      if (dateValue && (dateValue.from || dateValue.to)) {
        const { from, to } = dateValue

        // Lógica condicional para los filtros de fecha
        if (from && to) {
          // Ambas fechas: usar __range
          filterParams[`${filter.field}__range`] = `${from},${to}`
        } else if (from && !to) {
          // Solo fecha inicial: usar __gte (greater than or equal)
          filterParams[`${filter.field}__gte`] = from
        } else if (!from && to) {
          // Solo fecha final: usar __lte (less than or equal)
          filterParams[`${filter.field}__lte`] = to
        }
      }
    } else if (filter.type === 'text') {
      const value = tableFilters.value[filter.field]
      if (value && value.trim()) {
        filterParams['search'] = value.trim()
      }
    } else {
      const value = tableFilters.value[filter.field]
      if (value) {
        filterParams[filter.field] = value
      }
    }
  })

  return filterParams
}

// Función para obtener los datos de la API con paginación y ordenación
const fetchData = async () => {
  loading.value = true
  try {
    // Construye el parámetro de ordenación
    const ordering = pagination.value.sortBy
      ? `${pagination.value.descending ? '-' : ''}${pagination.value.sortBy}`
      : ''

    // Construye los parámetros de filtro
    const filterParams = buildFilterParams()

    const response = await api.get(props.endpoint, {
      params: {
        page: pagination.value.page,
        page_size: pagination.value.rowsPerPage,
        ordering,
        ...filterParams, // Añade los parámetros de filtro
      },
    })

    rows.value = response.data.results
    pagination.value.rowsNumber = response.data.count

    // Limpiar el caché de acciones dinámicas para forzar recalculación
    rowActionsCache.value.clear()
  } catch (error) {
    console.error('Error al cargar los datos:', error)
  } finally {
    loading.value = false
  }
}

// Función que se ejecuta cuando se hace una solicitud de paginación o cambio de ordenación
const onRequest = (params) => {
  if (
    pagination.value.page !== params.pagination.page ||
    pagination.value.rowsPerPage !== params.pagination.rowsPerPage ||
    pagination.value.sortBy !== params.pagination.sortBy ||
    pagination.value.descending !== params.pagination.descending
  ) {
    pagination.value = { ...pagination.value, ...params.pagination }
    fetchData()
  }
}

// Función que se ejecuta cuando cambia un filtro
const onFilterChange = () => {
  // Resetear a la página 1 cuando se aplican filtros
  pagination.value.page = 1
  fetchData()
}

// Función para refrescar la tabla (método público)
const refresh = () => {
  fetchData()
}

// Exponer métodos públicos
defineExpose({
  refresh,
})

// Llama a `fetchData` al montar el componente para cargar los datos iniciales
fetchData()
</script>

<!--
APITable - Tabla con paginación, filtros y formato automático de fechas

Uso básico:
<APITable
  endpoint="/api/requerimientos/"
  :columns="columns"
/>

Formato automático de fechas:
El componente detecta automáticamente columnas de fecha basándose en el nombre del campo:
- Fechas simples: fecha, date → formato DD/MM/YYYY con ícono 📅
- Fechas con hora: created, updated, datetime, timestamp → formato DD/MM/YYYY + HH:mm con íconos 📅⏰

Configuración manual de fechas:
<APITable
  endpoint="/api/requerimientos/"
  :columns="columns"
  :date-fields="[
    { name: 'fecha_vencimiento', format: 'date' },
    { name: 'created_at', format: 'datetime' },
    { name: 'hora_entrega', format: 'time' }
  ]"
  default-date-format="short"
/>

Formatos disponibles:
- 'date': DD/MM/YYYY (por defecto)
- 'datetime': DD/MM/YYYY HH:mm
- 'time': HH:mm
- 'short': DD/MM/YY
- 'long': Lunes 15 de Enero de 2024

Ejemplos de campos detectados automáticamente:
✅ fecha_creacion, date_created, fecha_vencimiento
✅ created_at, updated_at, datetime_field
✅ timestamp, hora_entrega, fecha_actualizacion

❌ No detectados: precio, cantidad, descripcion
-->
