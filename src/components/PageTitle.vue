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
const props = defineProps({
  title: String,
  icon: String,
  iconColor: {
    type: String,
    default: "primary",
  },
  buttons: Array,
});
</script>
