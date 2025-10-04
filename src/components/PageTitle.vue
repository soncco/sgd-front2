<template>
  <q-card class="bg-grey-1">
    <q-card-section class="fit row justify-between items-start content-start">
      <div class="text-h5">
        <template v-if="icon">
          <q-icon :name="icon" :color="iconColor" />
        </template>
        {{ title }}
      </div>
      <div>
        <q-btn
          v-for="button in buttons"
          :key="button.label"
          :label="button.label"
          :to="button.route"
          :color="button.color ? button.color : 'primary'"
          class="q-mr-md"
          :icon="button.icon ? button.icon : undefined"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
/**
 * Componente para mostrar el título de una página con botones de acción
 *
 * @component PageTitle
 * @example
 * <PageTitle
 *   title="Gestión de Usuarios"
 *   icon="people"
 *   :buttons="[{label: 'Nuevo', route: '/usuario/nuevo', icon: 'add'}]"
 * />
 */

/**
 * Props del componente PageTitle
 */
defineProps({
  /**
   * Título principal de la página
   * @type {string}
   */
  title: {
    type: String,
    required: true,
  },

  /**
   * Icono a mostrar junto al título (nombre de Material Icons)
   * @type {string}
   */
  icon: {
    type: String,
    default: '',
  },

  /**
   * Color del icono
   * @type {string}
   * @default 'primary'
   */
  iconColor: {
    type: String,
    default: 'primary',
  },

  /**
   * Array de botones a mostrar en la parte derecha del título
   * @type {Array<Object>}
   * @property {string} label - Texto del botón
   * @property {string} route - Ruta a la que navegar al hacer clic
   * @property {string} [icon] - Icono del botón (opcional)
   * @property {string} [color] - Color del botón (opcional, default: 'primary')
   *
   * @example
   * [{
   *   label: 'Crear Nuevo',
   *   route: '/crear',
   *   icon: 'add',
   *   color: 'secondary'
   * }]
   */
  buttons: {
    type: Array,
    default: () => [],
  },
})
</script>
