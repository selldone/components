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
  <div class="px-2 mb-2 d-flex flex-grow-0">
    <span v-html="tax_string"></span>
    <span class="text-success mx-2" v-if="has_free_shipping">
      ● {{ $t("global.commons.free_shipping") }}
      <span
        v-if="
          transportation_with_min_free_shipping_limit?.free_shipping_limit > 0
        "
        class="mx-1"
        >(<v-icon color="success" small>shopping_bag</v-icon>
        {{ $t("global.commons.over") }}
        <price-view
          :amount="
            transportation_with_min_free_shipping_limit?.free_shipping_limit
          "
          :currency="transportation_with_min_free_shipping_limit?.currency"
        ></price-view
        >)</span
      >

      <img
        v-for="im in images"
        :src="getShopImagePath(im)"
        :key="im"
        width="16"
        height="16"
        class="ms-1"
      />
    </span>

    <template v-if="pickup_transportation">
      <v-menu bottom max-width="460" open-on-hover offset-y>
        <template v-slot:activator="{ on, attrs }">
          <v-chip label v-bind="attrs" small color="#fff" v-on="on">
            <v-icon small left>place</v-icon>
            {{
              pickup_transportation.title
                ? pickup_transportation.title
                : $t("global.transportation_type.pickup")
            }}</v-chip
          >
        </template>
        <v-sheet dark color="#000" class="text-start">
          <v-list three-line class="bg-transparent" dark>
            <v-list-item
              v-for="(pickup, i) in pickup_transportation.pickups"
              :key="i"
              :href="MapHelper.GetMapDirectionUrl(pickup.location, true)"
              title="Open direction to the pickup store on the map."
              target="_blank"
            >
              <v-list-item-avatar rounded size="64" class="hover-scale-small">
                <img
                  v-if="pickup.location?.lng && pickup.location?.lat"
                  :src="
                    MapHelper.GetMapImage(
                      pickup.location.lng,
                      pickup.location.lat,
                      18
                    )
                  "
                />
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title>
                  {{ pickup.name }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  <flag
                    v-if="pickup.country"
                    :iso="pickup.country"
                    class="me-1"
                    :squared="false"
                  ></flag>

                  {{ MapHelper.GenerateFullAddressFromMapInfo(pickup) }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-sheet>
      </v-menu>
    </template>
  </div>
</template>

<script>
import { BasketHelper } from "@core/helper/shop/BasketHelper";
import { ShopTransportations } from "@core/enums/logistic/ShopTransportations";
import { MapHelper } from "@core/helper/map/MapHelper";
import { ProductType } from "@core/enums/product/ProductType";

export default {
  name: "ProductSectionBoxTax",
  components: {},
  props: {
    shop: {
      required: true,
      type: Object,
    },

    product: {
      required: true,
      type: Object,
    },
  },

  data: () => ({
    MapHelper: MapHelper,
  }),

  computed: {
    is_physical() {
      return this.product.type === ProductType.PHYSICAL.code;
    },

    corresponding_item_in_basket() {
      return BasketHelper.FindItem(
        this.basket,
        this.product,
        this.currentVariant
      );
    },

    basket() {
      return this.getBasket(this.product.type);
    },

    tax() {
      return this.product.tax_profile?.enable
        ? this.product.tax_profile
        : this.shop.tax;
    },
    tax_string() {
      if (!this.tax) return null;
      if (this.tax.included) {
        return `${this.$t("global.commons.tax_included_abstract")} ${
          this.tax.label ? this.tax.label : this.$t("global.commons.vat")
        }`;
      } else {
        return this.tax_value;
      }
    },
    tax_value() {
      if (!this.tax) return "";
      if (this.tax.fix) {
        return (
          `+ ${this.tax.fix_vat}% ${
            this.tax.label ? this.tax.label : this.$t("global.commons.vat")
          }` +
          (this.tax.fix_shipping
            ? `<div> + ${this.tax.fix_shipping}% ${this.$t(
                "global.commons.tax_shipping"
              )}</div>`
            : "")
        );
      } else {
        return `(${this.$t("global.commons.tax_vary_by_location")})`;
      }
    },

    transportations() {
      return this.shop.transportations;
    },
    has_free_shipping() {
      return this.is_physical && this.transportations_free_shipping?.length;
    },
    transportations_free_shipping() {
      return this.transportations?.filter(
        (t) => t.free_shipping && t.type !== ShopTransportations.Pickup.code
      );
    },
    images() {
      return this.transportations_free_shipping
        ?.filter((t) => !!t.logo)
        .map((t) => t.logo)
        .unique();
    },
    transportation_with_min_free_shipping_limit() {
      return this.transportations_free_shipping?.minByKey(
        "free_shipping_limit"
      );
    },

    pickup_transportation() {
      return (
        this.is_physical &&
        this.transportations?.find(
          (t) =>
            t.type === ShopTransportations.Pickup.code && t.pickups?.length > 0
        )
      );
    },
  },

  watch: {},
  methods: {},
};
</script>

<style scoped lang="scss"></style>
