<template>
  <q-page padding>

    <PageTitle
      title="Página de Test"
      icon="mdi-test-tube"
      iconColor="primary"
    />
    <SimpleTitle 
      title="Prueba de título simple"
    />

    <!--Al montar, hace GET a api/base/opcion/{clave}.
    Muestra el dato actual (texto, combo o archivo).
    Al hacer clic, muestra un editor según el tipo.
    Al guardar, hace PATCH a api/base/opcion/{clave}/ con el nuevo valor. -->

    <APIEditInline
      clave="hola"
      label="Piero"
    />

    <APISelect
      v-model="selectedItem"
      label="Selecciona un ítem"
      url="/api/base/oficinas"
      field="nombre"
    />

    <APITable
      endpoint="/api/base/oficinas"
      :columns="tableColumns"
      :handleEdit="handleEdit"
      :multiActions="multiActions"
    />
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'
import APISelect from 'src/components/APISelect.vue'
import APITable from "src/components/APITable.vue";
import APIEditInline from 'src/components/APIEditInline.vue'
import SimpleTitle from 'src/components/SimpleTitle.vue'
import PageTitle from 'src/components/PageTitle.vue'

export default defineComponent({
  name: 'TestPage',
  components: {
    APIEditInline,
    APISelect,
    APITable,
    SimpleTitle,
    PageTitle,
  },
  data() {
    return {
      selectedItem: null,
      tableColumns: [
        { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true },
        { name: 'nombre', label: 'Nombre Oficina', field: 'nombre', align: 'left', sortable: true },
        { name: 'depende_de', label: 'Depende de', field: 'depende_de', align: 'left', sortable: true },
      ],
      multiActions: [
        {
          label: 'Ver detalles',
          icon: 'visibility',
          color: 'primary',
          textColor: 'white',
          action: (row) => console.log('Ver detalles de:', row),
        },
        {
          label: 'Eliminar',
          icon: 'delete',
          color: 'red',
          textColor: 'white',
          action: (row) => console.log('Eliminar:', row),
        },
      ],
    }
  },
  methods: {
    handleEdit(row) {
      console.log('Editar:', row)
    },
  },
})
</script>
