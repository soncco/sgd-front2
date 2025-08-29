<template>
  <q-page padding>
    <PageTitle title="Mesa de Partes" icon="assignment" />

    <div class="row justify-center q-mt-lg q-mb-md">
      <q-card flat bordered class="q-pa-md bg-grey-1" style="max-width: 600px; width: 100%;">
        <div class="row justify-around items-center">

          <div class="row items-center">
            <span class="text-subtitle1 text-bold q-mr-sm">Fecha :</span>
            <q-input
              v-model="fechaActual"
              outlined
              dense
              readonly
              style="max-width: 150px;"
              class="bg-grey-2"
            />
          </div>

          <div class="row items-center">
            <span class="text-subtitle1 text-bold q-mr-sm">Nro de Solicitud :</span>
            <q-input
              v-model="numeroExpediente"
              outlined
              dense
              readonly
              style="max-width: 150px;"
              class="bg-grey-2"
            />
          </div>
        </div>
      </q-card>
    </div>



    <div class="q-pa-md">
      <q-stepper v-model="step" flat animated header-nav color="primary">

        <!-- Paso 1: Datos del Remitente -->
        <q-step :name="1" title="Datos del Remitente" icon="person" :done="step > 1">
          <q-form @submit.prevent="nextStep">
            <q-input outlined v-model="form.remitente_nombres" label="Nombres" required />
            <q-input outlined v-model="form.remitente_apellidos" label="Apellidos" required />
            <q-input outlined v-model="form.remitente_documento" label="Documento de identidad" required />
            <q-input outlined v-model="form.remitente_email" label="Correo electrónico" type="email" required />
            <q-input
              outlined
              v-model="form.remitente_celular"
              label="Celular"
              type="tel"
              :rules="[val => /^\d{9}$/.test(val) || 'Debe tener 9 dígitos']"
              required
            />

            <div class="q-mt-md">
              <q-btn label="Siguiente" type="submit" color="primary" />
            </div>
          </q-form>
        </q-step>

        <!-- Paso 2: Datos del Documento -->
        <q-step :name="2" title="Datos del Documento" icon="description" :done="step > 2">
          <q-form @submit.prevent="nextStep">
            <APISelect
              v-model="form.tipo_documento"
              label="Tipo de documento"
              url="/api/base/tipos-documento/"
              field="nombre"
              option-value="id"
              option-label="nombre"
              dense
              required
              :emit-value="false"
              :map-options="true"
            />
            <q-input outlined v-model="form.asunto" label="Asunto" type="textarea" autogrow required />

            <div class="q-mt-md flex justify-between">
              <q-btn flat label="Atrás" @click="prevStep" />
              <q-btn label="Siguiente" type="submit" color="primary" />
            </div>
          </q-form>
        </q-step>

        <!-- Paso 3: Adjuntar archivos -->
        <q-step :name="3" title="Archivos" icon="attach_file" :done="step > 3">
          <q-form @submit.prevent="nextStep">
            <q-file
              v-model="form.archivos"
              label="Adjuntar archivos"
              multiple
              outlined
              use-chips
              accept=".pdf,.jpg,.png,.doc,.docx"
              counter
            />
            <div v-for="(f, i) in form.archivos" :key="i" class="q-mt-sm">
              <div class="text-caption">{{ f.name }} ({{ (f.size / 1024).toFixed(1) }} KB)</div>
              <q-input dense v-model="form.archivosDescripciones[i]" label="Descripción (opcional)" />
            </div>

            <div class="q-mt-md flex justify-between">
              <q-btn flat label="Atrás" @click="prevStep" />
              <q-btn label="Siguiente" type="submit" color="primary" />
            </div>
          </q-form>
        </q-step>

        <!-- Paso 4: Confirmación -->
        <q-step :name="4" title="Confirmación" icon="check_circle">
          <div class="q-gutter-md">
            <q-card flat bordered>
              <q-card-section>
                <div class="text-h6">Datos del Remitente</div>
                <p><b>Nombres:</b> {{ form.remitente_nombres }}</p>
                <p><b>Apellidos:</b> {{ form.remitente_apellidos }}</p>
                <p><b>DNI:</b> {{ form.remitente_documento }}</p>
                <p><b>Correo:</b> {{ form.remitente_email }}</p>
                <p><b>Celular:</b> {{ form.remitente_celular }}</p>
              </q-card-section>
            </q-card>

            <q-card flat bordered>
              <q-card-section>
                <div class="text-h6">Datos del Documento</div>
                <p><b>Tipo:</b> {{ form.tipo_documento?.nombre }} (ID: {{ form.tipo_documento?.id }})</p>
                <p><b>Asunto:</b> {{ form.asunto }}</p>
              </q-card-section>
            </q-card>

            <q-card flat bordered>
              <q-card-section>
                <div class="text-h6">Archivos</div>
                <div v-if="form.archivos.length">
                  <ul>
                    <li v-for="(file, i) in form.archivos" :key="i">
                      {{ file.name }} ({{ (file.size/1024).toFixed(1) }} KB) - 
                      {{ form.archivosDescripciones[i] || 'Sin descripción' }}
                    </li>
                  </ul>
                </div>
                <div v-else>
                  <p>No se adjuntaron archivos</p>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="q-mt-md flex justify-between">
            <q-btn flat label="Atrás" @click="prevStep" />
            <q-btn label="Confirmar y Enviar" color="positive" @click="submitForm" />
          </div>
        </q-step>

      </q-stepper>
    </div>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Notify } from 'quasar'
import { api } from 'src/boot/axios'
import PageTitle from 'src/components/PageTitle.vue'
import APISelect from 'src/components/APISelect.vue'

const step = ref(1)

const fechaActual = ref(new Date().toISOString().split('T')[0])

const numeroExpediente = ref('Cargando...')

async function fetchNumeroExpediente() {
  try {
    const { data } = await api.get('/api/tramite/expedientes/next-number/')
    numeroExpediente.value = data.next_number || data // depende de la respuesta de tu API
  } catch (error) {
    console.error(error)
    numeroExpediente.value = 'Error al cargar'
  }
}

onMounted(() => {
  fetchNumeroExpediente()
})

const form = reactive({
  remitente_nombres: '',
  remitente_apellidos: '',
  remitente_documento: '',
  remitente_email: '',
  remitente_celular: '',
  tipo_documento: null,
  asunto: '',
  archivos: [],
  archivosDescripciones: []
})

function nextStep() {
  step.value++
}
function prevStep() {
  step.value--
}

async function submitForm() {
  try {
    const fd = new FormData()

    // Remitente
    fd.append('remitente_nombres', form.remitente_nombres)
    fd.append('remitente_apellidos', form.remitente_apellidos)
    fd.append('remitente_documento', form.remitente_documento)
    fd.append('remitente_email', form.remitente_email)
    fd.append('remitente_celular', form.remitente_celular)

    // Documento
    fd.append('documento[tipo_documento]', form.tipo_documento?.id || '')
    fd.append('documento[asunto]', form.asunto)
    fd.append('documento[fecha_documento]', form.fecha_documento)

    // Archivos
    form.archivos.forEach((file, index) => {
      fd.append(`documento[archivos][${index}][archivo]`, file)
      fd.append(`documento[archivos][${index}][descripcion]`, form.archivosDescripciones[index] || '')
    })

    await api.post('/api/tramite/mesa-partes/', fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    Notify.create({ type: 'positive', message: 'Documento registrado correctamente' })
    resetForm()
    step.value = 1

    fetchNumeroExpediente()
  } catch (error) {
    console.error(error)
    Notify.create({ type: 'negative', message: 'Error al registrar documento' })
  }
}

function resetForm() {
  form.remitente_nombres = ''
  form.remitente_apellidos = ''
  form.remitente_documento = ''
  form.remitente_email = ''
  form.remitente_celular = ''
  form.tipo_documento = null
  form.fecha_documento = ''
  form.asunto = ''
  form.archivos = []
  form.archivosDescripciones = []
}
</script>
