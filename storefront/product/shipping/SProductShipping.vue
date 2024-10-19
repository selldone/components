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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div class="s--shop-product-shipping">
    <v-container v-if="has_pickup" class="my-16" fluid>
      <v-row align="center">
        <v-col class="text-start" cols="12" md="6">
          <v-list-subheader>● Pickup {{ $product.title }}</v-list-subheader>
          <h2 class="text-h3 line-height-normal font-weight-black">
            {{ shipping_article?.title ? shipping_article.title : "Shipping" }}
          </h2>
        </v-col>

        <v-col cols="12" md="6">
          <u-fade-scroll>
            <div class="d-flex">
              <div
                v-for="pickup in pickups"
                :key="pickup.id"
                class="-pickup-card"
              >
                <a
                  :href="MapHelper.GetMapDirectionUrl(pickup.location, true)"
                  class="-wrap"
                  target="_blank"
                  title="Open direction to the pickup store on the map."
                >
                  <img
                    v-if="pickup.location?.lng && pickup.location?.lat"
                    :alt="pickup.name"
                    :src="
                      MapHelper.GetMapImage(
                        pickup.location.lng,
                        pickup.location.lat,
                        18,
                      )
                    "
                    class="hover-scale"
                  />
                </a>
                <div class="-address">
                  <b>{{ pickup.name }}</b>
                  <span class="mx-1">●</span>
                  <flag
                    v-if="pickup.country"
                    :iso="pickup.country"
                    :squared="false"
                    class="me-1"
                  ></flag>

                  {{ MapHelper.GenerateFullAddressFromMapInfo(pickup) }}
                </div>
              </div>
            </div>
          </u-fade-scroll>
        </v-col>
      </v-row>
    </v-container>

    <v-container v-if="shipping_article" class="my-16 position-relative">
      <u-expand-view
        class="master-article-container"
        max-height="60vh"
        min-height="100px"
      >
        <s-article-editor
          :body="shipping_article.body"
          :edit="false"
          :only-view="true"
          :title="has_pickup ? null : shipping_article.title"
          class="article samin-article-content my-4 text-start"
          suffix-id="shipping"
        >
          <template v-slot:after-title>
            <div class="text-center">
              <img
                v-for="im in images"
                :key="im"
                :src="getShopImagePath(im)"
                class="ma-2 img-grayscale"
                height="32"
                width="32"
              />
            </div>
          </template>
        </s-article-editor>
      </u-expand-view>

      <!-- ▁▁▁▁▁▁▁ Go to admin panel button ▁▁▁▁▁▁▁ -->
      <div
        v-if="$vuetify.display.mdAndUp && admin_url_shipping"
        class="text-end"
      >
        <v-btn
          :href="admin_url_shipping"
          class="tnt fadeIn"
          target="_blank"
          title="Open product admin panel"
          color="#000"
        >
          <img
            class="me-1"
            height="16"
            src="../../../assets/selldone-logo/logo-mini-white.svg"
            width="16"
          />

          Edit Shipping
          <v-icon class="mx-1" size="small">open_in_new</v-icon>
        </v-btn>
      </div>
    </v-container>
  </div>
</template>

<script lang="ts">
import SArticleEditor from "../../../article/SArticleEditor.vue";
import UFadeScroll from "../../../ui/fade-scroll/UFadeScroll.vue";
import { LogisticProfileType } from "@selldone/core-js/enums/logistic/LogisticProfileType";
import { SetupService } from "@selldone/core-js/server/SetupService";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import { ShopTransportations } from "@selldone/core-js/enums/logistic/ShopTransportations";
import { MapHelper } from "@selldone/core-js/helper/map/MapHelper";
import UExpandView from "../../../ui/expand-view/UExpandView.vue";
import { BusinessModel } from "@selldone/core-js/enums/shop/BusinessModel";

export default {
  name: "SProductShipping",
  inject: ["$shop", "$product"],

  props: {},
  components: {
    UExpandView,
    UFadeScroll,
    SArticleEditor,
  },

  data: function () {
    return {
      MapHelper: MapHelper,
    };
  },

  computed: {
    is_physical() {
      return this.$product.type === ProductType.PHYSICAL.code;
    },

    transportations() {
      return this.$shop.transportations;
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

    IS_MARKETPLACE() {
      return this.$shop.model === BusinessModel.MARKETPLACE.code;
    },
    pickup_transportation_for_vendors_exists() {
      return (
        this.IS_MARKETPLACE &&
        this.$shop.transportations?.some(
          (transportation) =>
            transportation.type === ShopTransportations.Pickup.code &&
            transportation.marketplace,
          /* Transportation must be available for vendors. If the marketplace mode is not direct, 
         'marketplace' could be true (miss config!)! But vendor_products would not return any value. This check is safe, so there's no need to explicitly check
         the marketplace mode. */
        )
      );
    },

    pickups() {
      if (this.pickup_transportation_for_vendors_exists) {
        // We are in the marketplace, with vendors send orders directly! So we should show pickup options of vendors!
        return this.$product.vendor_products
          ?.map((pv) => {
            return pv.vendor?.warehouse;
          })
          .filter((p) => !!p);
      }

      return (
        this.is_physical &&
        this.transportations?.find(
          (t) =>
            t.type === ShopTransportations.Pickup.code && t.pickups?.length > 0,
        )?.pickups
      );
    },
    has_pickup() {
      return this.pickups?.length > 0;
    },

    // ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Logistic Profile > Shipping ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃

    shipping_profile() {
      return this.$product?.profiles?.find(
        (p) => p.type === LogisticProfileType.SHIPPING.value,
      );
    },
    shipping_article() {
      return this.shipping_profile ? this.shipping_profile.article : null;
    },

    admin_url_shipping() {
      const can_edit = this.$product?.article_pack?.can_edit;

      return (
        this.shipping_profile &&
        this.USER() &&
        (this.USER_ID() === this.$shop.user_id || can_edit) &&
        SetupService.MainServiceUrl() +
          `/shuttle/shop/${this.$shop.id}/logistic/profiles/${this.shipping_profile.id}/dashboard`
      );
    },
  },

  watch: {},
  created() {},

  methods: {},
};
</script>

<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--shop-product-shipping {
  .-pickup-card {
    width: 320px;
    padding: 12px;
    margin: 12px;

    .-wrap {
      border-radius: 4px;
      margin-bottom: 12px;
      overflow: hidden;
      width: 300px;
      height: 300px;
      display: inline-block;
      position: relative;

      &:after {
        content: "";
        position: absolute;
        top: 50%;
        left: 50%;
        width: 10px;
        height: 10px;
        background-color: #000; // Set the color of the dot
        border-radius: 50%;
        transform: translate(-50%, -50%);
        z-index: 2;
        transition: all 0.35s;
      }

      img {
        width: 100%;
        height: 100%;
      }
    }

    .-address {
      text-align: start;
      white-space: normal;
    }

    &:hover {
      .-wrap {
        &:after {
          background: transparent;
          border: solid 2px #000;
          width: 64px;
          height: 64px;
        }
      }
    }
  }
}
</style>
