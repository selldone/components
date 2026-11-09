<!--
  Where a product can be bought, in one compact line: its own country/ZIP rule, the store's
  country list when the product has no rule, or everywhere. Each product country lists its
  ZIP codes on hover, focus or tap.
-->
<template>
  <span class="b-product-locations-summary">
    <span class="sd-modern-status sd-modern-status--plain">
      <i class="sd-modern-status__dot" :class="dotClass" aria-hidden="true" />
      {{ label }}
    </span>
    <span
      v-for="country in shown"
      :key="country"
      class="b-product-locations-summary__country"
      :tabindex="locations ? 0 : undefined"
    >
      <flag :iso="country" :squared="false" />{{ getCountryName(country) }}
      <v-tooltip
        v-if="locations"
        activator="parent"
        location="top"
        open-on-click
        :open-on-focus="true"
        content-class="sd-modern-tooltip text-start"
      >
        {{
          $t("b_product_inventory.locations.zip_codes", {
            count: locations[country]?.length || 0,
          })
        }}<template v-if="locations[country]?.length"
          >: {{ locations[country].join(", ") }}</template
        >
      </v-tooltip>
    </span>
    <span
      v-if="hidden.length"
      class="b-product-locations-summary__more"
      tabindex="0"
      dir="ltr"
    >
      +{{ hidden.length }}
      <v-tooltip
        activator="parent"
        location="top"
        open-on-click
        :open-on-focus="true"
        content-class="sd-modern-tooltip text-start"
        >{{
          hidden.map((country) => getCountryName(country)).join(", ")
        }}</v-tooltip
      >
    </span>
  </span>
</template>

<script lang="ts">
import { getCodes } from "@selldone/core-js/models/general/country/country-helper.ts";

export default {
  name: "BProductLocationsSummary",
  props: {
    /** The product's own rule `{ ISO: [zip, …] }`, or null when it has none. */
    locations: { type: Object, default: null },
    /** The store's accepted countries, or null when it accepts every country. */
    countries: { type: Array, default: null },
    limit: { type: Number, default: 4 },
  },
  computed: {
    // product: own rule · store: the store's country list · everywhere: no restriction.
    source() {
      if (this.locations) return "product";
      return this.countries ? "store" : "everywhere";
    },
    // A store list covering most of the world reads better as the few countries it leaves out.
    excluded() {
      if (this.source !== "store") return null;
      const excluded = getCodes().filter(
        (code) => !this.countries.includes(code),
      );
      return excluded.length < this.countries.length ? excluded : null;
    },
    list() {
      if (this.source === "product") return Object.keys(this.locations);
      if (this.source === "store") return this.excluded || this.countries;
      return [];
    },
    shown() {
      return this.list.slice(0, this.limit);
    },
    hidden() {
      return this.list.slice(this.limit);
    },
    label() {
      let key = this.source;
      if (this.excluded)
        key = this.excluded.length ? "store_except" : "store_all";
      else if (this.source !== "everywhere" && !this.list.length)
        key += "_none";
      return this.$t(`b_product_inventory.locations.scope.${key}`);
    },
    dotClass() {
      if (this.source !== "everywhere" && !this.excluded && !this.list.length)
        return "sd-modern-status__dot--error";
      return this.source === "product"
        ? "b-product-locations-summary__rule-dot"
        : "sd-modern-status__dot--success";
    },
  },
};
</script>

<style scoped lang="scss">
.b-product-locations-summary {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 12px;
  min-width: 0;

  &__country,
  &__more {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border-radius: 4px;
    white-space: nowrap;

    &:focus-visible {
      outline: 2px solid rgb(var(--v-theme-primary));
      outline-offset: 2px;
    }
  }

  &__more {
    color: var(--sd-modern-muted);
    cursor: default;
  }

  // A product rule overrides the store default: the guide's blue overridden-value dot.
  &__rule-dot {
    background: rgb(var(--v-theme-primary));
  }
}

// Keep the blue dot blue inside the dashboard's inverted content window.
.smart-invert .s--card-window-content .b-product-locations-summary__rule-dot {
  filter: invert(1);
}
</style>
