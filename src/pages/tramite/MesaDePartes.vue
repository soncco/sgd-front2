<template>
  <q-page padding class="mesa-de-partes">
    <PageTitle title="Mesa de Partes" icon="assignment" class="q-mb-md" />

    <!-- Header info - responsive -->
    <div class="row justify-center q-mb-lg">
      <q-card flat bordered class="info-header q-pa-md bg-grey-1">
        <div class="row q-col-gutter-md justify-center items-center">
          <div class="col-12 col-sm-6 text-center">
            <div class="text-caption text-grey-7">Fecha</div>
            <div class="text-h6 text-primary">{{ fechaActual }}</div>
          </div>

          <div class="col-12 col-sm-6 text-center">
            <div class="text-caption text-grey-7">Nro de Solicitud</div>
            <div class="text-h6 text-primary">{{ numeroExpediente }}</div>
          </div>
        </div>
      </q-card>
    </div>

    <div class="form-container">
      <q-stepper v-model="step" flat animated header-nav color="primary" class="stepper-responsive">
        <!-- Paso 1: Datos del Remitente -->
        <q-step
          :name="1"
          title="Datos del Remitente"
          icon="person"
          :done="step > 1"
          :header-nav="step > 1"
        >
          <div class="step-content">
            <q-form @submit.prevent="validateAndNextStep(1)" class="q-gutter-md">
              <!-- Tipo de Persona -->
              <q-select
                v-model="form.remitente_tipo_persona"
                :options="tiposPersonaOptions"
                option-value="value"
                option-label="label"
                emit-value
                map-options
                outlined
                label="Tipo de Persona *"
                dense
                :rules="[validationRules.required('Tipo de persona es requerido')]"
                :error="hasFieldError('remitente_tipo_persona')"
                :error-message="getFieldError('remitente_tipo_persona')"
                class="q-mb-md"
              >
                <template v-slot:prepend>
                  <q-icon name="business" />
                </template>
              </q-select>

              <!-- Tipo de Documento -->
              <q-select
                v-model="form.remitente_tipo_doc"
                :options="tiposDocOptions"
                option-value="value"
                option-label="label"
                emit-value
                map-options
                outlined
                label="Tipo de Documento *"
                dense
                :rules="[validationRules.required('Tipo de documento es requerido')]"
                :error="hasFieldError('remitente_tipo_doc')"
                :error-message="getFieldError('remitente_tipo_doc')"
                class="q-mb-md"
              >
                <template v-slot:prepend>
                  <q-icon name="badge" />
                </template>
              </q-select>

              <!-- Documento de Identidad -->
              <q-input
                outlined
                v-model="form.remitente_documento"
                label="Documento de Identidad *"
                :rules="getDocumentValidationRules()"
                :error="hasFieldError('remitente_documento')"
                :error-message="getFieldError('remitente_documento')"
                :mask="getDocumentMask()"
                :hint="getDocumentHint()"
                class="q-mb-md"
              >
                <template v-slot:prepend>
                  <q-icon name="credit_card" />
                </template>
              </q-input>

              <!-- Nombres -->
              <q-input
                outlined
                v-model="form.remitente_nombres"
                label="Nombres *"
                :rules="[
                  validationRules.required('Nombres son requeridos'),
                  validationRules.minLength(2, 'Mínimo 2 caracteres'),
                  validationRules.maxLength(100, 'Máximo 100 caracteres'),
                ]"
                :error="hasFieldError('remitente_nombres')"
                :error-message="getFieldError('remitente_nombres')"
                counter
                maxlength="100"
                class="q-mb-md"
              >
                <template v-slot:prepend>
                  <q-icon name="person" />
                </template>
              </q-input>

              <!-- Apellidos -->
              <q-input
                outlined
                v-model="form.remitente_apellidos"
                label="Apellidos *"
                :rules="[
                  validationRules.required('Apellidos son requeridos'),
                  validationRules.minLength(2, 'Mínimo 2 caracteres'),
                  validationRules.maxLength(100, 'Máximo 100 caracteres'),
                ]"
                :error="hasFieldError('remitente_apellidos')"
                :error-message="getFieldError('remitente_apellidos')"
                counter
                maxlength="100"
                class="q-mb-md"
              >
                <template v-slot:prepend>
                  <q-icon name="person_outline" />
                </template>
              </q-input>

              <!-- Correo Electrónico -->
              <q-input
                outlined
                v-model="form.remitente_email"
                label="Correo Electrónico *"
                type="email"
                :rules="[
                  validationRules.required('Correo electrónico es requerido'),
                  validationRules.email('Formato de correo inválido'),
                ]"
                :error="hasFieldError('remitente_email')"
                :error-message="getFieldError('remitente_email')"
                class="q-mb-md"
              >
                <template v-slot:prepend>
                  <q-icon name="email" />
                </template>
                <template v-slot:hint>
                  <q-icon name="info" size="xs" class="q-mr-xs" />
                  Se enviará una copia del trámite a este correo
                </template>
              </q-input>

              <!-- Celular -->
              <q-input
                outlined
                v-model="form.remitente_celular"
                label="Celular *"
                type="tel"
                :rules="[
                  validationRules.required('Número de celular es requerido'),
                  validationRules.phone('Formato de celular inválido'),
                ]"
                :error="hasFieldError('remitente_celular')"
                :error-message="getFieldError('remitente_celular')"
                mask="### ### ###"
                hint="Ejemplo: 987 654 321"
                class="q-mb-md"
              >
                <template v-slot:prepend>
                  <q-icon name="phone" />
                </template>
              </q-input>

              <!-- Botones -->
              <div class="row justify-end q-mt-lg">
                <q-btn
                  label="Siguiente"
                  type="submit"
                  color="primary"
                  icon-right="arrow_forward"
                  :loading="isLoading('step1')"
                  class="q-px-xl"
                />
              </div>
            </q-form>
          </div>
        </q-step>

        <!-- Paso 2: Tipo de Trámite -->
        <q-step
          :name="2"
          title="Tipo de Trámite"
          icon="assignment"
          :done="step > 2"
          :header-nav="step > 2"
        >
          <div class="step-content">
            <q-form @submit.prevent="validateAndNextStep(2)" class="q-gutter-md">
              <!-- Checkbox para otros trámites -->
              <q-checkbox
                v-model="form.esOtroTramite"
                color="primary"
                label="Es un trámite que no está en el TUPA (otros trámites)"
                class="q-mb-md"
              />

              <!-- Selección de TUPA (solo si no es otro trámite) -->
              <div v-if="!form.esOtroTramite">
                <APISelect
                  v-model="form.tupa"
                  url="/api/base/tupas/"
                  field="denominacion"
                  label="Seleccionar TUPA *"
                  :rules="[validationRules.required('TUPA es requerido')]"
                  :error="hasFieldError('tupa')"
                  :error-message="getFieldError('tupa')"
                  :return-object="true"
                  class="q-mb-md"
                  @update:model-value="onTupaSelected"
                >
                  <template v-slot:prepend>
                    <q-icon name="assignment" />
                  </template>
                </APISelect>

                <!-- Información del TUPA seleccionado -->
                <div v-if="selectedTupaInfo" class="q-mb-lg">
                  <q-card flat bordered class="bg-blue-1">
                    <q-card-section>
                      <div class="text-h6 text-primary q-mb-md">
                        <q-icon name="info" class="q-mr-sm" />
                        Información del Trámite
                      </div>

                      <div class="q-mb-md">
                        <div class="text-subtitle2 text-grey-8">Descripción:</div>
                        <div class="text-body2">{{ selectedTupaInfo.descripcion }}</div>
                      </div>

                      <div v-if="selectedTupaInfo.requisitos" class="q-mb-md">
                        <div class="text-subtitle2 text-grey-8 q-mb-sm">Requisitos:</div>
                        <div class="text-body2 whitespace-pre-line">
                          {{ selectedTupaInfo.requisitos }}
                        </div>
                      </div>

                      <div v-if="selectedTupaInfo.unidad_organizativa_nombre">
                        <div class="text-subtitle2 text-grey-8">Unidad Organizativa:</div>
                        <div class="text-body2">
                          {{ selectedTupaInfo.unidad_organizativa_nombre }}
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>

              <!-- Campos tradicionales (solo si es otro trámite) -->
              <div v-if="form.esOtroTramite">
                <!-- Tipo de Documento -->
                <APISelect
                  v-model="form.documento.tipo"
                  url="/api/base/tipos_documento_publicos/"
                  field="nombre"
                  label="Tipo de Documento *"
                  :rules="[validationRules.required('Tipo de documento es requerido')]"
                  :error="hasFieldError('documento.tipo')"
                  :error-message="getFieldError('documento.tipo')"
                  class="q-mb-md"
                >
                  <template v-slot:prepend>
                    <q-icon name="description" />
                  </template>
                </APISelect>

                <!-- Asunto -->
                <q-input
                  outlined
                  v-model="form.documento.asunto"
                  label="Asunto *"
                  type="textarea"
                  autogrow
                  :rules="[
                    validationRules.required('Asunto es requerido'),
                    validationRules.minLength(10, 'Mínimo 10 caracteres'),
                    validationRules.maxLength(255, 'Máximo 255 caracteres'),
                  ]"
                  :error="hasFieldError('documento.asunto')"
                  :error-message="getFieldError('documento.asunto')"
                  counter
                  maxlength="255"
                  class="q-mb-md"
                  hint="Descripción breve y clara del motivo de su solicitud"
                >
                  <template v-slot:prepend>
                    <q-icon name="subject" />
                  </template>
                </q-input>
              </div>

              <!-- Resumen/Detalle (siempre visible) -->
              <q-input
                outlined
                v-model="form.documento.resumen"
                label="Detalle de la Solicitud"
                type="textarea"
                autogrow
                :rules="[validationRules.maxLength(1000, 'Máximo 1000 caracteres')]"
                :error="hasFieldError('documento.resumen')"
                :error-message="getFieldError('documento.resumen')"
                counter
                maxlength="1000"
                class="q-mb-md"
                hint="Información adicional o detalle de su solicitud (opcional)"
              >
                <template v-slot:prepend>
                  <q-icon name="notes" />
                </template>
              </q-input>

              <!-- Botones -->
              <div class="row justify-between q-mt-lg">
                <q-btn
                  label="Anterior"
                  @click="step = 1"
                  color="grey-7"
                  outline
                  icon="arrow_back"
                  class="q-px-xl"
                />
                <q-btn
                  label="Siguiente"
                  type="submit"
                  color="primary"
                  icon-right="arrow_forward"
                  :loading="isLoading('step2')"
                  class="q-px-xl"
                />
              </div>
            </q-form>
          </div>
        </q-step>

        <!-- Paso 3: Archivos -->
        <q-step
          :name="3"
          title="Documentos Adjuntos"
          icon="attach_file"
          :done="step > 3"
          :header-nav="step > 3"
        >
          <div class="step-content">
            <q-form @submit.prevent="validateAndNextStep(3)" class="q-gutter-md">
              <!-- Archivo Principal -->
              <div class="q-mb-lg">
                <div class="text-h6 q-mb-md">
                  <q-icon name="description" class="q-mr-sm" />
                  Documento Principal *
                </div>
                <q-file
                  v-model="form.documento_principal"
                  outlined
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  max-file-size="10485760"
                  :rules="[
                    validationRules.required('Documento principal es requerido'),
                    tramiteRules.archivosTramite,
                  ]"
                  :error="hasFieldError('documento_principal')"
                  :error-message="getFieldError('documento_principal')"
                  hint="Formato: PDF, Word, Imagen. Tamaño máximo: 10MB"
                  class="q-mb-md"
                >
                  <template v-slot:prepend>
                    <q-icon name="cloud_upload" />
                  </template>
                </q-file>
              </div>

              <!-- Archivos Adicionales -->
              <div class="q-mb-lg">
                <div class="text-h6 q-mb-md">
                  <q-icon name="attachment" class="q-mr-sm" />
                  Documentos Adicionales (Opcional)
                </div>
                <q-file
                  v-model="form.documento.archivos"
                  outlined
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  max-file-size="10485760"
                  :rules="[tramiteRules.archivosTramite]"
                  :error="hasFieldError('documento.archivos')"
                  :error-message="getFieldError('documento.archivos')"
                  hint="Puede adjuntar varios archivos. Formato: PDF, Word, Imagen. Tamaño máximo por archivo: 10MB"
                  class="q-mb-md"
                >
                  <template v-slot:prepend>
                    <q-icon name="add_circle" />
                  </template>
                </q-file>

                <!-- Lista de archivos seleccionados -->
                <div v-if="form.documento.archivos?.length" class="q-mt-md">
                  <div class="text-subtitle2 q-mb-sm">Archivos seleccionados:</div>
                  <div
                    v-for="(file, index) in form.documento.archivos"
                    :key="index"
                    class="file-item q-mb-sm"
                  >
                    <q-card flat bordered class="q-pa-sm">
                      <div class="row items-center">
                        <q-icon name="description" class="q-mr-sm text-primary" />
                        <div class="col">
                          <div class="text-body2">{{ file.name }}</div>
                          <div class="text-caption text-grey">
                            {{ formatFileSize(file.size) }}
                          </div>
                        </div>
                      </div>
                      <!-- Descripción del archivo -->
                      <q-input
                        v-model="form.archivosDescripciones[index]"
                        label="Descripción (opcional)"
                        dense
                        outlined
                        class="q-mt-sm"
                        maxlength="100"
                        hint="Breve descripción del contenido de este archivo"
                      />
                    </q-card>
                  </div>
                </div>
              </div>

              <!-- Términos y condiciones -->
              <div class="q-mb-lg">
                <q-checkbox
                  v-model="form.acceptTerms"
                  color="primary"
                  :rules="[(val) => val === true || 'Debe aceptar los términos y condiciones']"
                  class="q-mb-md"
                >
                  <div class="q-ml-sm">
                    He leído y acepto los
                    <a href="#" class="text-primary" @click.prevent="showTermsDialog = true">
                      términos y condiciones
                    </a>
                    *
                  </div>
                </q-checkbox>
              </div>

              <!-- Botones finales -->
              <div class="row justify-between q-mt-lg">
                <q-btn
                  label="Anterior"
                  @click="step = 2"
                  color="grey-7"
                  outline
                  icon="arrow_back"
                  class="q-px-xl"
                />
                <q-btn
                  label="Siguiente"
                  type="submit"
                  color="primary"
                  icon-right="arrow_forward"
                  :loading="isLoading('step3')"
                  class="q-px-xl"
                />
              </div>
            </q-form>
          </div>
        </q-step>

        <!-- Paso 4: Confirmación -->
        <q-step :name="4" title="Confirmación" icon="check_circle" :done="step > 4">
          <div class="step-content">
            <div class="text-h6 q-mb-lg text-center text-primary">
              <q-icon name="assignment_turned_in" size="sm" class="q-mr-sm" />
              Confirmar Envío del Trámite
            </div>

            <!-- Resumen del trámite -->
            <div class="q-gutter-md">
              <!-- Datos del remitente -->
              <q-card flat bordered class="q-mb-md">
                <q-card-section>
                  <div class="text-h6 text-primary q-mb-md">
                    <q-icon name="person" class="q-mr-sm" />
                    Datos del Remitente
                  </div>
                  <div class="row q-gutter-sm">
                    <div class="col-12 col-md-6">
                      <div class="text-caption text-grey-7">Nombres y Apellidos</div>
                      <div class="text-body1">
                        {{ form.remitente_nombres }} {{ form.remitente_apellidos }}
                      </div>
                    </div>
                    <div class="col-12 col-md-6">
                      <div class="text-caption text-grey-7">Documento</div>
                      <div class="text-body1">{{ form.remitente_documento }}</div>
                    </div>
                    <div class="col-12 col-md-6">
                      <div class="text-caption text-grey-7">Correo Electrónico</div>
                      <div class="text-body1">{{ form.remitente_email }}</div>
                    </div>
                    <div class="col-12 col-md-6">
                      <div class="text-caption text-grey-7">Celular</div>
                      <div class="text-body1">{{ form.remitente_celular }}</div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <!-- Datos del documento/trámite -->
              <q-card flat bordered class="q-mb-md">
                <q-card-section>
                  <div class="text-h6 text-primary q-mb-md">
                    <q-icon name="assignment" class="q-mr-sm" />
                    Datos del Trámite
                  </div>

                  <!-- Si es TUPA -->
                  <div v-if="!form.esOtroTramite && selectedTupaInfo">
                    <div class="row q-gutter-sm">
                      <div class="col-12">
                        <div class="text-caption text-grey-7">Trámite TUPA</div>
                        <div class="text-body1 text-weight-medium">
                          {{ selectedTupaInfo.denominacion }}
                        </div>
                      </div>
                      <div class="col-12" v-if="selectedTupaInfo.descripcion">
                        <div class="text-caption text-grey-7">Descripción</div>
                        <div class="text-body2">{{ selectedTupaInfo.descripcion }}</div>
                      </div>
                      <div class="col-12" v-if="selectedTupaInfo.unidad_organizativa_nombre">
                        <div class="text-caption text-grey-7">Unidad Organizativa</div>
                        <div class="text-body2">
                          {{ selectedTupaInfo.unidad_organizativa_nombre }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Si es otro trámite -->
                  <div v-else>
                    <div class="row q-gutter-sm">
                      <div class="col-12">
                        <div class="text-caption text-grey-7">Tipo</div>
                        <div class="text-body1">Otros Trámites</div>
                      </div>
                      <div class="col-12" v-if="form.documento?.tipo?.nombre">
                        <div class="text-caption text-grey-7">Tipo de Documento</div>
                        <div class="text-body1">{{ form.documento.tipo.nombre }}</div>
                      </div>
                      <div class="col-12" v-if="form.documento?.asunto">
                        <div class="text-caption text-grey-7">Asunto</div>
                        <div class="text-body1">{{ form.documento.asunto }}</div>
                      </div>
                    </div>
                  </div>

                  <!-- Detalle común -->
                  <div v-if="form.documento?.resumen" class="q-mt-md">
                    <div class="text-caption text-grey-7">Detalle de la Solicitud</div>
                    <div class="text-body2">{{ form.documento.resumen }}</div>
                  </div>
                </q-card-section>
              </q-card>

              <!-- Archivos adjuntos -->
              <q-card flat bordered class="q-mb-md">
                <q-card-section>
                  <div class="text-h6 text-primary q-mb-md">
                    <q-icon name="attach_file" class="q-mr-sm" />
                    Documentos Adjuntos
                  </div>

                  <!-- Documento principal -->
                  <div v-if="form.documento_principal" class="q-mb-md">
                    <div class="text-subtitle2 q-mb-sm">Documento Principal:</div>
                    <q-chip icon="description" color="primary" text-color="white">
                      {{ form.documento_principal.name }}
                      <q-tooltip>{{ formatFileSize(form.documento_principal.size) }}</q-tooltip>
                    </q-chip>
                  </div>

                  <!-- Documentos adicionales -->
                  <div v-if="form.documento?.archivos?.length">
                    <div class="text-subtitle2 q-mb-sm">Documentos Adicionales:</div>
                    <div class="q-gutter-xs">
                      <q-chip
                        v-for="(file, index) in form.documento.archivos"
                        :key="index"
                        icon="attachment"
                        color="secondary"
                        text-color="white"
                      >
                        {{ file.name }}
                        <q-tooltip>{{ formatFileSize(file.size) }}</q-tooltip>
                      </q-chip>
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <!-- Aviso importante -->
              <q-banner class="bg-orange-1 text-orange-8 q-mb-md" rounded>
                <template v-slot:avatar>
                  <q-icon name="warning" />
                </template>
                <div class="text-body2">
                  <strong>Importante:</strong> Una vez enviado el trámite, recibirá un código de
                  seguimiento en su correo electrónico. Guárdelo para hacer seguimiento de su
                  solicitud.
                </div>
              </q-banner>

              <!-- Botones -->
              <div class="row justify-between q-mt-lg">
                <q-btn
                  label="Anterior"
                  @click="step = 3"
                  color="grey-7"
                  outline
                  icon="arrow_back"
                  class="q-px-xl"
                />
                <q-btn
                  label="Enviar Trámite"
                  @click="submitForm"
                  color="positive"
                  icon-right="send"
                  :loading="isLoading('submit')"
                  class="q-px-xl text-weight-bold"
                />
              </div>
            </div>
          </div>
        </q-step>
      </q-stepper>
    </div>

    <!-- Diálogo de términos y condiciones -->
    <q-dialog v-model="showTermsDialog" maximized>
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Términos y Condiciones</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <!-- Aquí iría el contenido de términos y condiciones -->
          <div class="text-body1">
            <p>Al utilizar este servicio de mesa de partes digital, usted acepta:</p>
            <ul>
              <li>Proporcionar información veraz y exacta</li>
              <li>Adjuntar solo documentos legítimos y necesarios</li>
              <li>Respetar los tiempos de respuesta establecidos</li>
              <li>No utilizar el sistema para fines ilícitos</li>
            </ul>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Aceptar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Diálogo de confirmación de envío -->
    <q-dialog v-model="showSuccessDialog" persistent>
      <q-card class="q-pa-lg text-center">
        <q-card-section>
          <q-icon name="check_circle" color="positive" size="64px" />
          <div class="text-h5 text-bold text-positive q-mt-md">¡Trámite Enviado!</div>
          <div class="text-subtitle1 q-mt-md">Su número de expediente es:</div>
          <div class="text-h4 text-primary q-mt-sm q-pa-md bg-grey-1 rounded-borders">
            {{ expedienteGenerado }}
          </div>
          <div class="text-body2 text-grey-7 q-mt-md">
            Conserve este número para realizar el seguimiento de su trámite
          </div>
        </q-card-section>

        <q-card-actions align="center" class="q-pt-none">
          <q-btn label="Nuevo Trámite" color="primary" @click="resetForm" />
          <q-btn label="Seguimiento" color="secondary" outline @click="goToSeguimiento" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { useErrorHandler } from 'src/composables/useErrorHandler'
import { useValidation } from 'src/composables/useValidation'
import { useLoading } from 'src/composables/useLoading'
import PageTitle from 'src/components/PageTitle.vue'
import APISelect from 'src/components/APISelect.vue'

const router = useRouter()
const $q = useQuasar()

// Composables
const { hasFieldError, getFieldError, setErrors, clearErrors } = useErrorHandler()

const { rules: validationRules, tramiteRules } = useValidation()

const { isLoading, withSaving, withDataLoading } = useLoading()

// Estado reactivo
const step = ref(1)
const showTermsDialog = ref(false)
const showSuccessDialog = ref(false)
const expedienteGenerado = ref('')

// Fechas y números
const fechaActual = ref(new Date().toLocaleDateString('es-PE'))
const numeroExpediente = ref('Cargando...')

// Variables para TUPA
const selectedTupaInfo = ref(null)

// Datos del formulario
const form = reactive({
  remitente_tipo_persona: '1', // Persona natural por defecto
  remitente_tipo_doc: '1', // DNI por defecto
  remitente_nombres: '',
  remitente_apellidos: '',
  remitente_documento: '',
  remitente_email: '',
  remitente_celular: '',
  esOtroTramite: false, // Para controlar si es TUPA o trámite libre
  tupa: null, // Para almacenar el TUPA seleccionado
  documento: {
    tipo: null,
    asunto: '',
    resumen: '',
    archivos: null,
  },
  documento_principal: null,
  archivosDescripciones: [],
  acceptTerms: false,
})

// Opciones para selects
const tiposPersonaOptions = [
  { value: '1', label: 'Persona Natural' },
  { value: '2', label: 'Persona Jurídica' },
]

const tiposDocOptions = [
  { value: '1', label: 'DNI' },
  { value: '4', label: 'Carnet de Extranjería' },
  { value: '6', label: 'RUC' },
  { value: '7', label: 'Pasaporte' },
]

// Computed properties para validación dinámica
const getDocumentValidationRules = () => {
  const rules = [validationRules.required('Documento de identidad es requerido')]

  if (form.remitente_tipo_doc === '1') {
    rules.push(validationRules.dni())
  } else if (form.remitente_tipo_doc === '6') {
    rules.push(validationRules.ruc())
  }

  return rules
}

const getDocumentMask = () => {
  if (form.remitente_tipo_doc === '1') return '########'
  if (form.remitente_tipo_doc === '6') return '###########'
  return null
}

const getDocumentHint = () => {
  if (form.remitente_tipo_doc === '1') return 'DNI debe tener 8 dígitos'
  if (form.remitente_tipo_doc === '6') return 'RUC debe tener 11 dígitos'
  return ''
}

// Métodos
const fetchNextNumber = async () => {
  try {
    const { data } = await withDataLoading(() => api.get('/api/tramite/expedientes/next_number/'), {
      message: 'Obteniendo número de expediente...',
    })
    numeroExpediente.value = data.next_number || 'N/A'
  } catch (error) {
    console.error('Error al obtener número de expediente:', error)
    numeroExpediente.value = 'Error'
  }
}

const validateAndNextStep = (currentStep) => {
  clearErrors()

  try {
    // Validar paso actual antes de continuar (solo validación client-side)
    if (currentStep === 1) {
      validateStep1()
    } else if (currentStep === 2) {
      validateStep2()
    } else if (currentStep === 3) {
      validateStep3()
    }

    // Si llegó hasta aquí, no hay errores
    step.value++
  } catch (error) {
    // Mostrar error usando el sistema de notificaciones
    $q.notify({
      type: 'negative',
      message: error.message || 'Error de validación',
      position: 'top',
    })
  }
}

const validateStep1 = () => {
  // Aquí podrías agregar validación adicional del lado del servidor si es necesario
  return Promise.resolve()
}

const validateStep2 = () => {
  // Validar según el tipo de trámite
  if (!form.esOtroTramite && !form.tupa) {
    throw new Error('Debe seleccionar un TUPA')
  }

  if (form.esOtroTramite) {
    if (!form.documento.tipo) {
      throw new Error('Debe seleccionar un tipo de documento')
    }
    if (!form.documento.asunto || form.documento.asunto.trim().length < 10) {
      throw new Error('El asunto debe tener al menos 10 caracteres')
    }
  }

  return Promise.resolve()
}

// Método para manejar selección de TUPA
const onTupaSelected = (tupaData) => {
  selectedTupaInfo.value = tupaData
}

// Validación paso 3
const validateStep3 = () => {
  // Validar archivo principal requerido
  if (!form.documento_principal) {
    throw new Error('Debe adjuntar el documento principal')
  }

  // Validar términos y condiciones
  if (!form.acceptTerms) {
    throw new Error('Debe aceptar los términos y condiciones para continuar')
  }

  return Promise.resolve()
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const submitForm = async () => {
  try {
    const formData = new FormData()

    // Datos del remitente
    formData.append('remitente_nombres', form.remitente_nombres)
    formData.append('remitente_apellidos', form.remitente_apellidos)
    formData.append('remitente_documento', form.remitente_documento)
    formData.append('remitente_tipo_doc', form.remitente_tipo_doc)
    formData.append('remitente_tipo_persona', form.remitente_tipo_persona)
    formData.append('remitente_email', form.remitente_email)
    formData.append('remitente_celular', form.remitente_celular)

    // Datos del documento según el tipo de trámite
    if (form.esOtroTramite) {
      // Para otros trámites, usar el método tradicional
      formData.append('documento[tipo]', form.documento.tipo)
      formData.append('documento[asunto]', form.documento.asunto)
    } else {
      // Para TUPA, usar tupa_id
      formData.append('tupa_id', form.tupa.id)
    }

    // Campos comunes
    formData.append('documento[resumen]', form.documento.resumen || '')
    formData.append('documento[es_informativo]', 'false')

    // Archivo principal
    if (form.documento_principal) {
      formData.append('documento_principal', form.documento_principal)
    }

    // Archivos adicionales
    if (form.documento.archivos) {
      form.documento.archivos.forEach((file, index) => {
        formData.append(`documento[archivos][${index}][archivo]`, file)
        formData.append(
          `documento[archivos][${index}][descripcion]`,
          form.archivosDescripciones[index] || '',
        )
      })
    }

    const result = await withSaving(
      () =>
        api.post('/api/tramite/mesa_partes/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        }),
      'Enviando trámite...',
    )

    expedienteGenerado.value = result.data.expediente
    showSuccessDialog.value = true
  } catch (error) {
    setErrors(error)
  }
}

const resetForm = () => {
  // Reset del formulario
  Object.assign(form, {
    remitente_tipo_persona: '1',
    remitente_tipo_doc: '1',
    remitente_nombres: '',
    remitente_apellidos: '',
    remitente_documento: '',
    remitente_email: '',
    remitente_celular: '',
    esOtroTramite: false,
    tupa: null,
    documento: {
      tipo: null,
      asunto: '',
      resumen: '',
      archivos: null,
    },
    documento_principal: null,
    archivosDescripciones: [],
    acceptTerms: false,
  })

  selectedTupaInfo.value = null
  step.value = 1
  showSuccessDialog.value = false
  clearErrors()
  fetchNextNumber()
}

const goToSeguimiento = () => {
  showSuccessDialog.value = false
  router.push('/seguimiento-publico')
}

// Lifecycle
onMounted(() => {
  fetchNextNumber()
})
</script>

<style lang="scss" scoped>
.mesa-de-partes {
  max-width: 1200px;
  margin: 0 auto;
}

.info-header {
  max-width: 600px;
  width: 100%;
}

.form-container {
  max-width: 800px;
  margin: 0 auto;
}

.stepper-responsive {
  .q-stepper__header {
    @media (max-width: 768px) {
      .q-stepper__tab {
        padding: 12px 8px;
        min-width: auto;
      }

      .q-stepper__label {
        font-size: 0.75rem;
      }
    }
  }
}

.step-content {
  padding: 1rem 0;

  @media (max-width: 768px) {
    padding: 0.5rem 0;
  }
}

.file-item {
  .q-card {
    border: 1px dashed #e0e0e0;
    transition: border-color 0.3s;

    &:hover {
      border-color: #1976d2;
    }
  }
}

// Mejoras mobile-first
@media (max-width: 768px) {
  .mesa-de-partes {
    padding: 0.5rem;
  }

  .info-header {
    .text-h6 {
      font-size: 1.1rem;
    }
  }

  .form-container {
    .q-stepper {
      box-shadow: none;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
    }
  }

  .q-btn {
    &.q-px-xl {
      padding-left: 1rem !important;
      padding-right: 1rem !important;
    }
  }
}

// Animaciones suaves
.q-stepper__step {
  transition: all 0.3s ease;
}

.file-item {
  animation: fadeInUp 0.3s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Clases de utilidad
.whitespace-pre-line {
  white-space: pre-line;
}
</style>
