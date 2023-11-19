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
  <v-container class="s--shop-product-section-box-badges" :class="{ '-large': large , '-small': vertical}">
    <!-- █████████████████████ Badges and Options █████████████████████ -->

    <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ Seller Options ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ -->

    <v-row
        v-if="!custom_badges"
        align="center"
        justify="center"
        class="-badge"
        :dense="vertical"
    >
      <div v-if="lead_time_object">
        <img
            :src="lead_time_object.icon"
            :title="lead_time_object.title(this, product.lead)"
        />
        <p>
          {{ lead_time_object.title(this, product.lead) }}
        </p>
      </div>

      <div v-if="has_return_order">
        <img
            :title="
            $t('product_info.return_in_days', {
              days: product.return_warranty,
            })
          "
            src="../../assets/product-badges/return_order.svg"
        />
        <p>
          {{
            $t("product_info.return_in_days", {
              days: product.return_warranty,
            })
          }}
        </p>
      </div>

      <div v-if="has_support_24h">
        <img
            :title="$t('product_info.support24h7')"
            src="../../assets/product-badges/support_24h.svg"
        />
        <p>
          {{ $t("product_info.support24h7") }}
        </p>
      </div>
      <div v-if="has_support_normal">
        <img
            :title="$t('product_info.support_normal')"
            src="../../assets/product-badges/support_normal.svg"
        />

        <p>
          {{ $t("product_info.support_normal") }}
        </p>
      </div>

      <div v-if="has_original_warranty">
        <img
            :title="$t('product_info.original_guarantee')"
            src="../../assets/product-badges/orginal_warranty.svg"
        />

        <p>
          {{ $t("product_info.original_guarantee") }}
        </p>
      </div>
      <div v-if="has_cash_on_delivery">
        <img
            :title="$t('product_info.cod_payment')"
            src="../../assets/product-badges/cash_on_delivery.svg"
        />

        <p>
          {{ $t("product_info.cod_payment") }}
        </p>
      </div>
    </v-row>
    <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ Custom Badges ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ -->
    <v-row
        v-else-if="custom_badges.length"
        align="start"
        justify="center"
        class="-badge -custom"
        :class="{ '-small': vertical }"
        :dense="vertical"
    >
      <div v-for="badge in custom_badges" :key="badge.id">
        <component
            :is="badge.link ? 'a' : 'span'"
            :href="badge.link"
            target="_blank"
        >
          <img
              v-if="badge.image"
              :src="getShopImagePath(badge.image)"
              :title="badge.title"
              class="rounded hover-scale"
          />
          <p v-if="badge.title">
            {{ badge.title }}
          </p>
        </component>
      </div>
    </v-row>
  </v-container>
</template>

<script>
import { LeadStatus } from "@core/enums/logistic/LeadStatus";
export default {
  name: "SShopProductSectionBoxBadges",
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

    vertical: {
      type: Boolean,
      default: false,
    },

    large: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({}),

  computed: {
    custom_badges: function () {
      if (
          !this.product.badges ||
          !Array.isArray(this.product.badges) ||
          !this.shop.product_badges
      )
        return null;

      const out = this.product.badges.map((id) =>
          this.shop.product_badges.find((b) => b.id === id)
      );

      const auto = this.shop.product_badges.filter((badge) => {
        const reg =
            badge.pattern && badge.pattern !== "*.*" && this.product.spec
                ? new RegExp(badge.pattern)
                : null;
        return (
            !this.product.badges.includes(badge.id) &&
            (badge.pattern === "*.*" ||
                (reg && reg.test(JSON.stringify(this.product.spec))))
        );
      });
      out.push(...auto);
      return out;
    },
    has_return_order() {
      return this.product && this.product.return_warranty > 0;
    },
    has_support_24h() {
      return this.getShop() && this.getShop().support_mode === "24h7d";
    },
    has_support_normal() {
      return this.getShop() && this.getShop().support_mode === "normal";
    },
    has_fast_delivery() {
      return this.isPhysical && this.product.lead <= 3;
    },
    has_original_warranty() {
      return this.product && this.product.original;
    },
    has_cash_on_delivery() {
      if (!this.getShop().gateways) return false;
      return (
          this.isPhysical &&
          this.getShop() &&
          this.getShop().gateways.some((item) => item.cod)
      );
    },

    lead_time_object() {
      if (this.isPhysical) {
        return LeadStatus.physical.find((item) => {
          return this.product.lead > item.min && this.product.lead <= item.max;
        });
      }

      if (this.isVirtual) {
        return LeadStatus.virtual.find((item) => {
          return this.product.lead > item.min && this.product.lead <= item.max;
        });
      }

      return null;
    },
  },
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

.s--shop-product-section-box-badges {

  .-badge {
    text-align: center;
    div {
      user-select: none;
      flex-grow: 1;
    }
    img {
      width: 24px;
      height: 24px;
    }


    &.-custom {
      img {
        object-fit: cover;
        width: 42px;
        height: 42px;
      }
      p {
        min-height: unset;
      }
    }
  }

  p {
    margin: 8px 4px 4px 4px;
    font-size: 0.75rem;
    font-weight: 500;
    min-height: 3em;
    @media only screen and (max-width: 480px) {
      font-size: 0.6rem;
    }
  }

  &.-small {
    p {
      font-size: 8px !important;
    }
  }


  &.-large {
    p {
      font-size: 1rem;
    }
    .-badge {
      img {
        width: 48px;
        height: 48px;
        margin-bottom: 16px;
      }
    }
  }




}
</style>
