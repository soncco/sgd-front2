<template>
    <q-page padding>
        <PageTitle 
            :title=titulo.title 
            :icon=titulo.icon 
            :buttons=titulo.buttons 
        />
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
                    </div>
                    <div class="col-6 q-gutter-md">
                        <SimpleTitle title="Credenciales" />
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
                        <SimpleTitle title="Asignaciones de Cargos" />
                        <APISelect label="Asignacion Cargo" />
                    </div>
                </div>
            </q-form>
        </div>
    </q-page>
</template>

<script setup>
    import { reactive, onMounted } from 'vue';
    import { useRoute } from 'vue-router';
    import { api } from 'src/boot/axios';
    import PageTitle from 'src/components/PageTitle.vue';
    import APISelect from 'src/components/APISelect.vue';
    import SimpleTitle from 'src/components/SimpleTitle.vue';

    const route = useRoute();
    const id = route.params.id;

    const isEdit = !!id;

    const titulo = reactive({
        title: isEdit ? 'Editar Persona' : 'Nueva Persona',
        icon: 'edit',
        buttons: [
            { label: 'Ver todas las Personas', icon: 'list', route: '/personas' },
        ],
    });

    const info = reactive({
        username: "",
        password: "",
        email: "",
        nombres: "",
        apellidos: "",
        empresa: "",
        celular: "",
        documento: "",
        tipo_doc: "",
        asignaciones: [],
    });

    const errores = reactive({});
    const errores_texto = reactive({});

    const optionsDoc = [
        { label: "DNI", value: "1" },
        { label: "RUC", value: "2" },
        { label: "Carnet de extranjería", value: "3" },
        { label: "Pasaporte", value: "4" },
        { label: "Sin documento (Código temporal)", value: "5" },
        { label: "Permiso temporal del permanencia", value: "6" },
    ];

    const endpoint = isEdit ? `/api/base/personas/${id}/` : '/api/base/persona-usuario/';
    const fetchData = () => {
        api
            .get(endpoint)
            .then((response) => {
                Object.assign(info, response.data);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    const modifyData = () => {
        
    }

    const saveData = () => {

    }

    const submitForm = () => {
        if (isEdit) {
            modifyData();
        } else {
            saveData();
        }
    };

    if (isEdit) { onMounted(fetchData); };
</script>