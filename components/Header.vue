<template>
  <div class="d-flex justify-space-between align-center mb-4">
    <h1 class="text-h5">{{ title }}</h1>
    <v-btn v-if="backRoute" :to="backRoute" icon>
      <v-icon>mdi-arrow-left</v-icon>
    </v-btn>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      required: true,
    },
    backRoute: {
      type: String,
      default: null,
    },
  },
};
</script> 