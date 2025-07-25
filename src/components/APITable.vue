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
            @click="() => console.log(multiActions)"
            color="primary"
          >
            <q-list>
              <q-item
                v-for="action in multiActions"
                :key="action.label"
                clickable
                @click="action.action(props.row)"
              >
                <q-item-section avatar>
                  <q-avatar
                    :icon="action.icon"
                    :color="action.color"
                    :text-color="action.textColor"
                  />
                </q-item-section>
                <q-item-section>{{ action.label }}</q-item-section>
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

// Inicializar tableFilters basándose en la configuración de filters
const tableFilters = ref(
  props.filters.reduce((acc, filter) => {
    if (filter.type === 'date-range' && Array.isArray(filter.field)) {
      acc[filter.field[0]] = ''
      acc[filter.field[1]] = ''
    } else {
      acc[filter.field] = ''
    }
    return acc
  }, {}),
)

// Construir parámetros de filtro para enviar al backend
const buildFilterParams = () => {
  const filterParams = {}

  props.filters.forEach((filter) => {
    if (filter.type === 'date-range' && Array.isArray(filter.field)) {
      const [afterField, beforeField] = filter.field
      const afterValue = tableFilters.value[afterField]
      const beforeValue = tableFilters.value[beforeField]

      if (afterValue) {
        filterParams[afterField] = afterValue
      }
      if (beforeValue) {
        filterParams[beforeField] = beforeValue
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
