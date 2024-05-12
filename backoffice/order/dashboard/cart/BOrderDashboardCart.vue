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
    :class="{ '-activated': in_this_step }"
    class="widget shadow my-3 mx-1 mx-md-3"
  >
    <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Header ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

    <div class="d-flex align-center">
      <h2>
        <v-icon class="me-1" color="#111">shopping_basket</v-icon>
        {{ $t("process_center.basket_items") }}
      </h2>
      <v-spacer></v-spacer>
      <small
        :title="'Checkout date: ' + getLocalTimeString(basket.reserved_at)"
        class="text-capitalize"
      >
        {{ getFromNowString(basket.reserved_at) }}</small
      >
    </div>

    <v-list-subheader class="px-0 text-start">
      <span v-html="$t('process_center.basket_list.message')"></span>
    </v-list-subheader>

    <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Compact cart items ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

    <div
      class="expand-button mb-2 mt-3 p-3 widget-hover rounded-xl position-relative pointer-pointer rounded-xl overflow-hidden"
      @click="force_show_items = !force_show_items"
    >
      <span class="absolute-top-end text-muted px-2 small"
        ><v-icon
          :class="{ 'rotate-180': force_show_items }"
          class="mx-1 transition-all-400"
          >expand_more</v-icon
        >

        {{ $t("process_center.basket_list.list_of_items") }}
      </span>

      <div class="d-flex overflow-auto pt-5 pb-2">
        <v-badge
          v-for="item in items"
          :key="item.id"
          :color="readonly || item.check ? 'green' : 'red'"
          class="m-2"
        >
          <template v-slot:badge>{{ item.count }}</template>
          <v-avatar color="#fff" style="border: solid thin #999">
            <img :src="getProductImage(item.product_id)" />
          </v-avatar>
        </v-badge>
      </div>
    </div>

    <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ List of Cart Items ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

    <v-expand-transition>
      <div v-show="force_show_items">
        <b-order-cart
          ref="basket_items_list"
          :checkable="!isActionDisabled && !readonly"
          :items="items"
          :readonly="readonly"
          :select-all="initial_select_all"
          :shop="shop"
          :type="basket.type"
          :is-role-panel="isRolePanel"
        />
      </div>
    </v-expand-transition>

    <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Lottery Prize Items ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

    <v-row
      v-if="lottery_order && lottery_order.product"
      align="center"
      class="lottery-prize"
      no-gutters
    >
      <v-col class="flex-grow-0 p-2">
        <router-link
          :to="
            isRolePanel
              ? {}
              : {
                  name: IS_VENDOR_PANEL
                    ? 'Vendor_ProductDashboard'
                    : 'BPageProductDashboard',
                  params: { product_id: lottery_order.product.id },
                }
          "
        >
          <v-img
            :src="getProductImage(lottery_order.product_id)"
            aspect-ratio="1"
            class="mx-2"
            max-height="84px"
            max-width="84px"
            min-height="42px"
            min-width="42px"
            style="border-radius: 50%"
          />
        </router-link>
      </v-col>
      <v-col class="p-2">
        <p class="font-weight-bold my-1">{{ lottery_order.product.title }}</p>
        <p class="m-0">
          {{ $t("process_center.basket_list.lottery_prize_inform") }}
        </p>

        <variant-item-view-micro
          v-if="lottery_order.variant"
          :product-variant="lottery_order.variant"
        ></variant-item-view-micro>
      </v-col>
      <v-col class="flex-grow-0 p-2">
        <v-icon dark>fa:fas fa-dice</v-icon>
      </v-col>
    </v-row>

    <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Seller Actions ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->
    <div class="text-start">
      <v-btn
        v-if="!readonly"
        :class="{ disabled: isActionDisabled }"
        :color="in_this_step ? 'primary' : '#000'"
        :loading="busy"
        :size="in_this_step ? 'x-large' : undefined"
        :variant="!in_this_step ? 'outlined' : 'elevated'"
        class="mt-2 tnt"
        rounded
        @click="orderConfirm"
      >
        <v-icon v-if="checked" start>check</v-icon>
        <v-icon v-else-if="in_this_step" class="blink-me" start
          >fiber_manual_record
        </v-icon>

        {{
          !isActionDisabled
            ? basket.delivery_state === PhysicalOrderStates.CheckQueue.code
              ? $t("process_center.basket_list.action")
              : $t("process_center.basket_list.apply_change_action")
            : $t("process_center.basket_list.cant_apply_change")
        }}
      </v-btn>

      <ul class="tips mt-4">
        <li
          v-for="item in $tm('process_center.basket_list.checklist')"
          :key="item"
        >
          {{ item }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import BOrderCart from "../../cart/BOrderCart.vue";
import { PhysicalOrderStates } from "@selldone/core-js/enums/basket/PhysicalOrderStates";
import VariantItemViewMicro from "../../../../storefront/product/variant/VariantItemViewMicro.vue";
import { BasketStatus } from "@selldone/core-js/enums/basket/status/BasketStatus";

export default {
  name: "BOrderDashboardCart",
  components: {
    VariantItemViewMicro,
    BOrderCart,
  },
  props: {
    shop: {
      require: true,
      type: Object,
    },
    basket: {
      require: true,
      type: Object,
    },
    readonly: {
      // For POS orders > Don't need to check items in the basket!
      default: false,
      type: Boolean,
    },

    isFulfillment: {
      // Drop shipping mode
      default: false,
      type: Boolean,
    },
    isRolePanel: Boolean,
  },

  data: function () {
    return {
      PhysicalOrderStates: PhysicalOrderStates,
      force_show_items: false,
      busy: false,
    };
  },

  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    items() {
      if (this.isFulfillment) return this.basket.items;
      return this.basket.items.filter((item) => !item.fulfillment_id);
    },

    lottery_order() {
      return this.basket.lottery_order;
    },

    checked() {
      return [
        PhysicalOrderStates.OrderConfirm.code,
        PhysicalOrderStates.PreparingOrder.code,
        PhysicalOrderStates.SentOrder.code,
        PhysicalOrderStates.ToCustomer.code,
      ].includes(this.basket.delivery_state);
    },
    in_this_step() {
      return (
        this.basket.delivery_state === PhysicalOrderStates.CheckQueue.code &&
        [BasketStatus.Payed.code, BasketStatus.COD.code].includes(
          this.basket.status,
        )
      );
    },

    initial_select_all() {
      return (
        this.basket.delivery_state === this.PhysicalOrderStates.CheckQueue.code
      );
    },
    isActionDisabled() {
      return (
        this.basket.delivery_state === PhysicalOrderStates.SentOrder.code ||
        this.basket.delivery_state === PhysicalOrderStates.ToCustomer.code
      );
    },

    showItems() {
      if (this.force_show_items) return true;
      if (!this.basket) return false;
      return (
        this.basket.delivery_state ===
          this.PhysicalOrderStates.CheckQueue.code ||
        this.basket.delivery_state ===
          this.PhysicalOrderStates.PreparingOrder.code
      );
    },
  },
  methods: {
    orderConfirm() {
      let list = [];
      this.busy = true;

      this.$refs.basket_items_list.getCheckedItems().forEach((item) => {
        list.push(item.id);
      });

      this.$emit("confirm-order", {
        list: list,
        callback: () => {
          this.busy = false;
        },
      });
      // this.updateState(this.PhysicalOrderStates.OrderConfirm.code, true);
    },
  },
};
</script>

<style lang="scss" scoped>
.lottery-prize {
  text-align: start;
  background-color: #0f75ac;
  // box-shadow: inset 0 -1em 2em rgb(50, 161, 225),0 5px 45px 4px rgba(40, 169, 238, 0.99) !important;
  color: #fff;
  border-radius: 12px;
  margin: 12px 0;
}

/*
.expanded{
  width: calc(100vw - 28px);
  max-width: calc(100vw - 28px);
  left: calc(-50vw + 50% + 14px);


  @media only screen and (min-width: 1700px) {
    width: calc(1600px);
    max-width: calc(1600px);
    left: calc(-800px + 50%);
  }
}*/
</style>
