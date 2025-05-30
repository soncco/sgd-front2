<template>
    <div class="cursor-pointer">
      <div class="text-h6">{{ label }}:</div>
      <span class="editable" v-if="isCombo && selectedLabel">{{
        selectedLabel
      }}</span>
      <div class="editable" v-else-if="valor">
        {{ valor }}
        <q-inner-loading :showing="isLoading" label="Cargando..." />
      </div>
      <q-img
        v-else-if="url && tipo !== 'combo'"
        loading="lazy"
        :src="url"
        alt="Archivo"
        style="max-width: 150px"
      />
      <q-popup-edit v-model="valor" v-slot="scope">
        <div v-if="isCombo">
          <q-select
            emit-value
            map-options
            v-model="scope.value"
            :options="opciones"
            option-label="label"
            option-value="value"
            :label="label"
            :loading="isLoading"
          >
            <template v-slot:after>
              <q-btn
                flat
                dense
                color="negative"
                icon="cancel"
                @click.stop.prevent="scope.cancel"
              />
              <q-btn
                flat
                dense
                color="positive"
                icon="check_circle"
                @click.stop.prevent="() => saveData(scope)"
              />
            </template>
          </q-select>
        </div>
        <div v-else-if="url && tipo !== 'combo'">
          <q-file
            v-model="file"
            @keyup.enter="() => saveData(scope)"
            outlined
            dense
            :loading="isLoading"
          >
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
            <template v-slot:after>
              <q-btn
                flat
                dense
                color="negative"
                icon="cancel"
                @click.stop.prevent="scope.cancel"
              />
              <q-btn
                flat
                dense
                color="positive"
                icon="check_circle"
                @click.stop.prevent="() => saveData(scope)"
              />
            </template>
          </q-file>
        </div>
        <q-input
          v-else
          v-model="scope.value"
          dense
          autofocus
          outlined
          @keyup.enter="() => saveData(scope)"
          :loading="isLoading"
          :type="scope.value.length > 50 ? 'textarea' : 'text'"
          :readonly="isCombo"
        >
          <template v-slot:after>
            <q-btn
              flat
              dense
              color="negative"
              icon="cancel"
              @click.stop.prevent="scope.cancel"
            />
            <q-btn
              flat
              dense
              color="positive"
              icon="check_circle"
              @click.stop.prevent="() => saveData(scope)"
              :disable="
                (scope.validate && !scope.validate(scope.value)) ||
                scope.initialValue === scope.value
              "
            />
          </template>
        </q-input>
      </q-popup-edit>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from "vue";
  import { api } from "src/boot/axios";
  import { Notify } from "quasar";
  
  const props = defineProps({
    clave: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    tipo: {
      type: String,
      default: null,
    },
    opciones: {
      type: Array,
      default: () => [],
    },
  });
  
  const valor = ref("");
  const url = ref(null);
  const file = ref(null);
  const isLoading = ref(false);
  
  const isCombo = computed(() => props.tipo === "combo");
  
  const selectedLabel = computed(() => {
    const selectedOption = props.opciones.find(
      (option) => option.value === valor.value
    );
    return selectedOption ? selectedOption.label : valor.value;
  });
  
  const fetchData = () => {
    isLoading.value = true;
    const urlWithParam = `api/base/opcion/${props.clave}`;
    api
      .get(urlWithParam)
      .then((response) => {
        valor.value = response.data?.valor || "";
        url.value = response.data?.url || null;
        isLoading.value = false;
      })
      .catch(() => {
        isLoading.value = false;
      });
  };
  
  const saveData = (scope) => {
    if (url.value && props.tipo !== "combo") {
      uploadFile(scope);
    } else {
      saveTextData(scope);
    }
  };
  
  const saveTextData = (scope) => {
    valor.value = scope.value;
  
    if (!valor.value || scope.initialValue === valor.value) {
      Notify.create({
        type: "warning",
        message: "No se realizaron cambios.",
      });
      return;
    }
  
    isLoading.value = true;
    const urlWithParam = `api/base/opcion/${props.clave}/`;
    api
      .patch(urlWithParam, { valor: valor.value })
      .then(() => {
        isLoading.value = false;
        scope.set();
        Notify.create({
          type: "positive",
          message: "Datos guardados correctamente.",
        });
      })
      .catch(() => {
        isLoading.value = false;
        Notify.create({
          type: "negative",
          message: "Error al guardar los datos.",
        });
      });
  };
  
  const uploadFile = (scope) => {
    if (!file.value) {
      Notify.create({
        type: "warning",
        message: "Por favor, selecciona un archivo para subir.",
      });
      return;
    }
  
    const formData = new FormData();
    formData.append("url", file.value);
  
    isLoading.value = true;
    const urlWithParam = `api/base/opcion/${props.clave}/`;
    api
      .patch(urlWithParam, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        url.value = response.data.url;
        isLoading.value = false;
        scope.set();
        Notify.create({
          type: "positive",
          message: "Archivo subido y guardado correctamente.",
        });
      })
      .catch(() => {
        isLoading.value = false;
        Notify.create({
          type: "negative",
          message: "Error al subir el archivo.",
        });
      });
  };
  
  onMounted(() => {
    fetchData();
  });
  </script>
  
  <style>
  .editable {
    display: inline-block;
    padding: 0.3rem 0.5rem;
    border: 1px dashed #ccc;
    cursor: pointer;
    overflow-wrap: break-word;
    inline-size: 100%;
  
    &:hover {
      border-color: #9f9d9d;
      background-color: rgb(255, 255, 218);
    }
  }
  </style>
  