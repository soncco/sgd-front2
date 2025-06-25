<template>
  <q-page padding>
    <PageTitle :title="titulo.title" :icon="titulo.icon" :buttons="titulo.buttons" />
    <div class="q-pa-md">
      <q-form @submit="submitForm" class="q-gutter-md">
        <div class="row q-col-gutter-lg">
          <div class="col-6 q-gutter-md">
            <SimpleTitle title="Información" />
            <q-select
              outlined
              required
              emit-value
              map-options
              v-model="info.tipo_doc"
              :options="optionsDoc"
              label="Tipo de documento"
              :error-message="errores_texto.tipo_doc"
              :error="errores.tipo_doc"
            />
            <q-input
              outlined
              required
              v-model="info.documento"
              label="Documento"
              maxlength="50"
              :error-message="errores_texto.documento"
              :error="errores.documento"
            />
            <q-input
              outlined
              required
              v-model="info.nombres"
              label="Nombres"
              maxlength="255"
              :error-message="errores_texto.nombres"
              :error="errores.nombres"
            />
            <q-input
              outlined
              required
              v-model="info.apellidos"
              label="Apellidos"
              maxlength="255"
              :error-message="errores_texto.apellidos"
              :error="errores.apellidos"
            />
            <q-input
              outlined
              required
              v-model="info.celular"
              label="Celular"
              maxlength="9"
              :error-message="errores_texto.celular"
              :error="errores.celular"
            />
            <q-input
              outlined
              required
              v-model="info.email"
              label="Correo electrónico"
              :error-message="errores_texto.email"
              :error="errores.email"
              maxlength="255"
              type="email"
            />
          </div>
          <div class="col-6 q-gutter-md">
            <SimpleTitle title="Credenciales" />
            <q-input
              outlined
              required
              type="username"
              v-model="info.username"
              label="Usuario"
              maxlength="150"
              :error-message="errores_texto.username"
              :error="errores.username"
            />
            <q-input
              outlined
              required
              type="password"
              v-model="info.password"
              label="Contraseña"
              maxlength="150"
              :error-message="errores_texto.password"
              :error="errores.password"
            />
            <div class="row q-col-gutter-md q-mt-xs">
              <div class="col-12">
                <SimpleTitle title="Asignaciones de Cargos" />
              </div>

              <template v-for="(asignacion, index) in info.asignaciones_cargo" :key="index">
                <div class="col-6">
                  <APISelect
                    v-model="asignacion.cargo"
                    label="Cargo"
                    url="/api/base/cargos/"
                    field="nombre"
                    :creatable="true"
                    create-endpoint="/api/base/cargos/"
                    :create-fields="[{ field: 'nombre', label: 'Nombre del cargo', type: 'text' }]"
                    dense
                  />
                </div>
                <div class="col-6">
                  <APISelect
                    v-model="asignacion.oficina"
                    label="Oficina"
                    url="/api/base/oficinas/"
                    field="nombre"
                    :creatable="true"
                    create-endpoint="/api/base/oficinas/"
                    :create-fields="[{ field: 'nombre', label: 'Nombre de oficina', type: 'text' }]"
                    dense
                  />
                </div>
              </template>

              <div class="col-12 flex flex-center">
                <q-btn
                  flat
                  color="primary"
                  icon="add"
                  label="Agregar Cargo"
                  @click="addAsignacion"
                />
              </div>
            </div>
          </div>
        </div>
        <q-btn label="Guardar" type="submit" color="primary" icon="save" />
      </q-form>
    </div>
  </q-page>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from 'src/boot/axios'
import PageTitle from 'src/components/PageTitle.vue'
import APISelect from 'src/components/APISelect.vue'
import SimpleTitle from 'src/components/SimpleTitle.vue'

const route = useRoute()
const id = route.params.id

const isEdit = !!id

const titulo = reactive({
  title: isEdit ? 'Editar Persona' : 'Nueva Persona',
  icon: 'edit',
  buttons: [{ label: 'Ver todas las Personas', icon: 'list', route: '/personas' }],
})

const info = reactive({
  username: '',
  password: '',
  email: '',
  nombres: '',
  apellidos: '',
  empresa: '',
  celular: '',
  documento: '',
  tipo_doc: '',
  asignaciones_cargo: [
    {
      cargo: null,
      oficina: null,
    },
  ],
})

function addAsignacion() {
  info.asignaciones_cargo.push({
    cargo: null,
    oficina: null,
  })
}

const errores = reactive({})
const errores_texto = reactive({})

const optionsDoc = [
  { label: 'DNI', value: '1' },
  { label: 'RUC', value: '2' },
  { label: 'Carnet de extranjería', value: '3' },
  { label: 'Pasaporte', value: '4' },
  { label: 'Sin documento (Código temporal)', value: '5' },
  { label: 'Permiso temporal del permanencia', value: '6' },
]

// Si estás editando: obtiene info de /personas/:id/.
// Si estás creando: envia POST a /persona-usuario/
const endpoint = isEdit ? `/api/base/personas/${id}/` : '/api/base/persona-usuario/'
const fetchData = () => {
  api
    .get(endpoint)
    .then((response) => {
      Object.assign(info, response.data)
    })
    .catch((error) => {
      console.log(error)
    })
}

const modifyData = async () => {
  Object.keys(errores).forEach((k) => (errores[k] = false))
  Object.keys(errores_texto).forEach((k) => (errores_texto[k] = ''))

  try {
    // Clona los datos excepto asignaciones
    const payload = { ...info }

    // Solo enviar asignaciones nuevas (sin ID)
    payload.asignaciones_cargo = info.asignaciones_cargo.filter((asignacion) => !asignacion.id)

    // Si no hay asignaciones nuevas, elimina el campo
    if (payload.asignaciones_cargo.length === 0) {
      delete payload.asignaciones_cargo
    }

    const response = await api.patch(endpoint, payload)
    console.log('Modificación exitosa:', response.data)
  } catch (error) {
    if (error.response && error.response.status === 400) {
      const data = error.response.data
      Object.entries(data).forEach(([field, msg]) => {
        errores[field] = true
        errores_texto[field] = Array.isArray(msg) ? msg[0] : msg
      })
    } else {
      console.error('Error desconocido al modificar:', error)
    }
  }
}

const saveData = async () => {
  Object.keys(errores).forEach((k) => (errores[k] = false))
  Object.keys(errores_texto).forEach((k) => (errores_texto[k] = ''))
  try {
    const response = await api.post(endpoint, info)
    console.log('Guardado exitoso:', response.data)
  } catch (error) {
    if (error.response && error.response.status === 400) {
      const data = error.response.data
      Object.entries(data).forEach(([field, msg]) => {
        errores[field] = true
        errores_texto[field] = Array.isArray(msg) ? msg[0] : msg
      })
    } else {
      console.error('Error desconocido:', error)
    }
  }
}

const submitForm = () => {
  if (isEdit) {
    modifyData()
  } else {
    saveData()
  }
}

if (isEdit) {
  onMounted(fetchData)
}
</script>
