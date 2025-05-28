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
const props = defineProps({
  title: String,
});
</script>
