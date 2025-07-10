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
              maxlength="15"
              :error-message="errores_texto.celular"
              :error="errores.celular"
            />
            <q-input
              v-if="!isEdit"
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
            <SimpleTitle v-if="!isEdit" title="Credenciales" />
            <q-input
              v-if="!isEdit"
              outlined
              required
              type="password"
              v-model="info.password"
              label="Contraseña"
              maxlength="150"
              :error-message="errores_texto.password"
              :error="errores.password"
            />
            <q-input
              v-if="!isEdit"
              outlined
              required
              type="password"
              v-model="info.password_repeat"
              label="Contraseña otra vez"
              maxlength="150"
              :error-message="errores_texto.password"
              :error="errores.password"
            />
            <SimpleTitle title="Asignaciones de Cargos" />
            <div class="row q-gutter-x-xs q-mt-md">
              <div
                v-for="(asignacion, index) in info.asignaciones_cargo"
                :key="index"
                class="col-12"
              >
                <div class="relative-position q-pa-sm bg-grey-1 rounded-borders">
                  <div class="row q-col-gutter-md">
                    <div class="col-6">
                      <APISelect
                        v-model="asignacion.cargo"
                        label="Cargo"
                        url="/api/base/cargos/"
                        field="nombre"
                        dense
                      />
                    </div>
                    <div class="col-6">
                      <APISelect
                        v-model="asignacion.oficina"
                        label="Oficina"
                        url="/api/base/oficinas/"
                        field="nombre"
                        dense
                      />
                    </div>
                  </div>
                </div>
              </div>

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
import { Notify } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import { api } from 'src/boot/axios'
import PageTitle from 'src/components/PageTitle.vue'
import APISelect from 'src/components/APISelect.vue'
import SimpleTitle from 'src/components/SimpleTitle.vue'

const route = useRoute()
const router = useRouter()
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
  password_repeat: '',
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
  info.asignaciones_cargo.push({ cargo: null, oficina: null })
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
    const payload = { ...info }
    payload.asignaciones_cargo = info.asignaciones_cargo.filter((a) => !a.id)
    if (payload.asignaciones_cargo.length === 0) delete payload.asignaciones_cargo

    await api.patch(endpoint, payload)
    return true
  } catch (error) {
    if (error.response?.status === 400) {
      const data = error.response.data
      Object.entries(data).forEach(([field, msg]) => {
        errores[field] = true
        errores_texto[field] = Array.isArray(msg) ? msg[0] : msg
      })
    } else {
      console.error('Error desconocido al modificar:', error)
    }
    return false
  }
}

const saveData = async () => {
  Object.keys(errores).forEach((k) => (errores[k] = false))
  Object.keys(errores_texto).forEach((k) => (errores_texto[k] = ''))
  try {
    const payload = { ...info }
    payload.username = info.documento
    await api.post(endpoint, payload)
    return true
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
    return false
  }
}

const submitForm = async () => {
  const success = isEdit ? await modifyData() : await saveData()
  if (!isEdit) {
    if (info.password !== info.password_repeat) {
      Notify.create({
        type: 'negative',
        message: 'Las contraseñas no coinciden.',
      })
      return
    }

    if (info.password === info.documento) {
      Notify.create({
        type: 'negative',
        message: 'La contraseña no puede ser igual al número de documento.',
      })
      return
    }
  }
  if (success) {
    Notify.create({
      type: 'positive',
      message: isEdit ? 'Persona modificada con éxito' : 'Persona guardada con éxito',
    })

    router.push('/personas')
  } else {
    Notify.create({
      type: 'negative',
      message: 'Revisa los errores en el formulario.',
    })
  }
}

if (isEdit) {
  onMounted(fetchData)
}
</script>
