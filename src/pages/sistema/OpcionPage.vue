<template>
  <q-page padding>
    <PageTitle title="Opciones del sistema" icon="settings" />
    <div class="q-pa-md">
      <div class="row q-col-gutter-lg">
        <div v-for="group in grupos" :key="group.title" class="col-12 col-md-6 q-gutter-md">
          <SimpleTitle :title="group.title" />

          <APIEditInline
            v-for="opcion in group.items"
            :key="opcion.clave"
            :clave="opcion.clave"
            :label="opcion.label"
            :tipo="opcion.tipo"
            :opciones="opcion.options"
            :api-url="opcion.apiUrl"
            :field="opcion.field"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import PageTitle from 'src/components/PageTitle.vue'
import SimpleTitle from 'src/components/SimpleTitle.vue'
import APIEditInline from 'src/components/APIEditInline.vue'

// Agrupamos las opciones por columnas relacionadas para mejorar el orden visual
const grupos = ref([
  {
    title: 'Generales',
    items: [
      { clave: 'tipo_entidad', label: 'Tipo de Entidad', tipo: 'text' },
      { clave: 'entidad', label: 'Entidad', tipo: 'text' },
      { clave: 'direccion', label: 'Dirección', tipo: 'text' },
      { clave: 'ubicacion', label: 'Ubicación', tipo: 'text' },
      { clave: 'nombre_anio', label: 'Nombre del año', tipo: 'text' },
      { clave: 'anio_actual', label: 'Año actual', tipo: 'text' },
    ],
  },
  {
    title: 'Mesa de Partes',
    items: [
      {
        clave: 'oficina_mesa_partes',
        label: 'Oficina de Mesa de Partes',
        tipo: 'apiselect',
        apiUrl: 'api/base/oficinas/',
        field: 'nombre',
      },
      {
        clave: 'responsable_mesa_partes',
        label: 'Destinatario Mesa de Partes',
        tipo: 'apiselect',
        apiUrl: 'api/base/personas/',
        field: (row) => `${row.nombres} ${row.apellidos}`,
      },
    ],
  },
])
</script>
