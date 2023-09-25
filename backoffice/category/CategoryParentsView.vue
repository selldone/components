<template>
  <span v-if="category" :class="{'small':small}">
    <!-- -------------------- Parent -------------------- -->
    <!-- 1. Parent > Exist -->
    <span v-if="category.parent" class="ms-2">
      <!-- Parent of parent -->

      <span>
        <v-icon small>{{ category.parent_id ? "more_horiz" : "home" }}</v-icon>
        <v-icon class="mx-1" :small="small">{{ $t("icons.chevron_next") }}</v-icon>
      </span>

      <!-- Parent has image -->
      <v-avatar v-if="category.parent.icon" :size="small?16:24"
        ><img :src="getShopImagePath(category.parent.icon, 64)" class="me-1"
      /></v-avatar>
      <!-- Parent has no image  -->
      <v-icon v-else small class="me-1">folder</v-icon>

      {{ category.parent.title }}
    </span>

    <!-- 1. Parent > Not exist -->
    <span v-else>
      <v-icon small class="me-1">home</v-icon>
      {{ $t("global.commons.home") }}
    </span>

    <!-- -------------------- Current -------------------- -->

    <v-icon class="mx-1" :small="small">{{ $t("icons.chevron_next") }}</v-icon>

    <v-avatar v-if="category.icon"  :size="small?16:24"
      ><img :src="getShopImagePath(category.icon, 64)" class="me-1"
    /></v-avatar>
    {{ category.title }}
  </span>
</template>

<script>
export default {
  name: "CategoryParentsView",
  props: {
    category: {
      type: Object,
      required: true,
    },
    small:{type:Boolean}
  },
};
</script>

<style scoped></style>
