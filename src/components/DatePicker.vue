<template>
    <q-input
      ref="inputRef"
      :label="label"
      :error="error"
      :error-message="errorMessage"
      filled
      outlined
      mask="##/##/####"
      placeholder="DD/MM/YYYY"
      v-model="displayValue"
      @input="onInputChange"
    >
      <template #append>
        <q-icon name="event" class="cursor-pointer">
          <q-popup-proxy
            cover
            transition-show="scale"
            transition-hide="scale"
            ref="popupRef"
          >
            <q-date
              v-model="calendarValue"
              :locale="myLocale"
              @update:modelValue="onDateSelected"
            >
              <div class="row items-center justify-end q-pa-sm">
                <q-btn v-close-popup label="Cerrar" color="primary" flat />
              </div>
            </q-date>
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>
  </template>
  
  <script setup>
  import { ref, watch } from "vue";
  
  // 1. defineModel para el valor real (YYYY-MM-DD)
  const model = defineModel({
    type: String,
    default: "",
  });
  
  const props = defineProps({
    label: { type: String, default: "" },
    error: { type: Boolean, default: false },
    errorMessage: { type: String, default: "" },
  });
  
  // <q-date> maneja "YYYY/MM/DD",
  // displayValue muestra "DD/MM/YYYY",
  // model => "YYYY-MM-DD"
  
  const displayValue = ref("");
  const calendarValue = ref("");
  const inputRef = ref(null);
  const popupRef = ref(null);
  
  const myLocale = {
    days: "Domingo_Lunes_Martes_Miércoles_Jueves_Viernes_Sábado".split("_"),
    daysShort: "Dom_Lun_Mar_Mié_Jue_Vie_Sáb".split("_"),
    months:
      "Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre".split(
        "_"
      ),
    monthsShort: "Ene_Feb_Mar_Abr_May_Jun_Jul_Ago_Sep_Oct_Nov_Dic".split("_"),
    firstDayOfWeek: 1,
    format24h: true,
    pluralDay: "días",
  };
  
  // --------------------------------------------------------------------
  // 2. Al cambiar model (YYYY-MM-DD), actualizamos displayValue (DD/MM/YYYY)
  //    y calendarValue (YYYY/MM/DD).
  // --------------------------------------------------------------------
  watch(
    () => model.value,
    (newVal) => {
      // newVal = "YYYY-MM-DD"
      if (!newVal) {
        displayValue.value = "";
        calendarValue.value = "";
        return;
      }
      // "2025-12-25" => ["2025","12","25"]
      const [year, month, day] = newVal.split("-");
      displayValue.value = `${day}/${month}/${year}`; // 25/12/2025
      calendarValue.value = `${year}/${month}/${day}`; // 2025/12/25
    },
    { immediate: true }
  );
  
  // --------------------------------------------------------------------
  // 3. Cuando el usuario selecciona fecha en <q-date>,
  //    se dispara onDateSelected(newVal), que viene en formato "YYYY/MM/DD".
  //    Lo convertimos a "YYYY-MM-DD" => model => actualiza watchers => ...
  // --------------------------------------------------------------------
  function onDateSelected(newVal) {
    // newVal = "YYYY/MM/DD"
    if (!newVal) {
      model.value = "";
      return;
    }
    const [year, month, day] = newVal.split("/");
    model.value = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    popupRef.value.hide();
  }
  
  // --------------------------------------------------------------------
  // 4. onInputChange se llama cuando el usuario escribe manualmente
  //    en el input "DD/MM/YYYY". Conviértelo a "YYYY-MM-DD" y guárdalo en model.
  // --------------------------------------------------------------------
  function onInputChange(val) {
    // val = "25/12/2025"
    if (!val.includes("/")) {
      model.value = "";
      return;
    }
    const [dd, mm, yyyy] = val.split("/");
    if (!dd || !mm || !yyyy) {
      model.value = "";
      return;
    }
    model.value = `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }
  </script>
  