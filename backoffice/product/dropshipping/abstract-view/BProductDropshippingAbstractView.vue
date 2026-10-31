<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
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
  <section v-if="modern" class="sd-modern-widget b-product-dropshipping-refined text-start">
    <header class="sd-modern-header">
      <div class="sd-modern-title">
        <img src="../../../../assets/icons/dropshipping.svg" width="18" height="22" alt="" />
        <div><h2 class="sd-modern-title-text">{{ $t('global.commons.drop_shipping') }}</h2><p class="sd-modern-subtitle">{{ $t('b_product_dashboard.identity.dropshipping_subtitle') }}</p></div>
      </div>
      <span class="sd-modern-status sd-modern-status--plain"><i class="sd-modern-status__dot" :class="parent_deleted || parent_closed ? 'sd-modern-status__dot--error' : parent.status === 'Open' ? 'sd-modern-status__dot--success' : 'sd-modern-status__dot--warning'"></i>{{ $t(parent_deleted ? 'global.commons.deleted' : parent_closed ? 'global.commons.inactive' : parent.status === 'Open' ? 'global.commons.active' : 'global.commons.pending') }}</span>
    </header>
    <div v-if="need_re_enable" class="sd-modern-notice b-product-dropshipping-refined__notice" role="status"><v-icon size="18">info_outline</v-icon><div><p>{{ $t('product_dropshipping.need_re_enable') }}</p><v-btn :loading="busy_enable" variant="outlined" class="sd-modern-button sd-modern-button--small" prepend-icon="done_all" @click="reEnable()">{{ $t('product_dropshipping.need_re_enable_action') }}</v-btn></div></div>
    <div v-if="changed_value" class="sd-modern-notice b-product-dropshipping-refined__notice" role="status"><v-icon size="18">sync</v-icon><div><p>{{ $t('product_dropshipping.changed_value') }}</p><v-btn :loading="busy_enable" variant="outlined" class="sd-modern-button sd-modern-button--small" prepend-icon="done_all" @click="applyChanges()">{{ $t('product_dropshipping.changed_value_action') }}</v-btn></div></div>
    <div v-if="parent_deleted" class="sd-modern-notice b-product-dropshipping-refined__notice" role="alert"><v-icon size="18" color="error">error_outline</v-icon><p>{{ $t('product_dropshipping.parent_deleted') }}</p></div>
    <div v-if="parent_closed" class="sd-modern-notice b-product-dropshipping-refined__notice" role="status"><v-icon size="18" color="warning">warning_amber</v-icon><p>{{ $t('product_dropshipping.parent_closed') }}</p></div>
    <div class="b-product-dropshipping-refined__seller">
      <v-avatar size="36"><img :src="getShopImagePath(parent.shop.icon)" :alt="parent.shop.title" /></v-avatar>
      <div><span class="sd-modern-muted">{{ $t('global.commons.main_seller') }}</span><a :href="ShopURLs.MainShopUrl(parent.shop)" target="_blank" rel="noopener noreferrer">{{ parent.shop.title }}<v-icon size="16">north_east</v-icon></a><p>{{ parent.shop.description }}</p></div>
    </div>
    <section v-if="has_variants" class="b-product-dropshipping-refined__variants">
      <h3>{{ $t('global.commons.Variants') }}</h3>
      <s-country-select v-model="selected_shipping_country" :filter="shipping_countries" class="max-width-field mb-3" dense hide-details item-value="alpha2" solo />
      <b-product-variants-table :product="parent" :shipping-cost="parent.shipping ? parent.shipping[selected_shipping_country] : 0" :shop="parent.shop" modern view-only />
    </section>
  </section>
  <s-widget-box
    v-else
    :active="true"
    :extended="has_variants"
    :src="require('../../../../assets/icons/dropshipping.svg')"
    :title="`<h5 class='align-items-center pb-1'>    <span class='circle ${
      parent.status === 'Open' ? 'bg-success' : 'bg-danger'
    } mr-sm' style='font-size: 6px;'></span>  ${$t(
      'global.commons.drop_shipping',
    )} </h5>`"
    style="border-top: solid #689f38 medium"
  >
    <template v-slot:top-left></template>

    <template v-slot:actions>
      <v-alert
        v-if="need_re_enable"
        border="start"
        color="success"
        icon="info"
        variant="elevated"
        density="compact"
        class="mb-3"
      >
        <p>
          {{ $t("product_dropshipping.need_re_enable") }}
        </p>
        <v-btn
          :loading="busy_enable"
          color="#fff"
          variant="elevated"
          @click="reEnable()"
          class="mt-2"
          prepend-icon="done_all"
        >
          {{ $t("product_dropshipping.need_re_enable_action") }}
        </v-btn>
      </v-alert>

      <v-alert
        v-if="changed_value"
        border="start"
        color="blue"
        icon="info"
        variant="elevated"
        density="compact"
        class="mb-3"
      >
        <p>
          {{ $t("product_dropshipping.changed_value") }}
        </p>
        <v-btn
          :loading="busy_enable"
          color="#fff"
          variant="elevated"
          @click="applyChanges()"
          class="mt-2"
          prepend-icon="done_all"
        >
          {{ $t("product_dropshipping.changed_value_action") }}
        </v-btn>
      </v-alert>

      <v-alert
        v-if="parent_deleted"
        border="start"
        color="red"
        icon="error"
        variant="elevated"
        density="compact"
        class="mb-3"
      >
        <p>
          {{ $t("product_dropshipping.parent_deleted") }}
        </p>
      </v-alert>

      <v-alert
        v-if="parent_closed"
        border="start"
        color="amber"
        icon="warning"
        variant="elevated"
        density="compact"
        class="mb-3"
      >
        <p>
          {{ $t("product_dropshipping.parent_closed") }}
        </p>
      </v-alert>

      <div>
        <small>{{ $t("global.commons.main_seller") }}:</small>
        <p>
          <v-avatar size="36">
            <img :src="getShopImagePath(parent.shop.icon)" />
          </v-avatar>
          <a
            :href="ShopURLs.MainShopUrl(parent.shop)"
            class="link-dash ms-1"
            target="_blank"
          >
            {{ parent.shop.title }}
          </a>
        </p>
        <p class="small">
          {{ parent.shop.description }}
        </p>
      </div>
    </template>

    <template v-if="has_variants" v-slot:footer>
      <v-list-subheader
        ><i class="fas fa-angle-down me-2"></i>
        {{ $t("global.commons.Variants") }}
      </v-list-subheader>

      <s-country-select
        v-model="selected_shipping_country"
        :filter="shipping_countries"
        class="max-width-field m-2"
        dense
        hide-details
        item-value="alpha2"
        solo
      ></s-country-select>

      <b-product-variants-table
        :product="parent"
        :shipping-cost="
          parent.shipping ? parent.shipping[selected_shipping_country] : 0
        "
        :shop="parent.shop"
        view-only
      >
      </b-product-variants-table>
    </template>
  </s-widget-box>
</template>

<script lang="ts">
import SWidgetBox from "../../../../ui/widget/box/SWidgetBox.vue";
import BProductVariantsTable from "../../variants/table/BProductVariantsTable.vue";
import SCountrySelect from "../../../../ui/country/select/SCountrySelect.vue";
import { ShopURLs } from "@selldone/core-js/helper";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BProductDropshippingAbstractView",
  mixins: [],
  components: {
    SCountrySelect,
    BProductVariantsTable,

    SWidgetBox,
  },
  props: {
    modern: Boolean,
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
    busy_enable: false,
    selected_shipping_country: null,
  }),
  computed: {
    ShopURLs() {
      return ShopURLs;
    },
    add_by_dropShipping() {
      return !!this.product.parent_id;
    },
    parent() {
      return this.product.parent;
    },

    has_variants() {
      return (
        this.parent.product_variants && this.parent.product_variants.length > 0
      );
    },

    parent_deleted() {
      return !!this.parent.deleted_at;
    },

    parent_closed() {
      return this.parent.status === "Close";
    },

    need_re_enable() {
      return (
        this.product.status === "Close" &&
        !this.parent_closed &&
        !this.parent_deleted
      );
    },

    changed_value() {
      if (this.parent_closed || this.parent_deleted || this.need_re_enable)
        return false;

      const checks = [
        "brand",
        "warranty",
        "spec",
        "spec_order",
        "pros",
        "cons",
        "message",
        "inputs",
        "outputs",
        "lead",
        "extra",
        "return_warranty",
        "original",
        "quantity",
      ];

      let changed = false;
      checks.forEach((key) => {
        if (
          JSON.stringify(this.parent[key]) !== JSON.stringify(this.product[key])
        ) {
          console.log(
            "changed_value",
            key,
            this.parent[key],
            this.product[key],
          );
          changed = true;
        }
      });

      return changed;
    },

    shipping_countries() {
      if (!this.parent.shipping) return [];
      return Object.keys(this.parent.shipping);
    },
  },
  created() {
    this.selected_shipping_country = this.shipping_countries.length
      ? this.shipping_countries[0]
      : null;
  },
  methods: {
    reEnable() {
      this.busy_enable = true;
      axios
        .post(
          window.API.POST_DROP_SHIPPING_PRODUCT_RE_ENABLE(
            this.product.shop_id,
            this.product.id,
          ),
          {},
        )
        .then(({ data }) => {
          if (!data.error) {
            Object.assign(this.product, data.product);

            NotificationService.showSuccessAlert(
              null,
              this.$t("product_dropshipping.notifications.re_enable_success"),
            );
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_enable = false;
        });
    },

    applyChanges() {
      this.busy_enable = true;
      axios
        .post(
          window.API.POST_DROP_SHIPPING_PRODUCT_APPLY_CHANGES(
            this.product.shop_id,
            this.product.id,
          ),
          {},
        )
        .then(({ data }) => {
          if (!data.error) {
            Object.assign(this.product, data.product);

            NotificationService.showSuccessAlert(
              null,
              this.$t("product_dropshipping.notifications.update_success"),
            );
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_enable = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.b-product-dropshipping-refined.sd-modern-widget {
  padding: 22px;
  border-radius: 15px;
  .sd-modern-header { align-items: flex-start; margin-block-end: 18px; }
  .sd-modern-title { gap: 10px; }
  .sd-modern-title > img { flex-shrink: 0; }
  .sd-modern-title-text { font-size: 16px; font-weight: 500; line-height: 24px; }
  .sd-modern-subtitle { font-size: 12px; line-height: 19px; margin-block-start: 3px; }
  .b-product-dropshipping-refined__notice { display: flex; align-items: flex-start; gap: 10px; margin-block-end: 14px; }
  .b-product-dropshipping-refined__notice p { margin: 0; font-size: 14px; line-height: 22px; }
  .b-product-dropshipping-refined__notice .v-btn { margin-block-start: 10px; }
  .b-product-dropshipping-refined__seller { display: flex; gap: 10px; align-items: flex-start; font-size: 12px; line-height: 19px; }
  .b-product-dropshipping-refined__seller > div { min-width: 0; }
  .b-product-dropshipping-refined__seller a { display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 500; overflow-wrap: anywhere; }
  .b-product-dropshipping-refined__seller p { margin-block: 6px 0; }
  .b-product-dropshipping-refined__variants { margin-block-start: 22px; }
  h3 { margin-block-end: 12px; font-size: 14px; font-weight: 500; line-height: 22px; }
}
@media (max-width: 560px) { .b-product-dropshipping-refined.sd-modern-widget { padding: 16px 12px; border-radius: 12px; } }
</style>
