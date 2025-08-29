<template>
  <q-page padding>
    <PageTitle title="Opciones del sistema" icon="settings" />
    <div class="q-pa-md">
      <div class="row q-col-gutter-lg">
        <div class="col-6 q-gutter-md">
          <SimpleTitle title="General" />

          <APIEditInline
            v-for="opcion in opciones"
            :key="opcion.clave"
            :clave="opcion.clave"
            :label="opcion.label"
            :tipo="opcion.tipo"
            :opciones="opcion.options"
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

const opciones = ref([
  { clave: 'tipo_entidad', label: 'Tipo de Entidad' },
  { clave: 'entidad', label: 'Entidad' },
  { clave: 'direccion', label: 'Dirección' },
  { clave: 'ubicacion', label: 'Ubicación' },
  { clave: 'nombre_anio', label: 'Nombre del año' },
  { clave: 'anio_actual', label: 'Año actual' },
  { clave: 'logo', label: 'Logo' },
  {
    clave: 'numeracion',
    label: 'Tipo de numeración',
    tipo: 'combo',
    options: [
      { value: 'oficina', label: 'Por oficina' },
      { value: 'usuario', label: 'Por usuario' },
    ],
  },
  { clave: 'tramite_oficina', label: 'Oficina de Mesa de Partes'},
  { clave: 'tramite_destinatario', label: 'Destinatario Mesa de Partes'},
])
</script>
