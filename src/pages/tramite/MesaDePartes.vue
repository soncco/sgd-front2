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
            
            <q-select
              v-model="form.remitente_tipo_persona"
              :options="tiposPersonaOptions"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              outlined
              label="Tipo de Persona"
              dense
              required
              class="q-mb-md"
            />

            <q-select
              v-model="form.remitente_tipo_doc"
              :options="tiposDocOptions"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              outlined
              label="Tipo de Documento"
              dense
              required
              class="q-mb-md"
            />

            <q-input outlined v-model="form.remitente_nombres" label="Nombres" required class="q-mb-md" />
            <q-input outlined v-model="form.remitente_apellidos" label="Apellidos" required class="q-mb-md" />
            <q-input outlined v-model="form.remitente_documento" label="Número de documento" required class="q-mb-md" />
            <q-input outlined v-model="form.remitente_email" label="Correo electrónico" type="email" required class="q-mb-md" />
            <q-input
              outlined
              v-model="form.remitente_celular"
              label="Celular"
              type="tel"
              :rules="[val => /^\d{9}$/.test(val) || 'Debe tener 9 dígitos']"
              required
              class="q-mb-md"
            />

            <div class="q-mt-md">
              <q-btn label="Siguiente" type="submit" color="primary" />
            </div>
          </q-form>
        </q-step>
        <!-- Paso 2: Datos del Documento -->
        <q-step :name="2" title="Datos del Documento" icon="description" :done="step > 2">
          <q-form @submit.prevent="nextStep">
            <!-- q-select: emit-value hace que v-model guarde SOLO el id (valor numérico). -->
            <q-select
              v-model="form.tipo_documento"
              :options="tiposDocumentoOptions"
              option-value="id"
              option-label="nombre"
              emit-value
              map-options
              outlined
              label="Tipo de documento"
              dense
              required
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
            <!-- File uploader para múltiples archivos -->
            <q-file
              v-model="selectedFiles"
              label="Seleccionar archivos"
              multiple
              outlined
              use-chips
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt,.xlsx,.xls"
              counter
              max-files="10"
              max-file-size="10485760"
              @rejected="onRejectedFiles"
              @update:model-value="onFilesSelected"
            >
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
            </q-file>

            <!-- Lista de archivos agregados -->
            <div v-if="form.archivos.length > 0" class="q-mt-lg">
              <div class="text-subtitle1 q-mb-md">Archivos agregados:</div>
              <q-card v-for="(archivo, index) in form.archivos" :key="archivo.id" class="q-mb-sm">
                <q-card-section class="q-pa-sm">
                  <div class="row items-center">
                    <q-icon name="description" class="q-mr-sm" />
                    <div class="col">
                      <div class="text-body2">{{ archivo.file.name }}</div>
                      <div class="text-caption text-grey-6">
                        {{ formatFileSize(archivo.file.size) }} - {{ archivo.file.type || 'Tipo desconocido' }}
                      </div>
                    </div>
                    <q-btn 
                      flat 
                      round 
                      color="negative" 
                      icon="delete" 
                      size="sm"
                      @click="removeFile(index)"
                    />
                  </div>
                  <q-input 
                    v-model="archivo.descripcion" 
                    label="Descripción del archivo (opcional)" 
                    dense
                    outlined
                    class="q-mt-sm"
                  />
                </q-card-section>
              </q-card>
            </div>

            <!-- Información sobre límites -->
            <div class="q-mt-md text-caption text-grey-6">
              <div>• Máximo 10 archivos</div>
              <div>• Tamaño máximo por archivo: 10 MB</div>
              <div>• Formatos permitidos: PDF, JPG, PNG, DOC, DOCX, TXT, XLS, XLSX</div>
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
                <p><b>Tipo de Persona:</b> {{ tipoPersonaLabel }}</p>
                <p><b>Tipo de Documento:</b> {{ tipoDocLabel }}</p>
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
                <!-- mostramos el nombre usando computed tipoDocumentoNombre -->
                <p><b>Tipo:</b> {{ tipoDocumentoNombre }}</p>
                <p><b>Asunto:</b> {{ form.asunto }}</p>
              </q-card-section>
            </q-card>

            <q-card flat bordered>
              <q-card-section>
                <div class="text-h6">Archivos ({{ form.archivos.length }})</div>
                <div v-if="form.archivos.length > 0">
                  <div v-for="archivo in form.archivos" :key="archivo.id" class="q-mb-sm">
                    <q-card flat bordered class="bg-grey-1">
                      <q-card-section class="q-pa-sm">
                        <div class="row items-center">
                          <q-icon name="description" class="q-mr-sm text-primary" />
                          <div class="col">
                            <div class="text-body2">{{ archivo.file.name }}</div>
                            <div class="text-caption text-grey-6">
                            </div>
                            <div v-if="archivo.descripcion" class="text-caption q-mt-xs">
                              <strong>Descripción:</strong> {{ archivo.descripcion }}
                            </div>
                          </div>
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>
                <div v-else class="text-grey-6">
                  <q-icon name="info" class="q-mr-sm" />
                  No se adjuntaron archivos
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="q-mt-md flex justify-between">
            <q-btn flat label="Atrás" @click="prevStep" />
            <q-btn 
              label="Confirmar y Enviar" 
              color="positive" 
              @click="submitForm"
              :loading="submitting"
              :disable="submitting"
            />
          </div>
        </q-step>

      </q-stepper>
    </div>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { Notify } from 'quasar'
import { api } from 'src/boot/axios'
import PageTitle from 'src/components/PageTitle.vue'

const step = ref(1)
const fechaActual = ref(new Date().toISOString().split('T')[0])
const numeroExpediente = ref('Cargando...')
const submitting = ref(false)
const selectedFiles = ref([])

// tipos
const tiposDocumento = ref([])
const tiposDocumentoOptions = ref([])

const tiposPersonaOptions = ref([
  { value: '1', label: 'Persona natural' },
  { value: '2', label: 'Persona jurídica' }
])

const tiposDocOptions = ref([
  { value: '1', label: 'DNI' },
  { value: '2', label: 'RUC' },
  { value: '3', label: 'Carnet de extranjería' },
  { value: '4', label: 'Pasaporte' },
  { value: '5', label: 'Sin documento (Código temporal)' },
  { value: '6', label: 'Permiso temporal del permanencia' }
])

// Contador para IDs únicos de archivos
let fileIdCounter = 0

async function fetchNumeroExpediente() {
  try {
    const { data } = await api.get('/api/tramite/expedientes/next-number/')
    numeroExpediente.value = data.next_number || data
  } catch (error) {
    console.error(error)
    numeroExpediente.value = 'Error al cargar'
  }
}

async function fetchTiposDocumento() {
  try {
    const { data } = await api.get('/api/base/tipos-documento-publicos/')
    tiposDocumento.value = data.results || data
    tiposDocumentoOptions.value = data.results || data
    console.log('Tipos documento cargados:', tiposDocumento.value)
  } catch (error) {
    console.error('Error al cargar tipos de documento:', error)
  }
}

onMounted(() => {
  fetchNumeroExpediente()
  fetchTiposDocumento()
})

const form = reactive({
  remitente_nombres: '',
  remitente_apellidos: '',
  remitente_documento: '',
  remitente_email: '',
  remitente_celular: '',
  remitente_tipo_persona: '1', //  default Persona natural
  remitente_tipo_doc: '1',     // default DNI
  tipo_documento: null,       // aquí guardamos el ID 
  asunto: '',
  archivos: [] 
})

// computed para mostrar el nombre del tipo seleccionado
const tipoDocumentoNombre = computed(() => {
  if (!form.tipo_documento || !tiposDocumento.value.length) return 'No seleccionado'
  const t = tiposDocumento.value.find(x => x.id === form.tipo_documento)
  return t ? t.nombre : 'No encontrado'
})

const tipoPersonaLabel = computed(() => {
  const tipo = tiposPersonaOptions.value.find(x => x.value === form.remitente_tipo_persona)
  return tipo ? tipo.label : 'No seleccionado'
})

const tipoDocLabel = computed(() => {
  const tipo = tiposDocOptions.value.find(x => x.value === form.remitente_tipo_doc)
  return tipo ? tipo.label : 'No seleccionado'
})

// Función para formatear el tamaño del archivo
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Función para manejar archivos rechazados
function onRejectedFiles(rejectedEntries) {
  rejectedEntries.forEach(entry => {
    let message = `Archivo "${entry.file.name}" rechazado: `
    if (entry.failedPropValidation === 'max-file-size') {
      message += 'excede el tamaño máximo (10 MB)'
    } else if (entry.failedPropValidation === 'accept') {
      message += 'formato no permitido'
    } else if (entry.failedPropValidation === 'max-files') {
      message += 'se alcanzó el límite máximo de archivos'
    } else {
      message += 'no cumple con los requisitos'
    }
    
    Notify.create({
      type: 'negative',
      message: message,
      timeout: 4000
    })
  })
}

// Función para manejar cuando se seleccionan archivos 
function onFilesSelected(files) {
  if (!files || files.length === 0) {
    return
  }

  // Verificar límite total de archivos
  const totalFiles = form.archivos.length + files.length
  if (totalFiles > 10) {
    Notify.create({
      type: 'negative',
      message: `No puedes agregar más archivos. Límite máximo: 10 archivos (actualmente tienes ${form.archivos.length})`,
      timeout: 4000
    })
    // Limpiar la selección
    selectedFiles.value = []
    return
  }

  // Agregar cada archivo con un ID único y descripción vacía
  let addedCount = 0
  files.forEach(file => {
    // Verificar si el archivo ya existe (por nombre y tamaño)
    const exists = form.archivos.some(existing => 
      existing.file.name === file.name && existing.file.size === file.size
    )

    if (!exists) {
      form.archivos.push({
        id: ++fileIdCounter,
        file: file,
        descripcion: ''
      })
      addedCount++
    } else {
      Notify.create({
        type: 'warning',
        message: `El archivo "${file.name}" ya fue agregado`,
        timeout: 3000
      })
    }
  })

  // Limpiar la selección después de procesar
  selectedFiles.value = []

  if (addedCount > 0) {
    Notify.create({
      type: 'positive',
      message: `${addedCount} archivo(s) agregado(s) correctamente`,
      timeout: 2000
    })
  }
}

// Función para remover un archivo
function removeFile(index) {
  if (index >= 0 && index < form.archivos.length) {
    const fileName = form.archivos[index].file.name
    form.archivos.splice(index, 1)
    
    Notify.create({
      type: 'info',
      message: `Archivo "${fileName}" eliminado`,
      timeout: 2000
    })
  }
}

function nextStep() {
  if (step.value === 2) {
    if (!form.tipo_documento || !form.asunto || !form.asunto.trim()) {
      Notify.create({ type: 'negative', message: 'Por favor completa tipo de documento y asunto' })
      return
    }
  }
  step.value++
}

function prevStep() {
  step.value--
}

async function submitForm() {
  if (submitting.value) return
  
  try {
    submitting.value = true
    
    if (!form.tipo_documento || !form.asunto || !form.asunto.trim()) {
      Notify.create({ type: 'negative', message: 'Faltan campos requeridos (tipo y asunto)' })
      return
    }

    console.log('DEBUG antes de enviar:', { 
      tipo: form.tipo_documento, 
      asunto: form.asunto,
      archivos: form.archivos.length 
    })

    const fd = new FormData()

    // Remitente: (el backend lee estos campos y crea/recupera Persona automáticamente)
    fd.append('remitente_nombres', form.remitente_nombres.trim())
    fd.append('remitente_apellidos', form.remitente_apellidos.trim())
    fd.append('remitente_documento', form.remitente_documento.trim())
    fd.append('remitente_email', form.remitente_email.trim())
    fd.append('remitente_celular', form.remitente_celular.trim())
    fd.append('remitente_tipo_persona', form.remitente_tipo_persona) 
    fd.append('remitente_tipo_doc', form.remitente_tipo_doc)         


    // Documento: **clave exacta que espera el backend** -> 'documento[tipo]'
    fd.append('documento[tipo]', String(form.tipo_documento))
    fd.append('documento[asunto]', form.asunto.trim())

    // Archivos: lista, cada uno con su descripcion
    if (form.archivos && form.archivos.length > 0) {
      form.archivos.forEach((archivoObj, index) => {
        fd.append(`documento[archivos][${index}][archivo]`, archivoObj.file)
        fd.append(`documento[archivos][${index}][descripcion]`, archivoObj.descripcion || '')
      })
    }

    for (const pair of fd.entries()) {
      if (pair[1] instanceof File) {
        console.log('FormData =>', pair[0], `[File: ${pair[1].name}, ${pair[1].size} bytes]`)
      } else {
        console.log('FormData =>', pair[0], pair[1])
      }
    }

    const response = await api.post('/api/tramite/mesa-partes/', fd, {
      timeout: 10000, // 10 segundos para archivos grandes
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          console.log(`Upload Progress: ${percentCompleted}%`)
        }
      }
    })

    console.log('Respuesta:', response.data)
    Notify.create({ 
      type: 'positive', 
      message: `Documento registrado correctamente. ${form.archivos.length > 0 ? `Se subieron ${form.archivos.length} archivo(s).` : ''}`,
      timeout: 5000
    })
    
    resetForm()
    step.value = 1
    await fetchNumeroExpediente()
    
  } catch (error) {
    console.error('Error submit:', error)
    // procesar errores del backend para mostrarlos 
    let errorMessage = 'Error al registrar documento'
    
    if (error.code === 'ECONNABORTED') {
      errorMessage = 'Tiempo de espera agotado. Los archivos pueden ser demasiado grandes.'
    } else if (error.response?.data) {
      // Si es objeto, tratar de armar mensaje
      const d = error.response.data
      if (typeof d === 'object') {
        // priorizar errores dentro de documento
        if (d.documento) {
          const parts = []
          for (const k of Object.keys(d.documento)) {
            const v = d.documento[k]
            if (Array.isArray(v)) parts.push(`${k}: ${v.join('; ')}`)
            else parts.push(`${k}: ${JSON.stringify(v)}`)
          }
          if (parts.length) errorMessage += ': ' + parts.join(' | ')
          else errorMessage += ': ' + JSON.stringify(d)
        } else {
          errorMessage += ': ' + JSON.stringify(d)
        }
      } else {
        errorMessage += ': ' + String(d)
      }
    }
    
    Notify.create({ 
      type: 'negative', 
      message: errorMessage, 
      timeout: 8000,
      actions: [{
        label: 'Cerrar',
        color: 'white'
      }]
    })
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  Object.assign(form, {
    remitente_nombres: '',
    remitente_apellidos: '',
    remitente_documento: '',
    remitente_email: '',
    remitente_celular: '',
    remitente_tipo_persona: '1', // default
    remitente_tipo_doc: '1',     //  default

    tipo_documento: null,
    asunto: '',
    archivos: []
  })
  
  // Limpiar  la selección temporal
  selectedFiles.value = []
  fileIdCounter = 0
}
</script>