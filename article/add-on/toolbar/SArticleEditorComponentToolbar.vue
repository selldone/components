<template>
  <v-toolbar dense outlined rounded flat class="my-3">
    <v-icon color="#999">more_vert</v-icon>
    <v-toolbar-title class="text-uppercase font-weight-normal"
      ><small>{{ title }}</small></v-toolbar-title
    >
    <v-spacer></v-spacer>
    <v-toolbar-items>
      <slot></slot>

      <v-btn v-if="editButton" @click="$emit('click:edit')" icon
        ><v-icon>{{ editIcon }}</v-icon></v-btn
      >

      <v-btn @click="addEnterBefore()" title="Add line before" icon
        ><v-icon>subdirectory_arrow_left</v-icon></v-btn
      >

      <v-btn @click="addEnterAfter()" title="Add line after" icon
        ><v-icon>subdirectory_arrow_right</v-icon></v-btn
      >
    </v-toolbar-items>
  </v-toolbar>
</template>

<script>
export default {
  name: "SArticleEditorComponentToolbar",
  props: {
    element: {
      require: true,
    },
    title: {},
    editButton: {
      type: Boolean,
      default: true,
    },
    editIcon: {
      default: "edit",
    },
  },

  methods: {
    addEnterAfter() {
      $(this.element).after("<p>...</p>");
    },
    addEnterBefore() {
      $(this.element).before("<p>...</p>");
    },
  },
};
</script>

<style scoped></style>
