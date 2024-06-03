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
      <v-icon :color="dark ? '#fff' : '#111'" class="me-1">storefront</v-icon>
      {{ label }}
    </h3>
    <v-list-subheader v-if="hint" class="text-wrap">{{ hint }}</v-list-subheader>

    <v-slide-y-transition
      :class="{ disabled: disabled, '-rounded-8px': items_show.length <= 1 }"
      class="border-between-vertical rounded-card"
      group
      hide-on-leave
      tag="div"
    >
      <div
        v-for="vendor in items_show"
        :key="vendor.id"
        :class="{
          'bg-dark': dark,
          'bg-white': !dark,
          's--shadow-no-padding z1 my-2': vendor.id === modelValue,
        }"
        class="s--smart-select-vendor-item row-hover usn border"
        @click="
          $emit(
            'update:modelValue',
            forceShowAll ? vendor.id : modelValue ? null : vendor.id,
          );
          $emit(
            'change',
            forceShowAll ? vendor.id : modelValue ? null : vendor.id,
          );
        "
      >
        <div class="s--smart-select-vendor-content">
          <div class="flex-grow-0 me-2">
            <v-icon
              :size="vendor.id === modelValue ? 'large' : undefined"
              color="primary"
              >{{
                vendor.id === modelValue ? "lens" : "radio_button_unchecked"
              }}
            </v-icon>
          </div>
          <div class="flex-grow-1 ">
            <router-link
              v-if="vendor.page"
              :to="{
                name: window.$storefront.routes.PAGE_RENDER,
                params: { page_name: vendor.page.name },
              }"
              class="s--smart-select-vendor-link tnt"
              exact
              target="_blank"
              title="Go to the store page."
            >
              {{ $t("select_vendor.item_title", { vendor: vendor.name }) }}
              <v-icon class="ms-1" color="primary" size="small">launch</v-icon>
            </router-link>
            <b v-else>
              {{ vendor.name }}
            </b>
            <div class="pa-0 text-subtitle-2" style="height: auto">
              {{ vendor.description }}
            </div>
          </div>

          <div class="min-width-100">
            <u-price
              :amount="calcVendorPrice(vendor)"
              :currency="GetUserSelectedCurrency()"
            ></u-price>
          </div>

          <v-avatar color="#fafafa" rounded>
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
  emits: ["update:modelValue", "change"],
  props: {
    modelValue: {},
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
      if (!this.modelValue) return this.vendors;
      const out = this.vendors.filter((i) => i.id === this.modelValue);
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

<style lang="scss" scoped>
.s--smart-select-vendor {
  text-align: start;

  .s--smart-select-vendor-item {
    padding: 8px;
    cursor: pointer;
    margin-bottom: 4px;
    overflow: hidden;


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
