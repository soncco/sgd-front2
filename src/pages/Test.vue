<template>
    <q-page padding>
      <div>Esta es la página de test</div>
  
      <APIEditInline
        label="Entidad"
        clave="entidad"
        tipo="combo"
        :opciones="[
          { label: 'Opción A', value: 'A' },
          { label: 'Opción B', value: 'B' }
        ]"
      />
  
      <APISelect
        v-model="selectedItem"
        :options="items"
        label="Selecciona un ítem"
        field="nombre"
      />
  
      <!-- Aquí se prueba el componente APITable -->
      <APITable
        :columns="tableColumns"
        :rowsPerPage="5"
        :multiActions="multiActions"
        :handleEdit="handleEdit"
      />
    </q-page>
  </template>
  
  <script>
  import { defineComponent } from "vue";
  import APIEditInline from "src/components/APIEditInline.vue";
  import APISelect from "src/components/APISelect.vue";
  import APITable from "src/components/APITable.vue";
  
  export default defineComponent({
    name: "TestPage",
    components: {
      APIEditInline,
      APISelect,
      APITable,
    },
    data() {
      return {
        selectedItem: null,
        items: [
          { id: 1, nombre: "Item 1" },
          { id: 2, nombre: "Item 2" },
          { id: 3, nombre: "Item 3" },
        ],
        tableColumns: [
          { name: "id", label: "ID", field: "id", align: "left", sortable: true },
          { name: "name", label: "Nombre", field: "name", align: "left", sortable: true },
          { name: "role", label: "Rol", field: "role", align: "left", sortable: true },
          { name: "actions", label: "Acciones", field: "actions" },
          { name: "multiactions", label: "Más acciones", field: "multiactions" },
        ],
        multiActions: [
          {
            label: "Ver detalles",
            icon: "visibility",
            color: "primary",
            textColor: "white",
            action: (row) => console.log("Ver detalles de:", row),
          },
          {
            label: "Eliminar",
            icon: "delete",
            color: "red",
            textColor: "white",
            action: (row) => console.log("Eliminar:", row),
          },
        ],
      };
    },
    methods: {
      handleEdit(row) {
        console.log("Editar:", row);
      },
    },
  });
  </script>
  