<template>
  <v-data-table
    :headers="headers"
    :items="items"
    :search="search"
    :loading="loading"
    class="elevation-1"
  >
    <template v-slot:[`item.actions`]="{ item }">
      <v-icon small class="mr-2" @click="$emit('edit', item)">
        mdi-pencil
      </v-icon>
      <v-icon small @click="$emit('delete', item)">
        mdi-delete
      </v-icon>
    </template>
  </v-data-table>
</template>

<script>
export default {
  props: {
    headers: {
      type: Array,
      required: true,
    },
    items: {
      type: Array,
      required: true,
    },
    search: {
      type: String,
      default: '',
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
};
</script> 