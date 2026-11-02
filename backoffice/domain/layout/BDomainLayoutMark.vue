<template>
  <router-link
    v-if="summary"
    :to="destination"
    class="b-domain-layout-mark"
    @click.stop
  >
    <v-icon size="14" aria-hidden="true">layers</v-icon>
    <span
      v-if="summary.mode !== 'inherit' && summary.effective_mode !== 'standard'"
      class="b-domain-layout-mark__override"
      aria-hidden="true"
    />
    <span class="b-domain-layout-mark__name">{{ label }}</span>
    <span class="b-domain-layout-mark__source">{{
      $t(
        `domain_layouts.${summary.available === false ? "unavailable" : summary.inherited ? "inherited" : summary.effective_mode === "standard" ? "standard_kind" : summary.effective_mode}`,
      )
    }}</span>
    <v-tooltip
      activator="parent"
      location="top"
      open-on-focus
      content-class="sd-modern-tooltip text-start"
      >{{ $t("domain_layouts.open_assignment", { name: label }) }}</v-tooltip
    >
  </router-link>
</template>

<script lang="ts">
export default {
  name: "BDomainLayoutMark",
  props: {
    summary: Object,
    shopId: { type: [String, Number], required: true },
    domainKey: { type: [String, Number], required: true },
  },
  computed: {
    label() {
      return this.summary?.effective_mode === "standard"
        ? this.$t("domain_layouts.standard")
        : this.summary?.name;
    },
    destination() {
      return {
        name: "BPageDomainStorefront",
        params: { shop_id: this.shopId, domain_key: String(this.domainKey) },
      };
    },
  },
};
</script>

<style scoped lang="scss">
.b-domain-layout-mark {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
  max-width: 100%;
  margin-block-start: 5px;
  color: rgb(var(--v-theme-on-surface));
  font: inherit;
  font-size: 12px;
  line-height: 19px;
  text-decoration: none;
  border-radius: 4px;
  > .v-icon {
    flex-shrink: 0;
    color: var(--sd-modern-muted, rgba(var(--v-theme-on-surface), 0.66));
  }
  &__name {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 180px;
  }
  &__source {
    flex-shrink: 0;
    color: var(--sd-modern-muted, rgba(var(--v-theme-on-surface), 0.66));
    font-size: 11px;
  }
  &__override {
    width: 5px;
    height: 5px;
    flex-shrink: 0;
    border-radius: 50%;
    background: rgb(var(--v-theme-primary));
  }
  &:hover &__name {
    text-decoration: underline;
  }
  &:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 3px;
  }
  @media (pointer: coarse) {
    min-height: 44px;
  }
}
</style>
