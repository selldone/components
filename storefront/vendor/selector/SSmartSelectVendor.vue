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
    <v-list-subheader v-if="hint" class="text-wrap"
      >{{ hint }}
    </v-list-subheader>

    <v-slide-y-transition
      :class="{ disabled: disabled, '-rounded-8px': items_show.length <= 1 }"
      class="border-between-vertical rounded-card"
      group
      hide-on-leave
      tag="div"
    >
      <div
        v-for="product_vendor in items_show"
        :key="product_vendor.id"
        :class="{
          'bg-dark': dark,
          'bg-white': !dark,
          's--shadow-no-padding z1 my-2': product_vendor.id === modelValue,
        }"
        class="s--smart-select-vendor-item row-hover usn border"
        @click="
          $emit(
            'update:modelValue',
            forceShowAll
              ? product_vendor.id
              : modelValue
                ? null
                : product_vendor.id,
          );
          $emit(
            'change',
            forceShowAll
              ? product_vendor.id
              : modelValue
                ? null
                : product_vendor.id,
          );
        "
      >
        <div class="s--smart-select-vendor-content">
          <div class="flex-grow-0 me-2">
            <v-icon
              :size="product_vendor.id === modelValue ? 'large' : undefined"
              color="primary"
              >{{
                product_vendor.id === modelValue
                  ? "lens"
                  : "radio_button_unchecked"
              }}
            </v-icon>
          </div>
          <div class="flex-grow-1">
            <a
              v-if="true"
              :href="getVendorLink(product_vendor.vendor)"
              class="s--smart-select-vendor-link tnt"
              target="_blank"
              title="Go to the store page."
            >
              {{
                $t("select_vendor.item_title", {
                  vendor: product_vendor.vendor.name,
                })
              }}
              <v-icon class="ms-1" size="small">launch</v-icon>
            </a>
            <b v-else>
              {{ product_vendor.vendor.name }}
            </b>
            <div class="text-subtitle-2" style="height: auto">
              {{
                product_vendor.vendor.description?.limitWords(
                  $vuetify.display.xs ? 12 : 32,
                )
              }}
            </div>

            <div
              v-if="
                pickup_transportation_for_vendors_exists &&
                product_vendor.vendor.warehouse
              "
              class="text-subtitle-2 mt-2"
            >
              <v-chip
                label
                size="x-small"
                class="me-2"
                color="#000"
                variant="flat"
              >
                <v-icon size="small" start>place</v-icon>

                {{ $t("global.commons.pickup") }}
              </v-chip>

              <flag
                v-if="product_vendor.vendor.warehouse.country"
                :iso="product_vendor.vendor.warehouse.country"
                :squared="false"
                class="me-1"
              ></flag>
              <span>
                {{ getVendorAddress(product_vendor.vendor) }}
              </span>
            </div>
          </div>

          <div class="min-width-100 text-center text-sm-start">
            <v-avatar
              color="#fafafa"
              rounded
              class="d-block d-sm-none mb-2 mx-auto"
            >
              <v-img
                v-if="product_vendor.vendor.icon"
                :src="getShopImagePath(product_vendor.vendor.icon, 128)"
              />
              <v-icon v-else>storefront</v-icon>
            </v-avatar>

            <u-price
              :amount="calcVendorPrice(product_vendor)"
              :currency="GetUserSelectedCurrency()"
            ></u-price>
          </div>

          <v-avatar color="#fafafa" rounded class="d-none d-sm-block">
            <v-img
              v-if="product_vendor.vendor.icon"
              :src="getShopImagePath(product_vendor.vendor.icon, 128)"
            />
            <v-icon v-else>storefront</v-icon>
          </v-avatar>
        </div>
      </div>
    </v-slide-y-transition>
  </div>
</template>

<script lang="ts">
import { MapHelper, ShopURLs } from "@selldone/core-js";
import { ShopTransportations } from "@selldone/core-js/enums/logistic/ShopTransportations.ts";
import {BusinessModel} from "@selldone/core-js/enums/shop/BusinessModel.ts";

export default {
  name: "SSmartSelectVendor",
  emits: ["update:modelValue", "change"],
  inject: ["$shop"],
  props: {
    modelValue: {},
    vendorProducts: { type: Array },

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
      if (this.forceShowAll) return this.vendorProducts;
      if (!this.modelValue) return this.vendorProducts;
      const out = this.vendorProducts.filter((i) => i.id === this.modelValue);
      return out.length ? out : this.vendorProducts;
    },

    cod_payment_exists() {
      return this.$shop.gateways?.some(
        (gateway) => gateway.currency === this.basket.currency && gateway.cod,
      );
    },
    IS_MARKETPLACE() {
      return this.$shop.model === BusinessModel.MARKETPLACE.code;
    },

    pickup_transportation_for_vendors_exists() {
      return this.IS_MARKETPLACE && this.$shop.transportations?.some(
        (transportation) =>
          transportation.type === ShopTransportations.Pickup.code &&
          transportation.marketplace,
          /* Transportation must be available for vendors. If the marketplace mode is not direct,
       'marketplace' could be true (miss config!)! But vendor_products would not return any value. This check is safe, so there's no need to explicitly check
       the marketplace mode. */
      );
    },
  },

  methods: {
    //█████████████████████████████████████████████████████████████
    //―――――――――――――― 🟣 Marketplace 🟣 ――――――――――――
    //█████████████████████████████████████████████████████████████

    calcVendorPrice(product_vendor) {
      return this.CalcPriceProductCurrentCurrency(
        this.getShop(),
        product_vendor,
        null,
      );
    },

    getVendorLink(vendor) {
      if (vendor.page_id)
        return ShopURLs.GetVendorLandingPageUrl(this.getShop(), {
          id: vendor.id,
          slug: vendor.vendor_slug,
          name: vendor.name,
        });

      return ShopURLs.GetVendorListingPageUrl(this.getShop(), {
        id: vendor.id,
        slug: vendor.vendor_slug,
        name: vendor.name,
      });
    },

    getVendorAddress(vendor) {
      return MapHelper.GenerateFullAddressFromMapInfo(vendor.warehouse);
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
