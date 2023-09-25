<template>
  <div>
    <h1 class="mx-2 fadeIn">{{ title }}</h1>
    <small v-if="subtitle" class="text-capitalize mx-2 d-block fadeIn delay_100">{{
      subtitle
    }}</small>
    <p class="mx-2 fadeIn delay_200">
      {{ desc.substring(0, more ? 256 : 80) }}
      <v-btn
        v-if="!more && desc.length > 80"
        @click="more = true"
        text
        small
        icon
        ><v-icon>more_horiz </v-icon></v-btn
      >
    </p>
  </div>
</template>

<script>
export default {
  name: "CommunityHeader",
  props: {
    title: {},
    subtitle: {},
    desc: {},
  },

  data() {
    return {
      more: false, // Show all description
    };
  },
};
</script>

<style scoped></style>
