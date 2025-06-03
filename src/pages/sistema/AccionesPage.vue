  <template>
  <ListPage :titulo="titulo" :table="table" />
</template>

<script setup>
import { useRouter } from "vue-router";
import ListPage from "src/components/ListPage.vue";

const router = useRouter();

const titulo = {
  title: "Lista de acciones",
  icon: "list",
  buttons: [
    {
      label: "Crear nueva acción",
      icon: "add",
      route: "/accion/nuevo",
    },
  ],
};

const columns = [
  {
    name: "nombre",
    label: "Nombre",
    align: "left",
    field: "nombre",
    sortable: true,
  },
  { name: "actions", label: "Acciones", align: "center" },
];

const editAccion = (row) => {
  router.push(`/accion/editar/${row.id}`);
};

const table = {
  endpoint: "/api/base/acciones/",
  columns,
  handleEdit: editAccion,
};
</script>
