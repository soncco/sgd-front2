<template>
  <q-card class="bg-grey-1">
    <q-card-section class="fit q-py-xs">
      <div class="text-h6">
        {{ title }}
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
/**
 * Componente para mostrar un título simple
 *
 * @component SimpleTitle
 * @example
 * <SimpleTitle title="Información Personal" />
 */

/**
 * Props del componente SimpleTitle
 */
defineProps({
  /**
   * Título a mostrar
   * @type {string}
   * @required
   */
  title: {
    type: String,
    required: true,
  },
})
</script>
