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
  <div v-if="modern" class="s-business-model-modern text-start">
    <div
      ref="modernCanvas"
      class="s-business-model-modern__canvas"
      :data-model="businessModel"
      role="img"
      :aria-label="modernSteps.map((step) => `${step.title}: ${step.caption}`).join('. ')"
    >
      <svg
        class="s-business-model-modern__connectors"
        :viewBox="`0 0 ${modernBounds.width} ${modernBounds.height}`"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <marker :id="`${modernFlowId}-arrow`" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path class="s-business-model-modern__arrow" d="M0 0L8 4L0 8Z" />
          </marker>
          <marker :id="`${modernFlowId}-order-arrow`" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path class="s-business-model-modern__arrow s-business-model-modern__arrow--order" d="M0 0L8 4L0 8Z" />
          </marker>
        </defs>
        <path
          v-for="edge in modernEdgePaths"
          :key="edge.key"
          :d="edge.path"
          class="s-business-model-modern__edge"
          :class="`s-business-model-modern__edge--${edge.kind}`"
          :marker-start="edge.kind === 'sync' ? `url(#${modernFlowId}-arrow)` : undefined"
          :marker-end="`url(#${modernFlowId}-${edge.kind === 'order' ? 'order-arrow' : 'arrow'})`"
        />
      </svg>
      <div
        v-for="node in modernNodes"
        :key="node.key"
        :data-flow-node="node.key"
        class="s-business-model-modern__node"
        :class="{ 's-business-model-modern__node--shop': node.key === 'shop' }"
        :style="{ '--flow-column': node.column, '--flow-row': node.row }"
        aria-hidden="true"
      >
        <v-avatar v-if="node.key === 'shop'" size="24" rounded="lg" class="s-business-model-modern__identity">
          <v-img v-if="shop.icon || shop.logo" :src="getShopImagePath(shop.icon || shop.logo, 96)" :alt="modernShopTitle">
            <template #error><v-icon icon="storefront" size="20" /></template>
          </v-img>
          <v-icon v-else icon="storefront" size="20" />
        </v-avatar>
        <img
          v-else-if="node.key === 'printful' || node.key === 'doba'"
          :src="node.key === 'printful' ? require('../../assets/trademark/printful.svg') : require('../../assets/trademark/doba.svg')"
          class="s-business-model-modern__brand"
          alt=""
        />
        <v-icon v-else :icon="node.icon" size="20" class="s-business-model-modern__node-icon" />
        <span class="s-business-model-modern__node-title">{{ node.title }}</span>
        <span v-if="node.hint" class="s-business-model-modern__node-hint">{{ node.hint }}</span>
      </div>
      <span
        v-for="edge in modernEdgePaths"
        :key="`number-${edge.key}`"
        class="s-business-model-modern__marker"
        :style="{ left: `${edge.x}px`, top: `${edge.y}px` }"
        aria-hidden="true"
      >{{ edge.step }}</span>
    </div>
    <ol class="s-business-model-modern__steps">
      <li v-for="(step, index) in modernSteps" :key="step.key" class="s-business-model-modern__step">
        <span class="s-business-model-modern__step-number" aria-hidden="true">{{ index + 1 }}</span>
        <div>
          <div class="s-business-model-modern__step-title">{{ step.title }}</div>
          <div class="s-business-model-modern__step-caption">{{ step.caption }}</div>
        </div>
      </li>
    </ol>
  </div>
  <div v-else :class="{ dark: dark }" class="overflow-x-auto">
    <v-row
      :style="{
        minWidth:
          (businessModel === 'normal'
            ? 3
            : businessModel === 'wholesaler'
              ? 4.5
              : 5.5) *
            110 +
          'px',
      }"
      class="align-center justify-start pa-9 flex-grow-0"
      no-gutters
    >
      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Normal ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <template v-if="businessModel === 'normal'">
        <u-pod-node
          :title="$t('global.commons.customers')"
          icon="people_outline"
          :iconColor="dark?'#fff':'#000'"
        >
        </u-pod-node>

        <div class="flex-grow-1">
          <div class="sph my-2">
            <span class="dot slow -reverse -add-offset">
              <v-icon :color="iconColor" class="center-absolute mt-n5"
                >paid</v-icon
              ></span
            >
          </div>

          <div class="sph my-2">
            <span class="dot slow -add-offset">
              <v-icon :color="iconColor" class="center-absolute mt-5"
                >local_mall</v-icon
              ></span
            >
          </div>
        </div>

        <u-pod-node :title="shop.title">
          <v-avatar class="avatar-gradient -thin -shop mb-1" size="24">
            <img :src="getShopImagePath(shop.icon, 96)" alt="Shop" />
          </v-avatar>
        </u-pod-node>
      </template>

      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Wholesaler ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <template v-else-if="businessModel === 'wholesaler'">
        <div>
          <u-pod-node
            class="my-1"
            icon="storefront"
            title="Store A"
            :iconColor="dark?'#fff':'#000'"
          ></u-pod-node>
          <u-pod-node
            class="my-1"
            icon="storefront"
            title="Store B"
            :iconColor="dark?'#fff':'#000'"
          ></u-pod-node>
        </div>

        <div class="flex-grow-1">
          <div class="sph mb-12">
            <span class="dot -reverse -add-offset">
              <v-icon
                :color="iconColor"
                class="center-absolute mt-n5"
                size="small"
                >paidfact_check</v-icon
              ></span
            >
          </div>
          <div class="sph mt-12">
            <span class="dot -reverse -add-offset">
              <v-icon
                :color="iconColor"
                class="center-absolute mt-5"
                size="small"
                >paidfact_check</v-icon
              ></span
            >
          </div>
        </div>

        <u-pod-node :title="shop.title" large>
          <v-avatar class="avatar-gradient -thin -shop mb-1" size="44">
            <img :src="getShopImagePath(shop.icon, 96)" alt="Shop" />
          </v-avatar>
        </u-pod-node>

        <div class="flex-grow-1 sph my-2">
          <span class="dot -reverse -add-offset" style="animation-delay: -1s">
            <v-icon :color="iconColor" class="center-absolute mt-5"
              >local_mall</v-icon
            ></span
          >
        </div>

        <u-pod-node
          :title="$t('global.commons.customers')"
          icon="people_outline"
          :iconColor="dark?'#fff':'#000'"
        >
        </u-pod-node>
      </template>

      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Marketplace ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <template v-else-if="businessModel === 'marketplace'">
        <u-pod-node
          :title="$t('global.commons.customers')"
          icon="people_outline"
          :iconColor="dark?'#fff':'#000'"
        >
        </u-pod-node>

        <div class="sph my-2 flex-grow-1">
          <span class="dot -reverse -add-offset">
            <v-icon :color="iconColor" class="center-absolute mt-n5"
              >paid</v-icon
            ></span
          >
        </div>

        <u-pod-node :title="shop.title" large>
          <v-avatar class="avatar-gradient -thin -shop mb-1" size="44">
            <img :src="getShopImagePath(shop.icon, 96)" alt="Shop" />
          </v-avatar>
        </u-pod-node>

        <div class="flex-grow-1">
          <div class="sph mb-12">
            <span class="dot -reverse -add-offset" style="animation-delay: -1s">
              <v-icon
                :color="iconColor"
                class="center-absolute mt-n5"
                size="small"
                >paidfact_check</v-icon
              ></span
            >
          </div>
          <div class="sph mt-12">
            <span class="dot -reverse -add-offset" style="animation-delay: -1s">
              <v-icon
                :color="iconColor"
                class="center-absolute mt-5"
                size="small"
                >paidfact_check</v-icon
              ></span
            >
          </div>
        </div>

        <div>
          <u-pod-node
            class="my-1"
            icon="storefront"
            title="Vendor A"
            :iconColor="dark?'#fff':'#000'"
          ></u-pod-node>

          <u-pod-node
            class="my-1"
            icon="storefront"
            title="Vendor B"
            :iconColor="dark?'#fff':'#000'"
          ></u-pod-node>
        </div>

        <div class="flex-grow-1">
          <div class="sph mb-10">
            <span
              class="dot -reverse -add-offset"
              style="animation-delay: -0.5s"
            >
              <v-icon
                :color="iconColor"
                class="center-absolute mt-n5"
                size="small"
                >local_mall</v-icon
              ></span
            >
          </div>
          <div class="sph mt-10">
            <span
              class="dot -reverse -add-offset"
              style="animation-delay: -0.5s"
            >
              <v-icon
                :color="iconColor"
                class="center-absolute mt-5"
                size="small"
                >local_mall</v-icon
              ></span
            >
          </div>
        </div>

        <u-pod-node
          :title="$t('global.commons.customers')"
          icon="people_outline"
          :iconColor="dark?'#fff':'#000'"
        >
        </u-pod-node>
      </template>

      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Franchise ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <template v-else-if="businessModel === 'franchise'">
        <div>
          <u-pod-node
            :title="$t('global.commons.customers')"
            class="my-1"
            icon="people_outline"
            :iconColor="dark?'#fff':'#000'"
          ></u-pod-node>

          <u-pod-node
            :title="$t('global.commons.customers')"
            class="my-1"
            icon="people_outline"
            :iconColor="dark?'#fff':'#000'"
          ></u-pod-node>
        </div>

        <div class="flex-grow-1">
          <div class="sph mb-12">
            <span class="dot -reverse -add-offset">
              <v-icon
                :color="iconColor"
                class="center-absolute mt-n5"
                size="small"
                >paidlocal_mall</v-icon
              ></span
            >
          </div>
          <div class="sph mt-12">
            <span class="dot -reverse -add-offset">
              <v-icon
                :color="iconColor"
                class="center-absolute mt-5"
                size="small"
                >paidlocal_mall</v-icon
              ></span
            >
          </div>
        </div>

        <div>
          <u-pod-node
            :title="$t('global.commons.affiliate')"
            class="my-1"
            icon="storefront"
            title-icon="looks_one"
            :iconColor="dark?'#fff':'#000'"
          >
          </u-pod-node>
          <u-pod-node
            :title="$t('global.commons.affiliate')"
            class="my-1"
            icon="storefront"
            title-icon="looks_two"
            :iconColor="dark?'#fff':'#000'"
          >
          </u-pod-node>
        </div>

        <div class="flex-grow-1">
          <div class="sph mb-12">
            <span class="dot -reverse -add-offset" style="animation-delay: -1s">
              <v-icon
                :color="iconColor"
                class="center-absolute mt-n5"
                size="small"
                >paidfact_check</v-icon
              ></span
            >
          </div>
          <div class="sph mt-12">
            <span class="dot -reverse -add-offset" style="animation-delay: -1s">
              <v-icon
                :color="iconColor"
                class="center-absolute mt-5"
                size="small"
                >paidfact_check</v-icon
              ></span
            >
          </div>
        </div>

        <u-pod-node :title="shop.title" large>
          <v-avatar class="avatar-gradient -thin -shop mb-1" size="44">
            <img :src="getShopImagePath(shop.icon, 96)" alt="Shop" />
          </v-avatar>
        </u-pod-node>

        <div class="flex-grow-1">
          <div class="sph mb-12">
            <span
              class="dot -reverse -add-offset"
              style="animation-delay: -0.3s"
            >
              <v-icon
                :color="iconColor"
                class="center-absolute mt-n5"
                size="small"
                >local_mall</v-icon
              ></span
            >
          </div>
          <div class="sph mt-12">
            <span
              class="dot -reverse -add-offset"
              style="animation-delay: -0.3s"
            >
              <v-icon
                :color="iconColor"
                class="center-absolute mt-5"
                size="small"
                >local_mall</v-icon
              ></span
            >
          </div>
        </div>

        <div>
          <u-pod-node
            :title="$t('global.commons.customers')"
            class="my-1"
            icon="people_outline"
            :iconColor="dark?'#fff':'#000'"
          ></u-pod-node>
          <u-pod-node
            :title="$t('global.commons.customers')"
            class="my-1"
            icon="people_outline"
            :iconColor="dark?'#fff':'#000'"
          ></u-pod-node>
        </div>
      </template>

      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Dropshipping (Connect OS) ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <template v-else-if="businessModel === 'dropshipping'">
        <u-pod-node
          :title="$t('global.commons.customers')"
          icon="people_outline"
          :iconColor="dark?'#fff':'#000'"
        >
        </u-pod-node>

        <div class="flex-grow-1">
          <div class="sph">
            <span class="dot -reverse -add-offset">
              <v-icon
                :color="iconColor"
                class="center-absolute mt-n5"
                size="small"
                >paidlocal_mall</v-icon
              ></span
            >
          </div>
        </div>

        <u-pod-node :title="shop.title" large>
          <v-avatar class="avatar-gradient -thin -shop mb-1" size="44">
            <img :src="getShopImagePath(shop.icon, 96)" alt="Shop" />
          </v-avatar>
        </u-pod-node>

        <div class="flex-grow-1">
          <div class="mb-12">
            <div class="sph">
              <span class="center-absolute mt-n5 small text-center">
                <v-icon
                  :color="iconColor"
                  class="fa-spin fa-spin-reverse"
                  size="small"
                  >sync</v-icon
                >

                <div class="hide-on-small-900 single-line">
                  Connect <span class="text-gradient bg-desert-hump">OS</span>
                </div>
              </span>
            </div>

            <div class="sph mt-2">
              <span
                class="dot -reverse -add-offset"
                style="animation-delay: -1s"
              >
                <v-icon
                  :color="iconColor"
                  class="center-absolute mt-5"
                  size="small"
                  >fact_check</v-icon
                ></span
              >
            </div>
          </div>

          <div class="mt-12">
            <div class="sph">
              <span class="center-absolute mt-n5 small text-center">
                <v-icon
                  :color="iconColor"
                  class="fa-spin fa-spin-reverse"
                  size="small"
                  >sync</v-icon
                >

                <div class="hide-on-small-900 single-line">
                  Connect <span class="text-gradient bg-desert-hump">OS</span>
                </div>
              </span>
            </div>

            <div class="sph mt-2">
              <span
                class="dot -reverse -add-offset"
                style="animation-delay: -1s"
              >
                <v-icon
                  :color="iconColor"
                  class="center-absolute mt-5"
                  size="small"
                  >fact_check</v-icon
                ></span
              >
            </div>
          </div>
        </div>

        <div class="flex-grow-1">
          <div class="d-flex align-center">
            <u-pod-node class="my-1" title="Bridge" title-icon="looks_one">
              <v-img
                :src="require('../../assets/trademark/printful.svg')"
                height="24"
                width="100%"
                alt="Printful"
              ></v-img>
            </u-pod-node>

            <div class="sph">
              <span
                class="dot -reverse -add-offset"
                style="animation-delay: -0.3s"
              >
                <v-icon
                  :color="iconColor"
                  class="center-absolute mt-n5"
                  size="small"
                  >local_mall</v-icon
                ></span
              >
            </div>

            <u-pod-node
              :title="$t('global.commons.customers')"
              class="my-1"
              icon="people_outline"
              :iconColor="dark?'#fff':'#000'"
            >
            </u-pod-node>
          </div>

          <div class="d-flex align-center">
            <u-pod-node title="Bridge" title-icon="looks_two">
              <v-img
                :src="require('../../assets/trademark/doba.svg')"
                height="24"
                width="100%"
                alt="Doba"
              ></v-img>
            </u-pod-node>

            <div class="sph">
              <span
                class="dot -reverse -add-offset"
                style="animation-delay: -0.3s"
              >
                <v-icon
                  :color="iconColor"
                  class="center-absolute mt-n5"
                  size="small"
                  >local_mall</v-icon
                ></span
              >
            </div>

            <u-pod-node
              :title="$t('global.commons.customers')"
              class="my-1"
              icon="people_outline"
              :iconColor="dark?'#fff':'#000'"
            ></u-pod-node>
          </div>
        </div>
      </template>
    </v-row>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Guide ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <v-row class="m-0 mx-2 small flex-grow-0 op-0-7" dense>
      <v-col cols="6 fadeIn">
        <v-icon class="me-1" size="small">local_mall</v-icon>
        Customer order
      </v-col>
      <v-col class="fadeIn" cols="6">
        <v-icon class="me-1" size="small">paid</v-icon>
        Payment
      </v-col>

      <v-col v-if="businessModel === 'wholesaler'" class="fadeIn" cols="6">
        <v-icon class="me-1" size="small">storefront</v-icon>
        Reseller (Independent stores on Selldone)
      </v-col>

      <v-col v-if="businessModel === 'marketplace'" class="fadeIn" cols="6">
        <v-icon class="me-1" size="small">storefront</v-icon>
        Vendors (Sub stores)
      </v-col>

      <v-col v-if="businessModel === 'franchise'" class="fadeIn" cols="6">
        <v-icon class="me-1" size="small">storefront</v-icon>
        Affiliate (+ Custom domain)
      </v-col>

      <v-col v-if="businessModel === 'dropshipping'" class="fadeIn" cols="6">
        <v-icon class="me-1" size="small">sync</v-icon>
        Sync inventory / orders
      </v-col>

      <v-col
        v-if="
          ['wholesaler', 'marketplace', 'franchise', 'dropshipping'].includes(
            businessModel,
          )
        "
        class="fadeIn"
        cols="6"
      >
        <v-icon class="me-1" size="small">fact_check</v-icon>
        Fulfillment order
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import { useId } from "vue";
import UPodNode from "../../ui/pod/node/UPodNode.vue";

type FlowKind = "payment" | "order" | "sync" | "fulfillment";
type FlowDefinition = {
  nodes: [key: string, column: number, row: string][];
  edges: [from: string, to: string, step: number, kind: FlowKind, route?: "above" | "below"][];
  steps: [route: string, caption: string][];
};

// Order delivery, payment, fulfillment instructions and synchronization stay distinct.
const MODERN_FLOWS: Record<string, FlowDefinition> = {
  normal: {
    nodes: [["customers", 1, "1 / 3"], ["shop", 3, "1 / 3"]],
    edges: [["customers", "shop", 1, "payment", "above"], ["shop", "customers", 2, "order", "below"]],
    steps: [["customers_store", "payment"], ["store_customers", "customer_orders"]],
  },
  wholesaler: {
    nodes: [["store-a", 1, "1"], ["store-b", 1, "2"], ["shop", 2, "1 / 3"], ["customers", 3, "1 / 3"]],
    edges: [["store-a", "shop", 1, "payment"], ["store-b", "shop", 1, "payment"], ["shop", "customers", 2, "order"]],
    steps: [["resellers_store", "payment_fulfillment"], ["store_customers", "customer_orders"]],
  },
  marketplace: {
    nodes: [["customers", 1, "1 / 3"], ["shop", 2, "1 / 3"], ["vendor-a", 3, "1"], ["vendor-b", 3, "2"]],
    edges: [["customers", "shop", 1, "payment"], ["shop", "vendor-a", 2, "payment"], ["shop", "vendor-b", 2, "payment"], ["vendor-a", "customers", 3, "order", "above"], ["vendor-b", "customers", 3, "order", "below"]],
    steps: [["customers_store", "payment"], ["store_vendors", "payment_fulfillment"], ["vendors_customers", "customer_orders"]],
  },
  franchise: {
    nodes: [["customers-a", 1, "1"], ["customers-b", 1, "2"], ["affiliate-a", 2, "1"], ["affiliate-b", 2, "2"], ["shop", 3, "1 / 3"]],
    edges: [["customers-a", "affiliate-a", 1, "payment"], ["customers-b", "affiliate-b", 1, "payment"], ["affiliate-a", "shop", 2, "payment"], ["affiliate-b", "shop", 2, "payment"], ["shop", "customers-a", 3, "order", "above"], ["shop", "customers-b", 3, "order", "below"]],
    steps: [["customers_affiliates", "payment_customer_orders"], ["affiliates_store", "payment_fulfillment"], ["store_customers", "customer_orders"]],
  },
  dropshipping: {
    nodes: [["customers", 1, "1 / 3"], ["shop", 2, "1 / 3"], ["printful", 3, "1"], ["doba", 3, "2"]],
    edges: [["customers", "shop", 1, "payment"], ["shop", "printful", 2, "sync"], ["shop", "doba", 2, "sync"], ["shop", "printful", 3, "fulfillment"], ["shop", "doba", 3, "fulfillment"], ["printful", "customers", 4, "order", "above"], ["doba", "customers", 4, "order", "below"]],
    steps: [["customers_store", "payment_customer_orders"], ["store_connect", "sync"], ["store_suppliers", "fulfillment_orders"], ["suppliers_customers", "customer_orders"]],
  },
};

export default {
  name: "BusinessModelView",
  components: { UPodNode },
  props: {
    shop: {
      required: true,
      type: Object,
    },
    businessModel: {
      default: "normal",
    },
    dark: {
      default: false,
      type: Boolean,
    },
    iconColor: { default: "primary" },
    modern: { type: Boolean, default: false },
  },

  setup() {
    return { modernFlowId: `business-model-${useId()}` };
  },

  data: () => ({
    modernBounds: { width: 1, height: 1 },
    modernEdgePaths: [] as { key: string; path: string; step: number; kind: FlowKind; x: number; y: number }[],
    modernObserver: null as ResizeObserver | null,
    modernFrame: 0,
  }),

  computed: {
    modernFlow(): FlowDefinition {
      return MODERN_FLOWS[this.businessModel] || MODERN_FLOWS.normal;
    },
    modernShopTitle(): string {
      return this.shop.title || this.$t("global.commons.shop");
    },
    modernNodes() {
      if (!this.modern) return [];
      return this.modernFlow.nodes.map(([key, column, row]) => {
        const customer = key.startsWith("customers");
        const hint = key === "shop"
          ? this.businessModel === "marketplace" ? "your_marketplace" : "your_store"
          : key.startsWith("store-") ? "reseller"
            : key.startsWith("vendor-") ? "sub_store"
              : key.startsWith("affiliate-") ? "custom_domain" : "";
        return {
          key, column, row,
          title: key === "shop" ? this.modernShopTitle
            : key === "printful" ? "Printful"
              : key === "doba" ? "Doba"
                : this.$t(`business_model.modern.flow.nodes.${customer ? "customers" : key.replace(/-/g, "_")}`),
          icon: customer ? "people_outline" : "storefront",
          hint: hint ? this.$t(`business_model.modern.flow.nodes.${hint}`)
            : ["printful", "doba"].includes(key) ? "Connect OS" : "",
        };
      });
    },
    modernSteps() {
      if (!this.modern) return [];
      return this.modernFlow.steps.map(([route, caption]) => ({
        key: route,
        title: this.$t(`business_model.modern.flow.routes.${route}`, { shop: this.modernShopTitle }),
        caption: this.$t(`business_model.modern.flow.captions.${caption}`),
      }));
    },
  },

  watch: {
    modern: { handler: "observeModernFlow", flush: "post" },
    modernNodes: { handler: "scheduleModernFlow", flush: "post" },
    "$vuetify.locale.isRtl": { handler: "scheduleModernFlow", flush: "post" },
  },

  mounted() {
    this.observeModernFlow();
  },
  beforeUnmount() {
    this.modernObserver?.disconnect();
    cancelAnimationFrame(this.modernFrame);
  },
  methods: {
    observeModernFlow() {
      this.modernObserver?.disconnect();
      this.modernObserver = null;
      if (!this.modern || !this.$refs.modernCanvas) return;
      this.modernObserver = new ResizeObserver(this.scheduleModernFlow);
      this.modernObserver.observe(this.$refs.modernCanvas as HTMLElement);
      this.scheduleModernFlow();
    },
    scheduleModernFlow() {
      if (!this.modern || this.modernFrame) return;
      this.$nextTick(() => {
        if (!this.modern || !this.$refs.modernCanvas || this.modernFrame) return;
        this.modernFrame = requestAnimationFrame(() => {
          this.modernFrame = 0;
          this.positionModernFlow();
        });
      });
    },
    positionModernFlow() {
      const canvas = this.$refs.modernCanvas as HTMLElement | undefined;
      if (!this.modern || !canvas?.isConnected) return;
      const bounds = canvas.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const style = getComputedStyle(canvas);
      const compact = style.getPropertyValue("--flow-compact").trim() === "1";
      const rtl = style.direction === "rtl";
      const paths = [];

      for (const [from, to, step, kind, route] of this.modernFlow.edges) {
        const start = canvas.querySelector(`[data-flow-node="${from}"]`);
        const end = canvas.querySelector(`[data-flow-node="${to}"]`);
        if (!start || !end) continue;
        const a = start.getBoundingClientRect();
        const b = end.getBoundingClientRect();
        let x1, y1, x2, y2, path, x, y;

        if (route && compact) {
          const left = (route === "above") !== rtl;
          const lane = left ? 1 : bounds.width - 1;
          x1 = (left ? a.left : a.right) - bounds.left;
          x2 = (left ? b.left : b.right) - bounds.left;
          y1 = (a.top + a.bottom) / 2 - bounds.top;
          y2 = (b.top + b.bottom) / 2 - bounds.top;
          path = `M${x1} ${y1} H${lane} V${y2} H${x2}`;
          x = lane;
          y = (y1 + y2) / 2;
        } else if (route) {
          x1 = (a.left + a.right) / 2 - bounds.left;
          x2 = (b.left + b.right) / 2 - bounds.left;
          y1 = (route === "above" ? a.top : a.bottom) - bounds.top;
          y2 = (route === "above" ? b.top : b.bottom) - bounds.top;
          const lane = route === "above" ? 5 : bounds.height - 5;
          path = `M${x1} ${y1} V${lane} H${x2} V${y2}`;
          x = (x1 + x2) / 2;
          y = lane;
        } else if (compact) {
          const forward = a.top < b.top;
          const offset = (kind === "sync" ? -12 : kind === "fulfillment" ? 12 : 0) * (rtl ? -1 : 1);
          x1 = (a.left + a.right) / 2 - bounds.left + offset;
          x2 = (b.left + b.right) / 2 - bounds.left + offset;
          y1 = (forward ? a.bottom : a.top) - bounds.top;
          y2 = (forward ? b.top : b.bottom) - bounds.top;
          const middle = (y1 + y2) / 2;
          path = `M${x1} ${y1} C${x1} ${middle} ${x2} ${middle} ${x2} ${y2}`;
          x = (x1 + x2) / 2;
          y = middle;
        } else {
          const forward = a.left < b.left;
          const offset = kind === "sync" ? -12 : kind === "fulfillment" ? 12 : 0;
          x1 = (forward ? a.right : a.left) - bounds.left;
          x2 = (forward ? b.left : b.right) - bounds.left;
          y1 = (a.top + a.bottom) / 2 - bounds.top + offset;
          y2 = (b.top + b.bottom) / 2 - bounds.top + offset;
          const middle = (x1 + x2) / 2;
          path = `M${x1} ${y1} C${middle} ${y1} ${middle} ${y2} ${x2} ${y2}`;
          x = middle;
          y = (y1 + y2) / 2;
        }
        paths.push({ key: `${from}-${to}-${kind}`, path, step, kind, x, y });
      }
      this.modernBounds = { width: bounds.width, height: bounds.height };
      this.modernEdgePaths = paths;
    },
  },
};
</script>

<style scoped lang="scss">
.s-business-model-modern {
  container-type: inline-size;
  min-width: 0;
  font-family: inherit;
  color: rgb(var(--v-theme-on-surface));

  &__canvas {
    --flow-compact: 0;
    position: relative;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    grid-template-rows: repeat(2, minmax(88px, auto));
    align-items: center;
    gap: 28px 32px;
    min-width: 0;
    margin: 14px 0 13px;
    padding-block: 18px;
  }

  &__connectors {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
    pointer-events: none;
  }

  &__edge {
    fill: none;
    stroke: var(--sd-modern-muted);
    stroke-width: 1.4;
    &--order { stroke: rgb(var(--v-theme-primary)); }
    &--sync { stroke-dasharray: 4 4; }
  }

  &__arrow {
    fill: var(--sd-modern-muted);
    stroke: none;
    &--order { fill: rgb(var(--v-theme-primary)); }
  }

  &__node {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    grid-column: var(--flow-column);
    grid-row: var(--flow-row);
    min-width: 0;
    min-height: 72px;
    padding: 8px 3px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 12px;
    background: rgb(var(--v-theme-surface));
    text-align: center;

    &--shop {
      min-height: 88px;
      background: color-mix(in srgb, rgb(var(--v-theme-surface)) 97.5%, rgb(var(--v-theme-on-surface)));
    }
  }

  &__identity, &__node-icon, &__brand { flex-shrink: 0; margin-block-end: 5px; }
  &__node-icon { color: var(--sd-modern-muted); }
  &__node-icon, &__identity :deep(.v-icon) { width: 20px; height: 20px; font-size: 20px !important; }
  &__brand { width: 52px; height: 24px; object-fit: contain; }
  &__node-title { font-size: 12px; font-weight: 500; line-height: 1.4; overflow-wrap: anywhere; }
  &__node-hint { margin-block-start: 2px; font-size: 11px; line-height: 1.35; color: var(--sd-modern-muted); }

  &__marker, &__step-number {
    display: grid;
    place-items: center;
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    border-radius: 50%;
    font-size: 10px;
    font-weight: 500;
    color: var(--sd-modern-muted);
  }

  &__marker {
    position: absolute;
    z-index: 2;
    transform: translate(-50%, -50%);
    border: 1px solid var(--sd-modern-border);
    background: rgb(var(--v-theme-surface));
    pointer-events: none;
  }

  &__steps { display: grid; gap: 10px; margin: 0; padding: 0; list-style: none; }
  &__step { display: flex; align-items: flex-start; gap: 9px; }
  &__step-number { margin-block-start: 1px; background: var(--sd-modern-inset); }
  &__step-title { font-size: 12px; font-weight: 500; line-height: 1.45; overflow-wrap: anywhere; }
  &__step-caption { margin-block-start: 1px; font-size: 12px; line-height: 1.5; color: var(--sd-modern-muted); }

  @media (max-width: 800px) {
    &__canvas { max-width: 510px; margin-inline: auto; }
    &__steps { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px 20px; }
  }

  @media (max-width: 540px) {
    &__canvas { gap: 28px 18px; grid-template-rows: repeat(2, minmax(92px, auto)); }
    &__node { padding: 8px 2px; border-radius: 10px; }
    &__node-title { font-size: 11px; }
    &__steps { grid-template-columns: 1fr; gap: 11px; }
  }

  @container (max-width: 400px) {
    &__canvas { --flow-compact: 1; grid-template-columns: repeat(2, minmax(0, 1fr)); grid-template-rows: repeat(3, minmax(82px, auto)); gap: 24px 18px; padding: 0 16px; margin-block: 22px; }
    &__node[data-flow-node="shop"] { grid-column: 1 / 3; grid-row: 2; width: 82px; min-height: 82px; justify-self: center; }
    &__node[data-flow-node="customers"] { grid-column: 1 / 3; grid-row: 1; width: 82px; justify-self: center; }
    &__node[data-flow-node="store-a"], &__node[data-flow-node="customers-a"] { grid-column: 1; grid-row: 1; }
    &__node[data-flow-node="store-b"], &__node[data-flow-node="customers-b"] { grid-column: 2; grid-row: 1; }
    &__canvas[data-model="wholesaler"] [data-flow-node="customers"], &__canvas[data-model="normal"] [data-flow-node="shop"] { grid-row: 3; }
    &__node[data-flow-node="vendor-a"], &__node[data-flow-node="printful"] { grid-column: 1; grid-row: 3; }
    &__node[data-flow-node="vendor-b"], &__node[data-flow-node="doba"] { grid-column: 2; grid-row: 3; }
    &__node[data-flow-node="affiliate-a"] { grid-column: 1; grid-row: 2; }
    &__node[data-flow-node="affiliate-b"] { grid-column: 2; grid-row: 2; }
    &__canvas[data-model="franchise"] [data-flow-node="shop"] { grid-row: 3; }
  }
}
</style>
