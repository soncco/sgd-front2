<template>
  <q-page padding>
    <PageTitle :title="titulo.title" :icon="titulo.icon" :buttons="titulo.buttons" />

    <div class="q-pa-md">
      <q-form @submit="submitForm" class="q-gutter-lg">
        <!-- Información Personal -->
        <SimpleTitle title="Información Personal" />
        <div class="row q-col-gutter-md q-mt-md">
          <div class="col-12 col-md-6">
            <q-select
              outlined
              required
              emit-value
              map-options
              v-model="info.tipo_doc"
              :options="optionsDoc"
              label="Tipo de documento *"
              :error="hasFieldError('tipo_doc')"
              :error-message="getFieldError('tipo_doc')"
              :rules="[validationRules.required()]"
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              outlined
              required
              v-model="info.documento"
              label="Número de documento *"
              maxlength="50"
              :error="hasFieldError('documento')"
              :error-message="getFieldError('documento')"
              :rules="[validationRules.required()]"
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              outlined
              required
              v-model="info.nombres"
              label="Nombres *"
              maxlength="255"
              :error="hasFieldError('nombres')"
              :error-message="getFieldError('nombres')"
              :rules="[validationRules.required()]"
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              outlined
              required
              v-model="info.apellidos"
              label="Apellidos *"
              maxlength="255"
              :error="hasFieldError('apellidos')"
              :error-message="getFieldError('apellidos')"
              :rules="[validationRules.required()]"
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              outlined
              required
              v-model="info.celular"
              label="Celular *"
              maxlength="15"
              :error="hasFieldError('celular')"
              :error-message="getFieldError('celular')"
              :rules="[validationRules.required()]"
            />
          </div>
          <div class="col-12 col-md-6" v-if="!isEdit">
            <q-input
              outlined
              required
              v-model="info.email"
              label="Correo electrónico *"
              :error="hasFieldError('email')"
              :error-message="getFieldError('email')"
              maxlength="255"
              type="email"
              :rules="[validationRules.required(), validationRules.email()]"
            />
          </div>
        </div>

        <!-- Credenciales (solo para creación) -->
        <div v-if="!isEdit">
          <SimpleTitle title="Credenciales de Acceso" />
          <div class="row q-col-gutter-md q-mt-md">
            <div class="col-12 col-md-6">
              <q-input
                outlined
                required
                type="password"
                v-model="info.password"
                label="Contraseña *"
                maxlength="150"
                :error="hasFieldError('password')"
                :error-message="getFieldError('password')"
                :rules="[validationRules.required(), validationRules.minLength(8)]"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                outlined
                required
                type="password"
                v-model="info.password_repeat"
                label="Confirmar contraseña *"
                maxlength="150"
                :error="hasFieldError('password_repeat') || !passwordsMatch"
                :error-message="
                  !passwordsMatch
                    ? 'Las contraseñas no coinciden'
                    : getFieldError('password_repeat')
                "
                :rules="[validationRules.required()]"
              />
            </div>
          </div>
        </div>

        <!-- Asignaciones de Cargos -->
        <SimpleTitle title="Asignaciones de Cargos" />

        <div v-if="info.asignaciones_cargo.length === 0" class="text-center text-grey-6 q-py-lg">
          <q-icon name="work_outline" size="3rem" class="q-mb-md" />
          <div>No hay asignaciones de cargo</div>
          <div class="text-caption">Haga clic en "Agregar" para crear una asignación</div>
        </div>

        <div v-else class="q-gutter-md">
          <q-card
            v-for="(asignacion, index) in info.asignaciones_cargo"
            :key="index"
            flat
            bordered
            class="q-pa-md bg-grey-1"
          >
            <div class="row items-center justify-between q-mb-md">
              <div class="text-subtitle2 text-primary">Asignación {{ index + 1 }}</div>
              <q-btn
                flat
                dense
                color="negative"
                icon="delete"
                @click="removeAsignacion(index)"
                v-if="info.asignaciones_cargo.length > 1"
              />
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6 col-md-4">
                <APISelect
                  v-model="asignacion.cargo"
                  label="Cargo *"
                  url="/api/base/cargos/"
                  field="nombre"
                  outlined
                  required
                  :error="hasFieldError(`asignaciones_cargo.${index}.cargo`)"
                  :error-message="getFieldError(`asignaciones_cargo.${index}.cargo`)"
                />
              </div>
              <div class="col-12 col-sm-6 col-md-4">
                <APISelect
                  v-model="asignacion.oficina"
                  label="Oficina *"
                  url="/api/base/oficinas/"
                  field="nombre"
                  outlined
                  required
                  :error="hasFieldError(`asignaciones_cargo.${index}.oficina`)"
                  :error-message="getFieldError(`asignaciones_cargo.${index}.oficina`)"
                />
              </div>
              <div class="col-12 col-sm-6 col-md-2">
                <DatePicker
                  v-model="asignacion.fecha_inicio"
                  label="Fecha de inicio"
                  :error="hasFieldError(`asignaciones_cargo.${index}.fecha_inicio`)"
                  :error-message="getFieldError(`asignaciones_cargo.${index}.fecha_inicio`)"
                />
              </div>
              <div class="col-12 col-sm-6 col-md-2">
                <div class="q-field q-field--outlined q-field--dense">
                  <q-checkbox
                    v-model="asignacion.es_responsable"
                    label="Es responsable"
                    class="q-mt-md"
                  />
                  <div class="text-caption text-grey-6 q-mt-xs">Responsable de la oficina</div>
                </div>
              </div>
            </div>
          </q-card>
        </div>

        <q-btn flat dense color="primary" icon="add" label="Agregar" @click="addAsignacion" />

        <!-- Botones de acción -->
        <div class="row justify-end q-gutter-sm q-mt-lg">
          <q-btn
            flat
            color="grey-7"
            icon="arrow_back"
            label="Cancelar"
            @click="$router.push('/personas')"
          />
          <q-btn type="submit" color="primary" icon="save" label="Guardar" :loading="isLoading" />
        </div>
      </q-form>
    </div>
  </q-page>
</template>

<script setup>
import { reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useErrorHandler } from 'src/composables/useErrorHandler'
import { useValidation } from 'src/composables/useValidation'
import { api } from 'src/boot/axios'
import PageTitle from 'src/components/PageTitle.vue'
import APISelect from 'src/components/APISelect.vue'
import SimpleTitle from 'src/components/SimpleTitle.vue'
import DatePicker from 'src/components/DatePicker.vue'

const route = useRoute()
const router = useRouter()
const id = route.params.id
const isEdit = !!id

// Composables
const {
  clearErrors,
  hasFieldError,
  getFieldError,
  handleAsync,
  isLoading,
  showErrorNotification,
  showSuccessNotification,
} = useErrorHandler()
const { rules: validationRules } = useValidation()

const titulo = reactive({
  title: isEdit ? 'Editar Persona' : 'Nueva Persona',
  icon: isEdit ? 'edit' : 'person_add',
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
      fecha_inicio: '',
      es_responsable: false,
    },
  ],
})

// Computed
const passwordsMatch = computed(() => {
  if (isEdit) return true
  return info.password === info.password_repeat
})

// Funciones para manejo de asignaciones
function addAsignacion() {
  const nuevaAsignacion = {
    cargo: null,
    oficina: null,
    fecha_inicio: '',
    es_responsable: false,
  }
  info.asignaciones_cargo.push(nuevaAsignacion)
}

function removeAsignacion(index) {
  if (info.asignaciones_cargo.length > 1) {
    info.asignaciones_cargo.splice(index, 1)
  }
}

const optionsDoc = [
  { label: 'DNI', value: '1' },
  { label: 'RUC', value: '2' },
  { label: 'Carnet de extranjería', value: '3' },
  { label: 'Pasaporte', value: '4' },
  { label: 'Sin documento (Código temporal)', value: '5' },
  { label: 'Permiso temporal del permanencia', value: '6' },
]

const endpoint = isEdit ? `/api/base/personas/${id}/actualizar/` : '/api/base/personas/crear/'

const fetchData = async () => {
  await handleAsync(async () => {
    // Para edición, usar el endpoint de detalle
    const response = await api.get(`/api/base/personas/${id}/`)
    const data = response.data

    // Mapear los datos de la API a nuestro formulario
    info.tipo_doc = data.tipo_doc
    info.documento = data.documento
    info.nombres = data.nombres
    info.apellidos = data.apellidos
    info.empresa = data.empresa || ''
    info.celular = data.celular
    info.email = data.email

    // Mapear asignaciones actuales al formato del formulario
    info.asignaciones_cargo =
      data.asignaciones_actuales?.map((asignacion) => ({
        id: asignacion.id,
        cargo: asignacion.cargo_id,
        oficina: asignacion.oficina_id,
        fecha_inicio: asignacion.fecha_inicio,
        es_responsable: Boolean(asignacion.es_responsable),
      })) || []

    // Si no hay asignaciones, agregar una vacía
    if (info.asignaciones_cargo.length === 0) {
      info.asignaciones_cargo.push({
        cargo: null,
        oficina: null,
        fecha_inicio: '',
        es_responsable: false,
      })
    }
  })
}

const preparePayload = () => {
  const payload = {
    tipo_doc: info.tipo_doc,
    documento: info.documento,
    nombres: info.nombres,
    apellidos: info.apellidos,
    empresa: info.empresa || '',
    celular: info.celular,
    email: info.email,
  }

  // Para creación, incluir datos de usuario
  if (!isEdit) {
    payload.username = info.documento
    payload.password = info.password
  }

  // Preparar asignaciones de cargo
  payload.asignaciones_cargo = info.asignaciones_cargo
    .filter((a) => a.cargo && a.oficina)
    .map((a) => ({
      ...(a.id ? { id: a.id } : {}), // Incluir ID si existe (para actualizar)
      cargo: a.cargo,
      oficina: a.oficina,
      fecha_inicio: a.fecha_inicio || null,
      es_responsable: Boolean(a.es_responsable),
    }))

  return payload
}

const validateForm = () => {
  // Validaciones personalizadas antes del envío
  if (!isEdit) {
    if (!passwordsMatch.value) {
      return { isValid: false, message: 'Las contraseñas no coinciden.' }
    }

    if (info.password === info.documento) {
      return {
        isValid: false,
        message: 'La contraseña no puede ser igual al número de documento.',
      }
    }
  }

  // Validar que tenga al menos una asignación válida
  const validAssignments = info.asignaciones_cargo.filter((a) => a.cargo && a.oficina)

  if (validAssignments.length === 0) {
    return {
      isValid: false,
      message: 'Debe asignar al menos un cargo y oficina.',
    }
  }

  return { isValid: true }
}

const submitForm = async () => {
  clearErrors()

  // Validaciones previas
  const validation = validateForm()
  if (!validation.isValid) {
    showErrorNotification(validation.message)
    return
  }

  const payload = preparePayload()

  try {
    await handleAsync(async () => {
      if (isEdit) {
        await api.put(endpoint, payload)
      } else {
        await api.post(endpoint, payload)
      }
    })

    // Si llegamos aquí, la operación fue exitosa
    showSuccessNotification(isEdit ? 'Persona modificada con éxito' : 'Persona guardada con éxito')
    router.push('/personas')
  } catch (error) {
    // El error ya fue manejado por useErrorHandler
    console.error('Error en submitForm:', error)
  }
}

if (isEdit) {
  onMounted(fetchData)
}
</script>
