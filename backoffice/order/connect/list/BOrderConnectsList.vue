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
  <div
    :class="
      modern
        ? 'sd-modern-widget b-order-connect-modern'
        : 'widget shadow my-3 mx-1 mx-md-3'
    "
  >
    <u-widget-header
      icon="hub"
      :class="{
        'sd-modern-form-header b-order-connect-modern__header': modern,
      }"
      :title="modern ? 'Connect OS' : undefined"
    >
      <template v-if="!modern" v-slot:title>
        Connect <span class="text-gradient bg-desert-hump">OS</span>
      </template>
    </u-widget-header>

    <p
      v-if="modern"
      class="sd-modern-subtitle b-order-connect-modern__subtitle"
    >
      <span>{{ $t("order_connect_list.subtitle") }}</span>
      <v-tooltip
        location="top"
        content-class="sd-modern-tooltip text-start"
        :open-on-click="true"
        :open-on-focus="true"
      >
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            icon="info_outline"
            variant="text"
            class="sd-modern-icon-button sd-modern-info-button b-order-connect-modern__help"
            :aria-label="$t('order_connect_list.help_label')"
          ></v-btn>
        </template>
        {{ $t("order_connect_list.help") }}
      </v-tooltip>
    </p>
    <v-list-subheader v-else class="px-0">
      {{ $t("order_connect_list.subtitle") }}
    </v-list-subheader>

    <div
      class="text-start"
      :class="modern ? undefined : 'border-between-vertical -dashed'"
      :style="modern ? undefined : '--border-color: #999'"
    >
      <b-order-connect-item
        v-for="connect_order in connect_orders"
        :key="connect_order.id"
        :basket="basket"
        :connect-order="connect_order"
        :modern="modern"
        :shop="shop"
        @show-edit-address="(cb) => $emit('show-edit-address', cb)"
      >
      </b-order-connect-item>
    </div>
  </div>
</template>

<script lang="ts">
import BOrderConnectItem from "../../../order/connect/item/BOrderConnectItem.vue";
import UWidgetHeader from "@selldone/components-vue/ui/widget/header/UWidgetHeader.vue";

export default {
  name: "BOrderConnectsList",
  components: { UWidgetHeader, BOrderConnectItem },
  emits: ["show-edit-address"],
  props: {
    shop: {
      require: true,
      type: Object,
    },
    basket: {
      require: true,
      type: Object,
    },
    modern: {
      type: Boolean,
      default: false,
    },
  },

  data: function () {
    return {};
  },

  computed: {
    connect_orders() {
      return this.basket.connect_orders;
    },
  },
  methods: {},
};
</script>

<style lang="scss" scoped>
// Modern (Refined) order-processing card: same shell as the Preparation card.
.b-order-connect-modern {
  &.sd-modern-widget {
    padding: 20px;
    margin-block-end: 18px;
    border-radius: 16px;
    font-family: inherit;
    font-size: 13px;
    line-height: 1.5;
  }
  &__header {
    margin-block-end: 0;
  }
  &__header :deep(h2) {
    font-family: inherit;
    font-size: 18px;
    font-weight: 500;
    line-height: 24px;
  }
  &__subtitle {
    display: flex;
    align-items: center;
    gap: 4px;
    margin: 4px 0 4px;
    font-size: 12px;
    line-height: 18px;
  }
  &__help {
    pointer-events: auto;
  }
}
</style>
