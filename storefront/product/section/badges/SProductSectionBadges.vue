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
  <v-container
    :class="{ '-large': large, '-small': vertical }"
    class="s--shop-product-section-box-badges"
  >
    <!-- █████████████████████ Badges and Options █████████████████████ -->

    <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ Seller Options ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ -->

    <v-row
      v-if="!custom_badges"
      :dense="vertical"
      align="center"
      class="-badge"
      justify="center"
    >
      <div v-if="lead_time_object">
        <img
          :src="lead_time_object.icon"
          :title="lead_time_object.title(this, $product.lead)"
          alt="Lead Time"
        />
        <p class="-badge-title">
          {{ lead_time_object.title(this, $product.lead) }}
        </p>
      </div>

      <div v-if="has_return_order">
        <img
          :title="
            $t('product_info.return_in_days', {
              days: $product.return_warranty,
            })
          "
          src="../../../../assets/product-badges/return_order.svg"
          alt="Return Order"
        />
        <p class="-badge-title">
          {{
            $t("product_info.return_in_days", {
              days: $product.return_warranty,
            })
          }}
        </p>
      </div>

      <div v-if="has_support_24h">
        <img
          :title="$t('product_info.support24h7')"
          src="../../../../assets/product-badges/support_24h.svg"
          alt="24/7 Support"
        />
        <p class="-badge-title">
          {{ $t("product_info.support24h7") }}
        </p>
      </div>
      <div v-if="has_support_normal">
        <img
          :title="$t('product_info.support_normal')"
          src="../../../../assets/product-badges/support_normal.svg"
          alt="Normal Support"
        />

        <p class="-badge-title">
          {{ $t("product_info.support_normal") }}
        </p>
      </div>

      <div v-if="has_original_warranty">
        <img
          :title="$t('product_info.original_guarantee')"
          src="../../../../assets/product-badges/orginal_warranty.svg"
          alt="Original Warranty"
        />

        <p class="-badge-title">
          {{ $t("product_info.original_guarantee") }}
        </p>
      </div>
      <div v-if="has_cash_on_delivery">
        <img
          :title="$t('product_info.cod_payment')"
          src="../../../../assets/product-badges/cash_on_delivery.svg"
          alt="Cash on Delivery"
        />

        <p class="-badge-title">
          {{ $t("product_info.cod_payment") }}
        </p>
      </div>
    </v-row>
    <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ Custom Badges ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ -->
    <v-row
      v-else-if="custom_badges.length"
      :class="{ '-small': vertical }"
      :dense="vertical"
      align="start"
      class="-badge -custom"
      justify="center"
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
            alt="Custom Badge"
          />
          <p v-if="badge.title" class="-badge-title">
            {{ badge.title }}
          </p>
        </component>
      </div>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { LeadStatus } from "@selldone/core-js/enums/logistic/LeadStatus";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";

export default {
  name: "SProductSectionBadges",
  components: {},
  inject: ["$shop", "$product"],
  props: {
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
    isPhysical() {
      return this.$product.type === ProductType.PHYSICAL.code;
    },

    custom_badges: function () {
      if (
        !this.$product.badges ||
        !Array.isArray(this.$product.badges) ||
        !this.$shop.product_badges
      )
        return null;

      const out = this.$product.badges.map((id) =>
        this.$shop.product_badges.find((b) => b.id === id),
      );

      const auto = this.$shop.product_badges.filter((badge) => {
        const reg =
          badge.pattern && badge.pattern !== "*.*" && this.$product.spec
            ? new RegExp(badge.pattern)
            : null;
        return (
          !this.$product.badges.includes(badge.id) &&
          (badge.pattern === "*.*" ||
            (reg && reg.test(JSON.stringify(this.$product.spec))))
        );
      });
      out.push(...auto);
      return out;
    },
    has_return_order() {
      return this.$product && this.$product.return_warranty > 0;
    },
    has_support_24h() {
      return this.$shop?.support_mode === "24h7d";
    },
    has_support_normal() {
      return this.$shop?.support_mode === "normal";
    },

    has_original_warranty() {
      return this.$product && this.$product.original;
    },
    has_cash_on_delivery() {
      if (!this.$shop?.gateways) return false;
      return this.isPhysical && this.$shop.gateways.some((item) => item.cod);
    },

    lead_time_object() {
      if (this.isPhysical) {
        return LeadStatus.physical.find((item) => {
          return (
            this.$product.lead > item.min && this.$product.lead <= item.max
          );
        });
      }

      if (this.isVirtual) {
        return LeadStatus.virtual.find((item) => {
          return (
            this.$product.lead > item.min && this.$product.lead <= item.max
          );
        });
      }

      return null;
    },
  },
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

      .-badge-title {
        min-height: unset;
      }
    }
  }

  .-badge-title {
    padding: 8px 4px 4px 4px;
    margin: auto;
    font-size: 0.75rem;
    font-weight: 500;
    min-height: 3em;
    max-width: 100px;
    text-wrap: balance;
    @media only screen and (max-width: 480px) {
      font-size: 0.6rem;
    }
  }

  &.-small {
    .-badge-title {
      font-size: 8px !important;
    }
  }

  &.-large {
    .-badge-title {
      font-size: 1rem;
      max-width: 200px;
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
