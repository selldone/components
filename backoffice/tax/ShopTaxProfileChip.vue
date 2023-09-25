<template>
  <v-chip v-if="profile" title="Tax profile" :small="small" :dark="dark" :color="dark?'#111':'#fafafa'">
    <v-icon :color="profile.icon" left  :small="small">{{profile.icon}}</v-icon>
    {{profile.name }}
  </v-chip>
</template>

<script>

export default {
  name: "ShopTaxProfileChip",
  props: {
    shop: { required: true },
    profileId: { required: true },
    small: { type: Boolean },
    dark: { type: Boolean },
  },
  computed: {
    profiles() {
      return this.shop.tax_profiles
    },
    profile() {
      return this.profiles?.find(p=>p.id===this.profileId)
    },
  },
};
</script>

<style scoped></style>
