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
  <div>
    <u-loading-progress
      v-if="busy_edit || busy_confirm || busy_sync || busy_refresh"
      :color="busy_refresh ? 'blue' : undefined"
    ></u-loading-progress>
    <v-list-item>
      <template v-slot:prepend>
        <v-avatar rounded size="64">
          <img :src="getShopImagePath(connect.icon, 128)" />
        </v-avatar>
      </template>

      <v-list-item-title class="font-weight-bold small-xs-only">
        {{ connect_mode }} >
        {{ connect.name }}

        <v-menu
          v-if="connectOrder.price"
          content-class="rounded-lg"
          location="bottom"
          max-width="680"
          open-on-hover
        >
          <template v-slot:activator="{ props }">
            <span v-bind="props">
              <u-price
                :amount="connectOrder.price"
                :currency="connectOrder.currency"
                class="mx-2"
              ></u-price>
              <v-icon color="#111" size="small">info</v-icon>
            </span>
          </template>
          <v-sheet color="#111" dark>
            <v-container class="text-start small text-no-wrap">
              <v-row>
                <!-- Service costs -->
                <v-col v-if="connectOrder.service_costs" cols="12" sm="6">
                  <b class="d-block mb-2">Service costs</b>
                  <u-text-value-dashed
                    v-for="k in Object.keys(connectOrder.service_costs)"
                    :key="k"
                  >
                    <template v-slot:label>{{ getName(k) }}</template>
                    {{ connectOrder.service_costs[k] }}
                  </u-text-value-dashed>
                </v-col>

                <!-- Retail costs -->
                <v-col v-if="connectOrder.retail_costs" cols="12" sm="6">
                  <b class="d-block mb-2">Retail costs</b>
                  <u-text-value-dashed
                    v-for="k in Object.keys(connectOrder.retail_costs)"
                    :key="k"
                  >
                    <template v-slot:label>{{ getName(k) }}</template>
                    {{ connectOrder.retail_costs[k] }}
                  </u-text-value-dashed>
                </v-col>

                <div
                  v-if="
                    !connectOrder.service_costs && !connectOrder.retail_costs
                  "
                  class="text-center py-3"
                >
                  Cost details not available!
                </div>
              </v-row>
            </v-container>
          </v-sheet>
        </v-menu>
      </v-list-item-title>

      <v-list-item-subtitle class="overflow-visible d-flex pb-5 pt-2">
        <s-order-delivery-status-stepper
          :color="connectOrder.cancel_at ? '#F44336' : '#673AB7'"
          :dark-color="connectOrder.cancel_at ? '#D32F2F' : '#512DA8'"
          :state="state"
          :states="states"
          class="flex-grow-1"
          show-caption
        ></s-order-delivery-status-stepper>

        <u-smart-menu
          :items="[
            {
              title: 'Change shipping address',
              icon: 'edit_location',
              click: () => $emit('show-edit-address', (b) => (busy_edit = b)),
              disabled: connectOrder.fulfill_at || connectOrder.cancel_at,
            },

            {
              title: 'Sync Order',
              icon: 'cloud_sync',
              click: () => syncNow(),
              disabled: connectOrder.fulfill_at || connectOrder.cancel_at,
            },
            {
              title: 'Confirm Manually',
              icon: 'add_shopping_cart',
              click: () => confirmNowAsk(),
              disabled: connectOrder.confirm_at || connectOrder.cancel_at,
            },
            {
              title: 'Refresh Order',
              icon: 'sync',
              click: () => refreshNow(),
            },
            ...(has_cancel
              ? [
                  {
                    title: 'Cancel Order',
                    icon: 'production_quantity_limits',
                    click: () => cancelNowAsk(),
                    disabled: connectOrder.cancel_at,
                  },
                ]
              : []),
          ]"
          title="Manual actions"
        ></u-smart-menu>
      </v-list-item-subtitle>
    </v-list-item>

    <!-- Items -->

    <div class="d-flex my-2">
      <v-badge
        v-for="item in items"
        :key="item.id"
        :color="item.check ? 'green' : 'red'"
        class="m-2"
      >
        <template v-slot:badge>{{ item.count }}</template>
        <v-avatar>
          <img :src="getProductImage(item.product_id)" />
        </v-avatar>
      </v-badge>
    </div>

    <!-- Error -->
    <div v-if="connectOrder.error" class="py-3 font-weight-bold text-red">
      <v-icon class="me-1" color=" red">report</v-icon>
      {{ connectOrder.error }}
    </div>
    <div v-if="error_msg" class="py-3 font-weight-bold text-red">
      <v-icon class="me-1" color=" red">report</v-icon>
      {{ error_msg }}
    </div>
  </div>
</template>

<script>
import SOrderDeliveryStatusStepper from "../../../../storefront/order/shipping/stepper/SOrderDeliveryStatusStepper.vue";
import UTextValueDashed from "../../../../ui/text/value-dashed/UTextValueDashed.vue";
import USmartMenu from "../../../../ui/smart/menu/USmartMenu.vue";
import { Connect } from "@selldone/core-js";

export default {
  name: "BOrderConnectItem",
  components: { USmartMenu, UTextValueDashed, SOrderDeliveryStatusStepper },
  props: {
    shop: {
      require: true,
      type: Object,
    },
    basket: {
      require: true,
      type: Object,
    },
    connectOrder: {
      require: true,
      type: Object,
    },
  },

  data: function () {
    return {
      busy_sync: false,
      busy_confirm: false,
      busy_edit: false,
      busy_refresh: false,

      error_msg: null,
    };
  },

  computed: {
    connect_orders() {
      return this.basket.connect_orders;
    },

    states() {
      const out = {};

      if (!this.connectOrder.cancel_at || this.connectOrder.created_at)
        out.created_at = {
          code: "created_at",
          name: this.connectOrder.created_at
            ? `Created at ${this.getFromNowString(this.connectOrder.created_at)}`
            : "Create",
          icon: "add_circle_outline",
        };

      if (!this.connectOrder.cancel_at || this.connectOrder.sync_at)
        out.sync_at = {
          code: "sync_at",
          name: this.connectOrder.sync_at
            ? `Synced at ${this.getFromNowString(this.connectOrder.sync_at)}`
            : "Sync",
          icon: "published_with_changes",
        };

      if (
        this.has_confirm &&
        (!this.connectOrder.cancel_at || this.connectOrder.confirm_at)
      )
        out.confirm_at = {
          code: "confirm_at",
          name: this.connectOrder.confirm_at
            ? `Confirmed at ${this.getFromNowString(this.connectOrder.confirm_at)}`
            : "Confirm",
          icon: "add_shopping_cart",
        };

      // Fulfill:
      if (!this.connectOrder.cancel_at || this.connectOrder.fulfill_at)
        out.fulfill_at = {
          code: "fulfill_at",
          name: this.connectOrder.fulfill_at
            ? `Fulfilled at ${this.getFromNowString(this.connectOrder.fulfill_at)}`
            : "Fulfillment",
          icon: "local_shipping",
        };

      if (this.connectOrder.cancel_at)
        out.cancel_at = {
          code: "cancel_at",
          name: this.connectOrder.cancel_at
            ? `Canceled at ${this.getFromNowString(this.connectOrder.cancel_at)}`
            : "Confirm",
          icon: "cancel",
        };

      return out;
    },

    connect() {
      return this.connectOrder.connect;
    },
    connect_mode() {
      return this.connect.mode;
    },
    has_cancel() {
      return [
        Connect.Modes.Dropshipping.code,
        Connect.Modes.Marketplace.code,
        Connect.Modes.Other.code,
      ].includes(this.connect_mode);
    },

    items() {
      return this.basket.items.filter(
        (item) => item.product.connect_id === this.connectOrder.connect_id,
      );
    },

    state() {
      return this.connectOrder.confirm_at
        ? "confirm_at"
        : this.connectOrder.sync_at
          ? "sync_at"
          : "created_at";
    },

    has_confirm() {
      return this.connect.confirm;
    },
  },
  methods: {
    syncNow() {
      this.busy_sync = true;
      axios
        .post(
          window.API.POST_SHOP_CONNECT_BASKET_SYNC(
            this.shop.id,
            this.connectOrder.id,
          ),
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
            this.error_msg = data.error_msg;
          } else {
            this.error_msg = null;
            this.showSuccessAlert(
              null,
              this.$t("Order successfully synced with the destination."),
            );
            Object.assign(this.connectOrder, data.connect_order);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_sync = false;
        });
    },

    refreshNow() {
      this.busy_refresh = true;
      axios
        .post(
          window.API.POST_SHOP_CONNECT_BASKET_REFRESH(
            this.shop.id,
            this.connectOrder.id,
          ),
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
            this.error_msg = data.error_msg;
          } else {
            this.error_msg = null;
            this.showSuccessAlert(null, this.$t("Order successfully updated."));
            Object.assign(this.connectOrder, data.connect_order);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_refresh = false;
        });
    },

    confirmNowAsk() {
      this.openConfirmationAlert(
        "Confirm order",
        `Are you sure to confirm this order? ${this.connect.name} will charge you.`,
        "Yes, Confirm now",
        () => {
          this.confirmNow();
        },
      );
    },

    confirmNow() {
      this.busy_confirm = true;
      axios
        .post(
          window.API.POST_SHOP_CONNECT_BASKET_CONFIRM(
            this.shop.id,
            this.connectOrder.id,
          ),
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
            this.error_msg = data.error_msg;
          } else {
            this.error_msg = null;
            this.showSuccessAlert(
              null,
              this.$t("Order successfully confirmed."),
            );
            Object.assign(this.connectOrder, data.connect_order);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_confirm = false;
        });
    },

    cancelNowAsk() {
      this.openDangerAlert(
        "Cancel order",
        `Are you sure to cancel this order? <br><ul><li>Some providers support this feature to cancel orders on Selldone.</li><li>If you see error please go to your account on their services and cancel this order there.</li></ul>`,
        "Yes, Cancel now",
        () => {
          this.cancelNow();
        },
      );
    },

    cancelNow() {
      this.busy_confirm = true;
      axios
        .post(
          window.API.POST_SHOP_CONNECT_BASKET_CANCEL(
            this.shop.id,
            this.connectOrder.id,
          ),
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
            this.error_msg = data.error_msg;
          } else {
            this.error_msg = null;
            this.showSuccessAlert(
              null,
              this.$t("Order successfully canceled."),
            );
            Object.assign(this.connectOrder, data.connect_order);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_confirm = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
