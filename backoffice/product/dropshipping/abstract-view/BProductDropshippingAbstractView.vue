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
  <s-widget-box
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

<style scoped></style>
