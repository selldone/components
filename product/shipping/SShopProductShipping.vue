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
    <v-container v-if="has_pickup" fluid class="my-16">
      <v-row align="center">
        <v-col cols="12" md="6" class="text-start">
          <v-list-subheader>● Pickup {{ product.title }}</v-list-subheader>
          <h2 class="text-h3 line-height-normal font-weight-black">
            {{ shipping_article?.title ? shipping_article.title : "Shipping" }}
          </h2>
        </v-col>

        <v-col cols="12" md="6">
          <s-fade-scroll>
            <div class="d-flex">
              <div
                v-for="pickup in pickup_transportation.pickups"
                :key="pickup.id"
                class="-pickup-card"
              >
                <a
                  :href="MapHelper.GetMapDirectionUrl(pickup.location, true)"
                  title="Open direction to the pickup store on the map."
                  target="_blank"
                  class="-wrap"
                >
                  <img
                    v-if="pickup.location?.lng && pickup.location?.lat"
                    :src="
                      MapHelper.GetMapImage(
                        pickup.location.lng,
                        pickup.location.lat,
                        18,
                      )
                    "
                    class="hover-scale"
                    :alt="pickup.name"
                  />
                </a>
                <div class="-address">
                  <b>{{ pickup.name }}</b>
                  <span class="mx-1">●</span>
                  <flag
                    v-if="pickup.country"
                    :iso="pickup.country"
                    class="me-1"
                    :squared="false"
                  ></flag>

                  {{ MapHelper.GenerateFullAddressFromMapInfo(pickup) }}
                </div>
              </div>
            </div>
          </s-fade-scroll>
        </v-col>
      </v-row>
    </v-container>

    <v-container v-if="shipping_article" class="my-16 position-relative">
      <s-expand-view
        class="master-article-container"
        max-height="60vh"
        min-height="100px"
      >
        <s-article-editor
          class="article samin-article-content my-4 text-start"
          :title="has_pickup ? null : shipping_article.title"
          :body="shipping_article.body"
          :only-view="true"
          :edit="false"
          suffix-id="shipping"
        >
          <template v-slot:after-title>
            <div class="text-center">
              <img
                v-for="im in images"
                :src="getShopImagePath(im)"
                :key="im"
                width="32"
                height="32"
                class="ma-2 img-grayscale"
              />
            </div>
          </template>
        </s-article-editor>
      </s-expand-view>

      <!-- ▁▁▁▁▁▁▁ Go to admin panel button ▁▁▁▁▁▁▁ -->
      <div
        v-if="$vuetify.display.mdAndUp && admin_url_shipping"
        class="text-end"
      >
        <v-btn
          :href="admin_url_shipping"
          target="_blank"
          class="tnt fadeIn"
          title="Open product admin panel"
        >
          <img
            src="../../assets/selldone-logo/logo-mini-white.svg"
            width="16"
            height="16"
            class="me-1"
          />

          Edit Shipping
          <v-icon class="mx-1" size="small">open_in_new</v-icon></v-btn
        >
      </div>
    </v-container>
  </div>
</template>

<script>
import SArticleEditor from "@components/article/SArticleEditor.vue";
import SFadeScroll from "@components/ui/fade-scroll/SFadeScroll.vue";
import { LogisticProfileType } from "@core/enums/logistic/LogisticProfileType";
import { SetupService } from "@core/server/SetupService";
import { ProductType } from "@core/enums/product/ProductType";
import { ShopTransportations } from "@core/enums/logistic/ShopTransportations";
import { MapHelper } from "@core/helper/map/MapHelper";
import SExpandView from "@components/ui/expand-view/SExpandView.vue";

export default {
  name: "SShopProductShipping",
  props: {
    shop: {
      require: true,
    },
    product: {
      require: true,
    },
  },
  components: {
    SExpandView,
    SFadeScroll,
    SArticleEditor,
  },

  data: function () {
    return {};
  },

  computed: {
    MapHelper() {
      return MapHelper;
    },
    is_physical() {
      return this.product.type === ProductType.PHYSICAL.code;
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
    has_pickup() {
      return !!this.pickup_transportation;
    },

    // ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Logistic Profile > Shipping ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃

    shipping_profile() {
      return (
        this.product &&
        this.product.profiles &&
        this.product.profiles.find(
          (p) => p.type === LogisticProfileType.SHIPPING.value,
        )
      );
    },
    shipping_article() {
      return this.shipping_profile ? this.shipping_profile.article : null;
    },

    admin_url_shipping() {
      const can_edit = this.product?.article_pack?.can_edit;

      return (
        this.shipping_profile &&
        this.USER() &&
        (this.USER_ID() === this.shop.user_id || can_edit) &&
        SetupService.MainServiceUrl() +
          `/shuttle/shop/${this.shop.id}/logistic/profiles/${this.shipping_profile.id}/dashboard`
      );
    },
  },

  watch: {},
  created() {},

  methods: {},
};
</script>

<style scoped lang="scss">
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
