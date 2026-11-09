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

<template>
  <component
    :is="modern ? 'section' : 's-widget-box'"
    :title="modern ? undefined : `<h5 class='align-items-center pb-1'>⚡ ${$t('product_flow.title')}</h5>`"
    class="b--product-flow text-start"
    :class="{ 'sd-modern-widget b--product-flow--modern': modern }"
    :sub-title="modern ? undefined : $t('product_flow.subtitle')"
  >
    <header v-if="modern" class="sd-modern-header">
      <div class="sd-modern-title">
        <v-icon class="sd-modern-icon sd-modern-icon--plain" aria-hidden="true">account_tree</v-icon>
        <div>
          <h2 class="sd-modern-title-text">{{ $t('product_flow.title') }}</h2>
          <p class="sd-modern-subtitle">{{ $t('b_product_dashboard.flow.subtitle') }}</p>
        </div>
      </div>
    </header>
    <v-list :lines="3" class="border-between-vertical b-product-flow__checks" :rounded="modern ? false : 'xl'">
      <!-- --------------- Connect --------------- -->
      <b-product-flow-row-connect :modern="modern"></b-product-flow-row-connect>

      <!-- --------------- Product Health --------------- -->
      <b-product-flow-row-health :modern="modern"></b-product-flow-row-health>

      <!-- ⬬⬬⬬⬬ Error > Marketplace ⬬⬬⬬⬬ -->
      <b-product-flow-errors-vendor :modern="modern"></b-product-flow-errors-vendor>

      <!-- ⬬⬬⬬⬬ Error > File Empty ⬬⬬⬬⬬ -->
      <b-product-flow-errors-file :modern="modern"></b-product-flow-errors-file>

      <!-- --------------- Pricing --------------- -->
      <b-product-flow-row-pricing :modern="modern"></b-product-flow-row-pricing>

      <!-- ⬬⬬⬬⬬ Error > File Empty ⬬⬬⬬⬬ -->
      <b-product-flow-errors-subscription :modern="modern"></b-product-flow-errors-subscription>

      <!-- --------------- Selling location restriction --------------- -->
      <b-product-flow-row-location :modern="modern"></b-product-flow-row-location>

      <!-- ⬬⬬⬬⬬ Error > Location restriction ⬬⬬⬬⬬ -->
      <b-product-flow-errors-location :modern="modern"></b-product-flow-errors-location>

      <!-- --------------- Tax --------------- -->
      <b-product-flow-row-tax :modern="modern"></b-product-flow-row-tax>

      <!-- --------------- Vendor --------------- -->
      <b-product-flow-row-vendor :modern="modern"></b-product-flow-row-vendor>
    </v-list>

    <!-- --------------- Pods --------------- -->

    <!-- Shared product flowchart renderer: one compact row when it fits, step help on hover/focus/tap. -->
    <s-article-flow
      v-if="modern"
      class="b-product-flow__diagram"
      :block="flowBlock"
      :rail-columns="flowBlock.nodes.length"
      compact
      :legend-labels="{ data: $t('b_product_dashboard.flow.legend_path') }"
    >
      <template #caption />
      <template #node-icon="{ node }">
        <span
          v-if="flowStepById[node.id]?.flags?.length"
          class="b-product-flow__flags"
          aria-hidden="true"
        >
          <flag
            v-for="iso in flowStepById[node.id].flags.slice(0, 3)"
            :key="iso"
            :iso="iso"
            :squared="false"
          />
        </span>
        <img
          v-else-if="flowStepById[node.id]?.image"
          :src="flowStepById[node.id].image"
          class="b-product-flow__node-image"
          alt=""
          width="26"
          height="26"
        />
        <span v-else class="b-product-flow__node-icon" aria-hidden="true"><v-icon size="22">{{ node.icon }}</v-icon></span>
      </template>
    </s-article-flow>
    <u-pods-panel v-else color="#ddd">
      <u-pod-node
        icon="add_shopping_cart"
        :title="$t('global.commons.purchase')"
      ></u-pod-node>
      <u-pod-wire forward></u-pod-wire>
      <u-pod-node
        :image="getShopImagePath($product.icon, 64)"
        icon="inventory"
        :title="$t('global.actions.add_to_cart')"
      ></u-pod-node>

      <template v-if="isMarketplace">
        <u-pod-wire forward></u-pod-wire>
        <u-pod-node
          icon="store"
          :title="$t('global.commons.vendor')"
        ></u-pod-node>
      </template>

      <u-pod-wire forward></u-pod-wire>
      <u-pod-node
        icon="monetization_on"
        :title="$t('global.commons.pricing')"
      ></u-pod-node>

      <template v-if="has_valuation">
        <u-pod-wire forward></u-pod-wire>
        <u-pod-node
          :image="require('../../../assets/icons/valuation.svg')"
          :title="$t('global.commons.valuation')"
        ></u-pod-node>
      </template>

      <u-pod-wire forward></u-pod-wire>
      <u-pod-node
        icon="emoji_emotions"
        :title="$t('global.commons.incentives')"
      ></u-pod-node>

      <u-pod-wire forward></u-pod-wire>
      <u-pod-node
        :image="require('../../../assets/icons/tax-3d.svg')"
        :title="$t('global.commons.tax')"
      ></u-pod-node>

      <u-pod-wire forward></u-pod-wire>
      <u-pod-node
        icon="shopping_bag"
        :title="$t('global.commons.checkout')"
      ></u-pod-node>

      <template v-if="$product.type === ProductType.SERVICE.code">
        <u-pod-wire forward></u-pod-wire>
        <u-pod-node
          icon="assignment_turned_in"
          :title="$t('global.commons.confirmation')"
        ></u-pod-node>
      </template>

      <u-pod-wire forward></u-pod-wire>
      <u-pod-node
        icon="credit_score"
        :title="$t('global.commons.payment')"
      ></u-pod-node>

      <u-pod-wire forward></u-pod-wire>
      <u-pod-node
        :image="getProductTypeImage($product.type)"
        :title="$t('global.commons.fulfillment')"
      ></u-pod-node>

      <template v-if="isSubscription">
        <u-pod-wire forward></u-pod-wire>
        <u-pod-node
          icon="repeat"
          :title="$t('global.commons.recurring_payment')"
        ></u-pod-node>
      </template>

      <template v-if="isSubscription && ribbon_link_type">
        <u-pod-wire forward></u-pod-wire>
        <u-pod-node
          :image="ribbon_link_type.image"
          :title="'+ ' + $t('global.commons.order')"
        ></u-pod-node>
      </template>

      <template v-if="connect">
        <u-pod-wire backward forward></u-pod-wire>
        <u-pod-node
          :image="getShopImagePath(connect.icon)"
          :title="connect.name"
        ></u-pod-node>
      </template>
    </u-pods-panel>
  </component>
</template>

<script lang="ts">
import SArticleFlow from "../../../article/add-on/flowchart/SArticleFlow.vue";
import UPodsPanel from "../../../ui/pod/panel/UPodsPanel.vue";
import UPodNode from "../../../ui/pod/node/UPodNode.vue";
import UPodWire from "../../../ui/pod/wire/UPodWire.vue";
import { SubscriptionMode } from "@selldone/core-js/enums/subscription/SubscriptionMode";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import SWidgetBox from "../../../ui/widget/box/SWidgetBox.vue";
import { BusinessModel } from "@selldone/core-js/enums/shop/BusinessModel";
import BProductFlowErrorsVendor from "../../product/flow/errors/vendor/BProductFlowErrorsVendor.vue";
import BProductFlowRowConnect from "../../product/flow/row/connect/BProductFlowRowConnect.vue";
import BProductFlowRowHealth from "../../product/flow/row/health/BProductFlowRowHealth.vue";
import BProductFlowRowPricing from "../../product/flow/row/pricing/BProductFlowRowPricing.vue";
import BProductFlowRowLocation from "../../product/flow/row/location/BProductFlowRowLocation.vue";
import BProductFlowRowTax from "../../product/flow/row/tax/BProductFlowRowTax.vue";
import BProductFlowRowVendor from "../../product/flow/row/vendor/BProductFlowRowVendor.vue";
import BProductFlowErrorsFile from "../../product/flow/errors/file/BProductFlowErrorsFile.vue";
import BProductFlowErrorsLocation from "../../product/flow/errors/location/BProductFlowErrorsLocation.vue";
import BProductFlowErrorsSubscription from "../../product/flow/errors/subscription/BProductFlowErrorsSubscription.vue";
import ProductMixin from "@selldone/components-vue/mixin/product/ProductMixin.ts";

export default {
  name: "FlowProduct",
  mixins: [ProductMixin],
  components: {
    SArticleFlow,
    BProductFlowErrorsSubscription,
    BProductFlowErrorsLocation,
    BProductFlowErrorsFile,
    BProductFlowRowVendor,
    BProductFlowRowTax,
    BProductFlowRowLocation,
    BProductFlowRowPricing,
    BProductFlowRowHealth,
    BProductFlowRowConnect,
    BProductFlowErrorsVendor,
    SWidgetBox,
    UPodWire,
    UPodNode,
    UPodsPanel,
  },
  inject: ["$shop", "$product"],

  props: { modern: { type: Boolean, default: false } },

  data: function () {
    return {
      ProductType: ProductType,
    };
  },

  computed: {
    flowSteps() {
      const step = (id, title, icon, image = undefined) => ({
        id, title: this.$t(title), icon, image,
        help: this.$t(`b_product_dashboard.flow.help.${id}`),
      });
      const steps = [step("purchase", "global.commons.purchase", "add_shopping_cart")];
      // The product's own country/ZIP rule is checked before the item can enter a cart.
      const locations = this.$product.locations;
      if (locations) {
        const countries = Object.keys(locations);
        const places = countries.map((country) => this.$t("b_product_dashboard.flow.location_place", { country: this.getCountryName(country), count: locations[country]?.length || 0 }));
        const location = step("locations", "b_product_inventory.locations.title", "mode_of_travel");
        steps.push({
          ...location,
          flags: countries,
          // The tile shows three flags; the caption counts the rest.
          note: !countries.length
            ? this.$t("b_product_inventory.locations.scope.product_none")
            : countries.length > 3 ? this.$t("b_product_dashboard.flow.locations_more", { count: countries.length - 3 }) : undefined,
          help: `${location.help} ${countries.length ? this.$t("b_product_dashboard.flow.locations_allowed", { places: places.join(", ") }) : this.$t("b_product_inventory.locations.scope.product_none")}`,
        });
      }
      // Per-order quantity limits; zero means no limit.
      const min = Number(this.$product.limit_min) || 0, max = Number(this.$product.limit_max) || 0;
      const cart = step("cart", "global.actions.add_to_cart", "inventory", this.$product.icon ? this.getShopImagePath(this.$product.icon, 64) : undefined);
      if (min || max) {
        cart.note = [min && this.$t("b_product_dashboard.flow.limit_min", { count: min }), max && this.$t("b_product_dashboard.flow.limit_max", { count: max })].filter(Boolean).join(" · ");
        cart.help += " " + (min && max
          ? this.$t("b_product_dashboard.flow.limit_help_range", { min, max })
          : min ? this.$t("b_product_dashboard.flow.limit_help_min", { min }) : this.$t("b_product_dashboard.flow.limit_help_max", { max }));
      }
      steps.push(cart);
      if (this.isMarketplace) steps.push(step("vendor", "global.commons.vendor", "storefront"));
      steps.push(step("pricing", "global.commons.pricing", "monetization_on"));
      if (this.has_valuation) steps.push(step("valuation", "global.commons.valuation", "tune", require("../../../assets/icons/valuation.svg")));
      steps.push(
        step("incentives", "global.commons.incentives", "local_offer"),
        step("tax", "global.commons.tax", "balance", require("../../../assets/icons/tax-3d.svg")),
        step("checkout", "global.commons.checkout", "shopping_bag"),
      );
      if (this.isService) steps.push(step("confirmation", "global.commons.confirmation", "assignment_turned_in"));
      steps.push(
        step("payment", "global.commons.payment", "credit_score"),
        step("fulfillment", "global.commons.fulfillment", "inventory_2", this.getProductTypeImage(this.$product.type)),
      );
      if (this.isSubscription) steps.push(step("recurring", "global.commons.recurring_payment", "repeat"));
      if (this.isSubscription && this.ribbon_link_type) {
        steps.push({ ...step("linked", "global.commons.order", "shopping_bag", this.ribbon_link_type.image), title: "+ " + this.$t("global.commons.order") });
      }
      if (this.connect) {
        steps.push({ ...step("connect", "global.commons.connect", "cable", this.getShopImagePath(this.connect.icon)), title: this.connect.name, backward: true, note: this.$t("b_product_dashboard.flow.two_way") });
      }
      return steps;
    },
    flowStepById() {
      return Object.fromEntries(this.flowSteps.map((step) => [step.id, step]));
    },
    // The steps as a linear SArticleFlow block; trusted runtime data, never stored in an article.
    flowBlock() {
      const steps = this.flowSteps;
      return {
        type: "flow",
        title: this.$t("product_flow.title"),
        description: this.$t("b_product_dashboard.flow.subtitle"),
        animated: true,
        nodes: steps.map((step) => ({
          id: step.id,
          label: step.title,
          description: step.help,
          icon: step.icon,
          caption: step.note || "",
          outcome: null,
        })),
        edges: steps.slice(1).map((step, index) => ({ from: steps[index].id, to: step.id, label: "" })),
      };
    },
    isMarketplace() {
      return this.$shop.model === BusinessModel.MARKETPLACE.code;
    },

    isPhysical() {
      return this.$product.type === ProductType.PHYSICAL.code;
    },
    isVirtual() {
      return this.$product.type === ProductType.VIRTUAL.code;
    },
    isService() {
      return this.$product.type === ProductType.SERVICE.code;
    },
    isSubscription() {
      return this.$product.type === ProductType.SUBSCRIPTION.code;
    },

    ribbon() {
      return this.$product.ribbon;
    },
    subscription_mode() {
      return SubscriptionMode[this.ribbon?.mode];
    },
    ribbon_link_type() {
      return this.subscription_mode?.link_type;
    },

    has_valuation() {
      return !!this.$product.valuation;
    },

    connect() {
      return this.$product.connect;
    },
  },

  methods: {},
};
</script>

<style lang="scss" scoped>
.b--product-flow {
  :deep(.v-list) {
    .v-list-item .v-list-item__prepend .v-icon {
      opacity: 1 !important;
    }

    .v-list-item-subtitle {
      --v-medium-emphasis-opacity: 1;
    }
  }
}

.b--product-flow--modern {
  padding: 22px;
  border-radius: 15px;
  font-size: 14px;
  line-height: 22px;

  .sd-modern-header { margin-bottom: 18px; }
  .sd-modern-title { align-items: flex-start; }
  .sd-modern-title-text { font-size: 16px; line-height: 24px; font-weight: 500; }
  .sd-modern-subtitle { font-size: 12px; line-height: 19px; margin-top: 3px; }
  .sd-modern-icon--plain { font-size: 16px; margin-top: 3px; }

  :deep(.b-product-flow__checks) { padding: 0; background: transparent; border-radius: 0; }
  :deep(.b-product-flow__checks > .v-row) { margin: 0; align-items: center; gap: 8px; }
  :deep(.v-list-item) { min-height: 0; padding: 12px 0; flex: 1 1 300px; }
  :deep(.v-list-item__prepend) { align-self: start; margin-top: 2px; }
  :deep(.v-list-item__prepend > .v-icon) { font-size: 20px; margin-inline-end: 14px; }
  :deep(.v-list-item__prepend > .v-avatar) { width: 28px; height: 28px; margin-inline-end: 12px; }
  :deep(.v-list-item-title) { font-size: 14px; line-height: 22px; font-weight: 500; white-space: normal; }
  :deep(.v-list-item-subtitle) { font-size: 12px; line-height: 19px; white-space: normal; -webkit-line-clamp: unset; }
  :deep(.v-list-item-subtitle .sd-modern-status__dot) {
    display: inline-block; vertical-align: middle; margin-inline-end: 6px;
  }
  :deep(.v-row > .text-end) { flex: 0 1 auto !important; display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 6px; }
  :deep(.b-product-flow__alert) { background: var(--sd-modern-inset); border-radius: 10px; padding: 4px 12px; }
  :deep(.b-product-flow__alert .v-list-item__prepend > .v-icon) { color: rgb(var(--v-theme-error)); animation: none; }
  :deep(.b-product-flow__location) { background: var(--sd-modern-inset); color: rgb(var(--v-theme-on-surface)); }

  // Shared flowchart: neutral glyphs or real artwork in a 26px slot, flags for the product's own countries.
  .b-product-flow__diagram { margin-block-start: 18px; }
  .b-product-flow__node-icon { display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; color: rgb(var(--v-theme-on-surface)); }
  .b-product-flow__node-image { width: 26px; height: 26px; object-fit: contain; }
  .b-product-flow__flags { display: inline-flex; align-items: center; gap: 3px; height: 26px; }
}
@media (max-width: 600px) {
  .b--product-flow--modern {
    padding: 16px 12px;
    border-radius: 12px;
    :deep(.v-row > .text-end) { justify-content: flex-start; width: 100%; padding-inline-start: 40px; }
    :deep(.v-list-item) { flex-basis: 100%; }
  }
}
</style>
