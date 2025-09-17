<template>
  <div class="row q-col-gutter-sm">
    <div class="col-6">
      <q-input
        v-model="fromDisplay"
        :label="fromLabel"
        outlined
        dense
        mask="##/##/####"
        placeholder="DD/MM/YYYY"
        @input="onFromChange"
      >
        <template #append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date v-model="fromCalendar" :locale="myLocale" @update:modelValue="onFromSelected">
                <div class="row items-center justify-end q-pa-sm">
                  <q-btn v-close-popup label="Cerrar" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
    </div>
    <div class="col-6">
      <q-input
        v-model="toDisplay"
        :label="toLabel"
        outlined
        dense
        mask="##/##/####"
        placeholder="DD/MM/YYYY"
        @input="onToChange"
      >
        <template #append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date v-model="toCalendar" :locale="myLocale" @update:modelValue="onToSelected">
                <div class="row items-center justify-end q-pa-sm">
                  <q-btn v-close-popup label="Cerrar" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const model = defineModel({
  type: Object,
  default: () => ({ from: null, to: null }),
})

const props = defineProps({
  label: { type: String, default: 'Rango de fechas' },
  fromLabel: { type: String, default: 'Desde' },
  toLabel: { type: String, default: 'Hasta' },
  datetime: { type: Boolean, default: false },
})

const fromDisplay = ref('')
const toDisplay = ref('')
const fromCalendar = ref('')
const toCalendar = ref('')

const myLocale = {
  days: 'Domingo_Lunes_Martes_Miércoles_Jueves_Viernes_Sábado'.split('_'),
  daysShort: 'Dom_Lun_Mar_Mié_Jue_Vie_Sáb'.split('_'),
  months:
    'Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre'.split(
      '_',
    ),
  monthsShort: 'Ene_Feb_Mar_Abr_May_Jun_Jul_Ago_Sep_Oct_Nov_Dic'.split('_'),
  firstDayOfWeek: 1,
  format24h: true,
  pluralDay: 'días',
}

// Funciones helper
const formatToDisplay = (iso) => {
  if (!iso) return ''
  // Extraer solo la fecha de un string ISO que puede incluir hora
  const dateOnly = iso.includes('T') ? iso.split('T')[0] : iso
  const [y, m, d] = dateOnly.split('-')
  return `${d}/${m}/${y}`
}

const formatToISOWithTime = (dateStr, isEndDate = false) => {
  if (!dateStr) return null

  const [y, m, d] = dateStr.split('/')
  const date = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`

  if (props.datetime) {
    // Crear fecha con hora, sin zona horaria (el backend la maneja)
    const time = isEndDate ? '23:59:59' : '00:00:00'
    return `${date}T${time}`
  }

  return date
}

const parseDisplayDate = (str) => {
  if (!str || str.length < 10) return null
  const [dd, mm, yyyy] = str.split('/')
  if (!dd || !mm || !yyyy || yyyy.length !== 4) return null
  const dateStr = `${yyyy}/${mm.padStart(2, '0')}/${dd.padStart(2, '0')}`
  return dateStr
}

// Watch para sincronizar modelo con displays
watch(
  () => model.value,
  (newVal) => {
    fromDisplay.value = newVal?.from ? formatToDisplay(newVal.from) : ''
    toDisplay.value = newVal?.to ? formatToDisplay(newVal.to) : ''

    // Para el calendario, extraer solo la fecha sin hora
    const fromDate = newVal?.from
      ? newVal.from.includes('T')
        ? newVal.from.split('T')[0]
        : newVal.from
      : ''
    const toDate = newVal?.to ? (newVal.to.includes('T') ? newVal.to.split('T')[0] : newVal.to) : ''

    fromCalendar.value = fromDate ? fromDate.replaceAll('-', '/') : ''
    toCalendar.value = toDate ? toDate.replaceAll('-', '/') : ''
  },
  { immediate: true, deep: true },
)

// Funciones para manejar cambios desde el calendario
function onFromSelected(val) {
  const isoDate = val ? formatToISOWithTime(val) : null
  model.value = { ...model.value, from: isoDate }
}

function onToSelected(val) {
  const isoDate = val ? formatToISOWithTime(val, true) : null
  model.value = { ...model.value, to: isoDate }
}

// Funciones para manejar cambios desde el input manual
function onFromChange(val) {
  const dateStr = parseDisplayDate(val)
  const isoDate = dateStr ? formatToISOWithTime(dateStr) : null
  model.value = { ...model.value, from: isoDate }
}

function onToChange(val) {
  const dateStr = parseDisplayDate(val)
  const isoDate = dateStr ? formatToISOWithTime(dateStr, true) : null
  model.value = { ...model.value, to: isoDate }
}
</script>
