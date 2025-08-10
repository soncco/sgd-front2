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
    >
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
                :key="action.label"
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
                <q-item-section>{{ action.label }}</q-item-section>
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
        <div class="row q-col-gutter-md" v-if="filters.length > 0">
          <div v-for="filter in filters" class="col" v-bind:key="filter.field">
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
          </div>
        </div>
        <q-separator />
      </template>
    </q-table>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { api } from 'boot/axios'

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
})

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
  // Solo cargar acciones dinámicas si la función está definida
  if (props.getDynamicActions) {
    loadActionsForRow(row)
  }
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
  const dynamicActions = rowActionsCache.value.get(rowId) || []

  // Combinar acciones estáticas y dinámicas
  return [...staticActions, ...dynamicActions]
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
        filterParams['term'] = value.trim()
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

// Llama a `fetchData` al montar el componente para cargar los datos iniciales
fetchData()
</script>
