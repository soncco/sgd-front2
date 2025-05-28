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
      </q-table>
    </q-page>
  </template>
  
  <script setup>
  import { ref } from "vue";
  import { api } from "boot/axios";
  
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
        console.log("Editar:", row);
      },
    },
    multiActions: {
      type: Array,
      default: () => [],
    },
  });
  
  // Variables reactivas para almacenar los datos y el estado de la tabla
  const rows = ref([]);
  const loading = ref(false);
  const pagination = ref({
    page: 1,
    rowsPerPage: props.rowsPerPage,
    rowsNumber: 0,
    sortBy: "",
    descending: false,
  });
  
  // Función para obtener los datos de la API con paginación y ordenación
  const fetchData = async () => {
    loading.value = true;
    try {
      // Construye el parámetro de ordenación
      const ordering = pagination.value.sortBy
        ? `${pagination.value.descending ? "-" : ""}${pagination.value.sortBy}`
        : "";
  
      const response = await api.get(props.endpoint, {
        params: {
          page: pagination.value.page,
          page_size: pagination.value.rowsPerPage,
          ordering, // Agrega el parámetro de ordenación
        },
      });
  
      rows.value = response.data.results;
      pagination.value.rowsNumber = response.data.count;
    } catch (error) {
      console.error("Error al cargar los datos:", error);
    } finally {
      loading.value = false;
    }
  };
  
  // Función que se ejecuta cuando se hace una solicitud de paginación o cambio de ordenación
  const onRequest = (params) => {
    if (
      pagination.value.page !== params.pagination.page ||
      pagination.value.rowsPerPage !== params.pagination.rowsPerPage ||
      pagination.value.sortBy !== params.pagination.sortBy ||
      pagination.value.descending !== params.pagination.descending
    ) {
      pagination.value = { ...pagination.value, ...params.pagination };
      fetchData();
    }
  };
  
  // Llama a `fetchData` al montar el componente para cargar los datos iniciales
  fetchData();
  </script>
  