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
  <div class="s--product-section-tax px-2 mb-2 flex-grow-0">
    <span v-html="tax_string" class="-tax-box"></span>
    <span v-if="has_free_shipping" class="-shipping-box text-success">
      ● {{ $t("global.commons.free_shipping") }}
      <span
        v-if="
          transportation_with_min_free_shipping_limit?.free_shipping_limit > 0
        "
        class="mx-1"
        >(<v-icon color="success" size="small">shopping_bag</v-icon>
        {{ $t("global.commons.over") }}
        <u-price
          :amount="
            transportation_with_min_free_shipping_limit?.free_shipping_limit
          "
          :currency="transportation_with_min_free_shipping_limit?.currency"
        ></u-price
        >)</span
      >

      <img
        v-for="im in images"
        :key="im"
        :src="getShopImagePath(im)"
        class="ms-1"
        height="16"
        width="16"
      />
    </span>

    <template v-if="pickup_transportation">
      <v-chip
        label
        :size="$vuetify.display.xs ? 'x-small' : 'small'"
        class="-pickup-box"
        color="#000"
        variant="flat"
      >
        <v-icon size="small" start>place</v-icon>
        {{
          pickup_transportation.title
            ? pickup_transportation.title
            : $t("global.transportation_type.pickup")
        }}

        <v-menu
          activator="parent"
          location="bottom"
          max-width="460"
          open-on-hover
        >
          <v-sheet class="text-start" color="#000" dark>
            <v-list class="bg-transparent" dark lines="three" density="compact">
              <v-list-item
                v-for="(pickup, i) in pickup_transportation.pickups"
                :key="i"
                :href="MapHelper.GetMapDirectionUrl(pickup.location, true)"
                target="_blank"
                title="Open direction to the pickup store on the map."
              >
                <template v-slot:prepend>
                  <v-avatar class="hover-scale-small" rounded size="64">
                    <img
                      v-if="pickup.location?.lng && pickup.location?.lat"
                      :src="
                        MapHelper.GetMapImage(
                          pickup.location.lng,
                          pickup.location.lat,
                          18,
                        )
                      "
                    />
                  </v-avatar>
                </template>

                <v-list-item-title>
                  {{ pickup.name }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  <flag
                    v-if="pickup.country"
                    :iso="pickup.country"
                    :squared="false"
                    class="me-1"
                  ></flag>

                  {{ MapHelper.GenerateFullAddressFromMapInfo(pickup) }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-sheet>
        </v-menu>
      </v-chip>
    </template>
  </div>
</template>

<script>
import { BasketHelper } from "@selldone/core-js/helper/shop/BasketHelper";
import { ShopTransportations } from "@selldone/core-js/enums/logistic/ShopTransportations";
import { MapHelper } from "@selldone/core-js/helper/map/MapHelper";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";

export default {
  name: "SProductSectionTax",
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
        this.currentVariant,
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
                "global.commons.tax_shipping",
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
        (t) => t.free_shipping && t.type !== ShopTransportations.Pickup.code,
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
        "free_shipping_limit",
      );
    },

    pickup_transportation() {
      return (
        this.is_physical &&
        this.transportations?.find(
          (t) =>
            t.type === ShopTransportations.Pickup.code && t.pickups?.length > 0,
        )
      );
    },
  },

  watch: {},
  methods: {},
};
</script>

<style lang="scss" scoped>
.s--product-section-tax {
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  .-shipping-box {
    margin: 4px 8px;
  }

  @media (max-width: 420px) {

    font-size: 0.8rem;

    .-tax-box,
    .-shipping-box {
      margin: 4px 0;
    }
    .-pickup-box {
    }
  }
}
</style>
