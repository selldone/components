<!--
  - Copyright (c) 2023. Selldone® Business OS™
  -
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  - ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  -
  - All rights reserved. In the weave of time, where traditions and innovations intermingle, this content was crafted.
  - From the essence of thought, through the corridors of creativity, each word, and sentiment has been molded.
  - Not just to exist, but to inspire. Like an artist's stroke or a sculptor's chisel, every nuance is deliberate.
  - Our journey is not just about reaching a destination, but about creating a masterpiece.
  - Tread carefully, for you're treading on dreams.
  -->

<template>
  <div :class="{ dark: dark }" class="s--smart-select-vendor">
    <h3 v-if="label" class="my-2">
      <v-icon class="me-1" :color="dark ? '#fff' : '#111'">storefront</v-icon>
      {{ label }}
    </h3>
    <v-subheader v-if="hint">{{ hint }}</v-subheader>

    <v-slide-y-transition
      tag="div"
      group
      class="border-between-vertical rounded-card"
      :class="{ disabled: disabled, '-rounded-8px': items_show.length <= 1 }"
      hide-on-leave
    >
      <div
        v-for="vendor in items_show"
        :key="vendor.id"
        class="s--smart-select-vendor-item row-hover usn border"
        :class="{
          'bg-dark': dark,
          'bg-white': !dark,
          's--shadow-no-padding z1 my-2': vendor.id === value,
        }"
        @click="
          $emit('input', forceShowAll ? vendor.id : value ? null : vendor.id);
          $emit('change', forceShowAll ? vendor.id : value ? null : vendor.id);
        "
      >
        <div class="s--smart-select-vendor-content">
          <div class="flex-grow-0 me-2">
            <v-icon color="primary" :large="vendor.id === value">{{
              vendor.id === value ? "lens" : "radio_button_unchecked"
            }}</v-icon>
          </div>
          <div class="flex-grow-1">
            <router-link
              v-if="vendor.page"
              :to="{
                name: window.$storefront.routes.PAGE_RENDER,
                params: { page_name: vendor.page.name },
              }"
              class="s--smart-select-vendor-link tnt"
              exact
              title="Go to the store page."
              target="_blank"
            >
              {{$t('select_vendor.item_title',{vendor:vendor.name})}}
              <v-icon class="ms-1" small color="primary"
                >launch</v-icon
              ></router-link
            >
            <b v-else>
              {{ vendor.name }}
            </b>
            <v-subheader style="height: auto" class="p-0">
              {{ vendor.description }}
            </v-subheader>
          </div>

          <div class="min-width-100">
            <price-view
              :currency="GetUserSelectedCurrency()"
              :amount="calcVendorPrice(vendor)"
            ></price-view>
          </div>

          <v-avatar rounded color="#fafafa">
            <img v-if="vendor.icon" :src="getShopImagePath(vendor.icon, 128)" />
            <v-icon v-else>storefront</v-icon>
          </v-avatar>
        </div>
      </div>
    </v-slide-y-transition>
  </div>
</template>

<script>
export default {
  name: "SSmartSelectVendor",
  props: {
    value: {},
    vendors: { type: Array },

    itemIcon: {},
    label: {},
    hint: {},

    forceShowAll: {
      default: false,
      type: Boolean,
    },
    disabled: {
      default: false,
      type: Boolean,
    },
    dark: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    return {};
  },

  computed: {
    items_show() {
      if (this.forceShowAll) return this.vendors;
      if (!this.value) return this.vendors;
      const out = this.vendors.filter((i) => i.id === this.value);
      return out.length ? out : this.vendors;
    },
  },

  methods: {
    //█████████████████████████████████████████████████████████████
    //―――――――――――――――――――――――― 🟣 Marketplace 🟣 ――――――――――――――――――――――
    //█████████████████████████████████████████████████████████████

    calcVendorPrice(vendor) {
      return this.CalcPriceProductCurrentCurrency(this.getShop(), vendor, null);
    },
  },
};
</script>

<style scoped lang="scss">
.s--smart-select-vendor {
  text-align: start;

  .s--smart-select-vendor-item {
    padding: 8px;
    cursor:pointer;
    margin-bottom: 4px;


    .s--smart-select-vendor-content {
      display: flex;
      align-items: center;
      min-height: 40px;

      .s--smart-select-vendor-link {
        font-weight: 700;
        &:hover {
          font-weight: 900;
        }
      }
    }
  }
}
</style>
