<template>
  <v-card class="sld-prof-card" rounded="xl" variant="flat">
    <v-card-text class="pa-4 pa-sm-6">
      <div class="d-flex align-center mb-2">
        <v-icon class="me-2">notes</v-icon>
        <div class="sld-prof-card__title">{{ title || "Description" }}</div>
      </div>

      <div class="sld-prof-bio__text">
        {{ textSafe || "-" }}
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
export default {
  name: "SStorefrontListingItemProfileBio",
  props: {
    title: { type: String, default: "" },
    text: { type: String, default: "" },
  },
  computed: {
    textSafe(): string {
      return String(this.text || "").trim();
    },
  },
};
</script>

<style lang="scss" scoped>
$sld-prof-text: 14px;

.sld-prof-card {
  background: #fff;
  border: 1px solid rgba(20, 20, 20, 0.08);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.06);
  overflow: visible !important;

  &__title {
    font-weight: 900;
  }
}

.sld-prof-bio__text {
  font-size: $sld-prof-text;
  color: rgba(0, 0, 0, 0.66);
  white-space: pre-wrap;
  line-height: 1.7;
  overflow-wrap: anywhere;
}
</style>
