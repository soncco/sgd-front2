<template>
  <q-table
    :rows="rows"
    :columns="columns"
    row-key="id"
    :loading="loading"
    ref="tableRef"
    v-model:pagination="pagination"
    :filter="filter"
    @request="onRequest"
    class="q-mt-lg"
  >
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td v-for="col in props.cols" :key="col.name" :props="props">
          {{ col.value }}
        </q-td>

        <q-td auto-width>
          <q-btn
            color="warning"
            text-color="black"
            square
            icon="edit"
            :to="`${editar}${props.row.id}`"
          >
            <q-tooltip :delay="500"> Editar </q-tooltip>
          </q-btn>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script>
import { ref, onMounted } from "vue";
import { api } from "src/boot/axios";

export default {
  props: {
    columns: Array,
    url: String,
    editar: String,
    sortBy: String,
  },

  setup(props) {
    const tableRef = ref();
    const rows = ref([]);
    const filter = ref("");
    const loading = ref(false);
    const pagination = ref({
      sortBy: props.sortBy,
      descending: false,
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 10,
    });

    async function fetchFromServer(count, filter, sortBy, descending, page) {
      loading.value = true;

      const term = filter || "";

      const des = descending ? "-" : "";

      const ordering = sortBy ? `&ordering=${des}${sortBy}` : "";

      count = count ? `&page_size=${count}` : "";

      page = page ? `&page=${page}` : "";

      let data = []; // Cambiado aquí

      try {
        const response = await api.get(
          `${props.url}?term=${term}${ordering}${count}${page}`
        );
        // console.log(response.data);
        pagination.value.rowsNumber = response.data.count;
        data = response.data.results;
      } catch (error) {
        console.log(error);
      }

      loading.value = false;
      return data;
    }

    async function onRequest(props) {
      const { page, rowsPerPage, sortBy, descending } = props.pagination;
      const filter = props.filter;

      loading.value = true;

      const fetchCount =
        rowsPerPage === 0 ? pagination.value.rowsNumber : rowsPerPage;

      let returnedData = await fetchFromServer(
        fetchCount,
        filter,
        sortBy,
        descending,
        page
      );

      rows.value = returnedData;

      pagination.value.page = page;
      pagination.value.rowsPerPage = rowsPerPage;
      pagination.value.sortBy = sortBy;
      pagination.value.descending = descending;

      loading.value = false;
    }

    onMounted(() => {
      tableRef.value.requestServerInteraction();
    });

    return {
      tableRef,
      filter,
      loading,
      pagination,
      rows,

      onRequest,
    };
  },
};
</script>
