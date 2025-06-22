<template>
  <v-dialog :model-value="visible" @update:model-value="$emit('update:visible', $event)" max-width="500px">
    <v-card>
      <v-card-title class="text-h5">{{ title }}</v-card-title>
      <v-card-text>{{ message }}</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="$emit('update:visible', false)">Cancel</v-btn>
        <v-btn color="primary" text @click="$emit('confirm'); $emit('update:visible', false);">OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    title: {
      type: String,
      default: 'Are you sure?',
    },
    message: {
      type: String,
      default: 'Do you want to perform this action?',
    },
  },
  emits: ['update:visible', 'confirm'],
};
</script> 