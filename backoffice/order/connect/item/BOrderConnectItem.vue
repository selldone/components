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
  <div :class="{ 'b-order-connect-item-modern': modern }">
    <u-loading-progress
      v-if="busy_edit || busy_confirm || busy_sync || busy_refresh"
      :color="busy_refresh ? 'blue' : undefined"
    ></u-loading-progress>

    <!-- ━━━━━━━━━━━━━━━━━━━━━━ Modern (Refined) card ━━━━━━━━━━━━━━━━━━━━━━ -->
    <template v-if="modern">
      <div class="b-order-connect-item-modern__identity">
        <span class="b-order-connect-item-modern__logo">
          <img
            :alt="connect.name"
            :src="getShopImagePath(connect.icon, 128)"
            class="no-inv"
          />
        </span>

        <div class="b-order-connect-item-modern__summary">
          <span class="sd-modern-eyebrow">{{ $t(mode_obj.title) }}</span>
          <h3 class="b-order-connect-item-modern__name">{{ connect.name }}</h3>
          <div class="b-order-connect-item-modern__meta">
            <span class="sd-modern-status sd-modern-status--plain">
              <span class="sd-modern-status__dot" :class="status_dot_class" />
              {{ $t(`order_connect_list.status.${status_code}`) }}
            </span>

            <!-- Price + cost breakdown -->
            <span
              v-if="connectOrder.price"
              class="b-order-connect-item-modern__price"
            >
              <u-price
                :amount="connectOrder.price"
                :currency="connectOrder.currency"
              ></u-price>
              <v-btn
                icon
                variant="text"
                class="sd-modern-icon-button sd-modern-info-button"
                :aria-label="$t('order_connect_list.costs_title')"
              >
                <v-icon size="16" aria-hidden="true">info_outline</v-icon>
                <v-tooltip
                  activator="parent"
                  location="top"
                  :open-on-focus="true"
                  :open-on-click="true"
                  content-class="sd-modern-tooltip text-start"
                >
                  <div class="sd-modern-tooltip__title">
                    {{ $t("order_connect_list.costs_title") }}
                  </div>
                  <template v-if="cost_groups.length">
                    <div
                      v-for="group in cost_groups"
                      :key="group.key"
                      class="b-order-connect-item-modern__cost-group"
                    >
                      <span class="sd-modern-eyebrow">{{
                        $t(`order_connect_list.${group.key}`)
                      }}</span>
                      <dl class="sd-modern-tooltip__details">
                        <div v-for="row in group.rows" :key="row.key">
                          <dt>{{ row.label }}</dt>
                          <dd>{{ row.value }}</dd>
                        </div>
                      </dl>
                    </div>
                  </template>
                  <p v-else class="sd-modern-tooltip__body">
                    {{ $t("order_connect_list.costs_unavailable") }}
                  </p>
                </v-tooltip>
              </v-btn>
            </span>
          </div>
        </div>

        <!-- Items for this provider -->
        <div v-if="items.length" class="b-order-connect-item-modern__items">
          <v-badge
            v-for="item in items"
            :key="item.id"
            :color="item.check ? 'success' : 'error'"
            :content="item.count"
            :title="item.product?.title"
            class="b-order-connect-item-modern__thumb"
          >
            <v-avatar size="36">
              <img
                :alt="item.product?.title || ''"
                :src="getProductImage(item.product_id)"
                class="no-inv"
              />
            </v-avatar>
          </v-badge>
        </div>

        <div class="b-order-connect-item-modern__actions">
          <v-btn
            v-if="next_action"
            :loading="busy_sync || busy_confirm"
            class="sd-modern-button"
            variant="outlined"
            @click="next_action.click()"
          >
            <v-icon start size="18" aria-hidden="true">{{
              next_action.icon
            }}</v-icon>
            {{ $t(next_action.title) }}
          </v-btn>
          <u-smart-menu
            :items="menu_items"
            :title="$t('order_connect_list.menu_title')"
            modern
          ></u-smart-menu>
        </div>
      </div>

      <s-order-delivery-status-stepper
        :state="state"
        :states="states"
        class="b-order-connect-item-modern__stepper"
        show-caption
      ></s-order-delivery-status-stepper>

      <div
        v-if="connectOrder.error || error_msg"
        class="sd-modern-notice b-order-connect-item-modern__error"
        role="alert"
      >
        <v-icon size="18" color="error" aria-hidden="true">report</v-icon>
        <div class="sd-modern-notice__content">
          <p v-if="connectOrder.error" class="m-0">{{ connectOrder.error }}</p>
          <p v-if="error_msg" class="m-0">{{ error_msg }}</p>
        </div>
      </div>
    </template>

    <!-- ━━━━━━━━━━━━━━━━━━━━━━ Legacy card ━━━━━━━━━━━━━━━━━━━━━━ -->
    <template v-else>
      <div class="text-start my-2">
        <b>{{ $t(mode_obj.title) }}</b> > <b>{{ connect.name }}</b>
      </div>

      <v-row>
        <v-col cols="12" md="6" class="d-flex align-center">
          <u-avatar-folder
            is-green
            elevated
            :size="64"
            class="me-2"
            :src="getShopImagePath(connect.icon, 128)"
          >
          </u-avatar-folder>

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
                    <b class="d-block mb-2">{{
                      $t("order_connect_list.service_costs")
                    }}</b>
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
                    <b class="d-block mb-2">{{
                      $t("order_connect_list.retail_costs")
                    }}</b>
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
                    {{ $t("order_connect_list.costs_unavailable") }}
                  </div>
                </v-row>
              </v-container>
            </v-sheet>
          </v-menu>

          <!-- Items -->

          <div class="d-flex my-2">
            <v-badge
              v-for="item in items"
              :key="item.id"
              :color="item.check ? 'green' : 'red'"
              class="m-2"
            >
              <template v-slot:badge>{{ item.count }}</template>
              <v-avatar class="border">
                <v-img :src="getProductImage(item.product_id)" />
              </v-avatar>
            </v-badge>
          </div>

          <v-spacer></v-spacer>
          <u-smart-menu
            :items="menu_items"
            :title="$t('order_connect_list.menu_title')"
          ></u-smart-menu>
        </v-col>
        <v-col cols="12" md="6">
          <s-order-delivery-status-stepper
            :color="connectOrder.cancel_at ? '#F44336' : '#673AB7'"
            :dark-color="connectOrder.cancel_at ? '#D32F2F' : '#512DA8'"
            :state="state"
            :states="states"
            class="flex-grow-1"
            show-caption
          ></s-order-delivery-status-stepper>
        </v-col>
      </v-row>

      <!-- Error -->
      <div
        v-if="connectOrder.error"
        class="py-2 text-red text-subtitle-2 font-weight-bold"
      >
        <v-icon class="me-1" color=" red">report</v-icon>
        {{ connectOrder.error }}
      </div>
      <div
        v-if="error_msg"
        class="py-2 text-red text-subtitle-2 font-weight-bold"
      >
        <v-icon class="me-1" color=" red">report</v-icon>
        {{ error_msg }}
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import SOrderDeliveryStatusStepper from "../../../../storefront/order/shipping/stepper/SOrderDeliveryStatusStepper.vue";
import UTextValueDashed from "../../../../ui/text/value-dashed/UTextValueDashed.vue";
import USmartMenu from "../../../../ui/smart/menu/USmartMenu.vue";
import { Connect } from "@selldone/core-js";
import UAvatarFolder from "@selldone/components-vue/ui/avatar/folder/UAvatarFolder.vue";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BOrderConnectItem",
  mixins: [DateMixin],

  components: {
    UAvatarFolder,
    USmartMenu,
    UTextValueDashed,
    SOrderDeliveryStatusStepper,
  },
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
    connectOrder: {
      require: true,
      type: Object,
    },
    modern: {
      type: Boolean,
      default: false,
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
      const stage = (code, icon, at, doneKey, pendingKey) => ({
        code,
        icon,
        name: at
          ? this.$t(`order_connect_list.stages.${doneKey}`, {
              time: this.getFromNowString(at),
            })
          : this.$t(`order_connect_list.stages.${pendingKey}`),
      });

      if (!this.connectOrder.cancel_at || this.connectOrder.created_at)
        out.created_at = stage(
          "created_at",
          "add_circle_outline",
          this.connectOrder.created_at,
          "created",
          "create",
        );

      if (!this.connectOrder.cancel_at || this.connectOrder.sync_at)
        out.sync_at = stage(
          "sync_at",
          "published_with_changes",
          this.connectOrder.sync_at,
          "synced",
          "sync",
        );

      if (
        this.has_confirm &&
        (!this.connectOrder.cancel_at || this.connectOrder.confirm_at)
      )
        out.confirm_at = stage(
          "confirm_at",
          "add_shopping_cart",
          this.connectOrder.confirm_at,
          "confirmed",
          "confirm",
        );

      // Fulfill:
      if (!this.connectOrder.cancel_at || this.connectOrder.fulfill_at)
        out.fulfill_at = stage(
          "fulfill_at",
          "local_shipping",
          this.connectOrder.fulfill_at,
          "fulfilled",
          "fulfill",
        );

      if (this.connectOrder.cancel_at)
        out.cancel_at = stage(
          "cancel_at",
          "cancel",
          this.connectOrder.cancel_at,
          "canceled",
          "canceled",
        );

      return out;
    },

    connect() {
      return this.connectOrder.connect;
    },
    connect_mode() {
      return this.connect.mode;
    },
    mode_obj() {
      return Connect.Modes[this.connect_mode];
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
      return this.connectOrder.cancel_at
        ? "cancel_at"
        : this.connectOrder.fulfill_at
          ? "fulfill_at"
          : this.connectOrder.confirm_at
            ? "confirm_at"
            : this.connectOrder.sync_at
              ? "sync_at"
              : "created_at";
    },

    has_confirm() {
      return this.connect.confirm;
    },

    // Modern status label: where the provider order stands right now.
    status_code() {
      if (this.connectOrder.cancel_at) return "canceled";
      if (this.connectOrder.fulfill_at) return "fulfilled";
      if (!this.connectOrder.sync_at) return "awaiting_sync";
      if (this.has_confirm && !this.connectOrder.confirm_at)
        return "awaiting_confirmation";
      return "awaiting_fulfillment";
    },
    status_dot_class() {
      if (this.status_code === "canceled")
        return "sd-modern-status__dot--error";
      if (this.status_code === "fulfilled")
        return "sd-modern-status__dot--success";
      return "sd-modern-status__dot--warning";
    },

    // The one step the merchant can take now; everything else stays in the menu.
    next_action() {
      if (this.connectOrder.cancel_at || this.connectOrder.fulfill_at)
        return null;
      if (!this.connectOrder.sync_at)
        return {
          title: "order_connect_list.sync",
          icon: "cloud_sync",
          click: () => this.syncNow(),
        };
      if (this.has_confirm && !this.connectOrder.confirm_at)
        return {
          title: "order_connect_list.confirm_action",
          icon: "add_shopping_cart",
          click: () => this.confirmNowAsk(),
        };
      return null;
    },

    menu_items() {
      const closed =
        this.connectOrder.fulfill_at || this.connectOrder.cancel_at;
      return [
        {
          title: this.$t("order_connect_list.change_address"),
          icon: "edit_location",
          click: () =>
            this.$emit("show-edit-address", (b) => (this.busy_edit = b)),
          disabled: closed,
        },
        {
          title: this.$t("order_connect_list.sync"),
          icon: "cloud_sync",
          click: () => this.syncNow(),
          disabled: closed,
        },
        {
          title: this.$t("order_connect_list.confirm"),
          icon: "add_shopping_cart",
          click: () => this.confirmNowAsk(),
          disabled: this.connectOrder.confirm_at || this.connectOrder.cancel_at,
        },
        {
          title: this.$t("order_connect_list.refresh"),
          icon: "sync",
          click: () => this.refreshNow(),
        },
        ...(this.has_cancel
          ? [
              {
                title: this.$t("order_connect_list.cancel"),
                icon: "production_quantity_limits",
                click: () => this.cancelNowAsk(),
                disabled: this.connectOrder.cancel_at,
              },
            ]
          : []),
      ];
    },

    cost_groups() {
      return ["service_costs", "retail_costs"]
        .filter((key) => Object.keys(this.connectOrder[key] || {}).length)
        .map((key) => ({
          key,
          rows: Object.entries(this.connectOrder[key]).map(([k, value]) => ({
            key: k,
            label: this.getName(k),
            value,
          })),
        }));
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
            NotificationService.showErrorAlert(null, data.error_msg);
            this.error_msg = data.error_msg;
          } else {
            this.error_msg = null;
            NotificationService.showSuccessAlert(
              null,
              this.$t("Order successfully synced with the destination."),
            );
            Object.assign(this.connectOrder, data.connect_order);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
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
            NotificationService.showErrorAlert(null, data.error_msg);
            this.error_msg = data.error_msg;
          } else {
            this.error_msg = null;
            NotificationService.showSuccessAlert(
              null,
              this.$t("Order successfully updated."),
            );
            Object.assign(this.connectOrder, data.connect_order);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_refresh = false;
        });
    },

    confirmNowAsk() {
      NotificationService.openConfirmationAlert(
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
            NotificationService.showErrorAlert(null, data.error_msg);
            this.error_msg = data.error_msg;
          } else {
            this.error_msg = null;
            NotificationService.showSuccessAlert(
              null,
              this.$t("Order successfully confirmed."),
            );
            Object.assign(this.connectOrder, data.connect_order);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_confirm = false;
        });
    },

    cancelNowAsk() {
      NotificationService.openDangerAlert(
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
            NotificationService.showErrorAlert(null, data.error_msg);
            this.error_msg = data.error_msg;
          } else {
            this.error_msg = null;
            NotificationService.showSuccessAlert(
              null,
              this.$t("Order successfully canceled."),
            );
            Object.assign(this.connectOrder, data.connect_order);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_confirm = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
// Modern (Refined) provider row inside the Connect OS card.
.b-order-connect-item-modern {
  position: relative;
  padding-block: 16px 4px;
  font-size: 13px;
  line-height: 1.5;

  & + & {
    padding-block-start: 20px;
    border-block-start: 1px solid var(--sd-modern-border);
  }

  &__identity {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px 16px;
  }
  &__logo {
    display: grid;
    flex: 0 0 52px;
    place-items: center;
    width: 52px;
    height: 52px;
    overflow: hidden;
    background: rgb(var(--v-theme-surface));
    border: 1px solid var(--sd-modern-border);
    border-radius: 14px;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
  &__summary {
    display: grid;
    flex: 1 1 220px;
    gap: 2px;
    min-width: 0;
  }
  &__name {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    line-height: 22px;
    overflow-wrap: anywhere;
  }
  &__meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px 14px;
    font-size: 12px;
    line-height: 18px;
  }
  &__price {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    font-weight: 500;
  }
  &__items {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 14px;
  }
  &__thumb :deep(.v-avatar) {
    background: rgb(var(--v-theme-surface));
    border: 1px solid var(--sd-modern-border);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  &__actions {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-inline-start: auto;
  }
  &__cost-group + &__cost-group {
    margin-block-start: 10px;
  }
  &__cost-group > .sd-modern-eyebrow {
    display: block;
    margin-block-end: 4px;
    font-size: 10px;
  }
  &__error {
    margin-block-start: 12px;
    padding: 12px 14px;
    font-weight: 500;
  }

  // Quiet neutral stepper (same treatment as the bills list), captions wrap below the dots.
  &__stepper {
    margin-block-start: 18px;
    padding-block-end: 34px;

    :deep(.container-stepper > div) {
      top: 11px !important;
      height: 1px !important;
    }
    :deep(.container-stepper > div:first-child) {
      background: rgba(var(--v-theme-on-surface), 0.24) !important;
    }
    :deep(.container-stepper > div:nth-child(2)) {
      background: rgb(var(--v-theme-on-surface)) !important;
    }
    :deep(.progressbar) {
      display: flex;
      min-height: 22px;
      margin: 0;
    }
    :deep(.progressbar li) {
      float: none;
      min-height: 22px;
      transform: none !important;
    }
    :deep(.progressbar li::before) {
      width: 22px;
      height: 22px;
      border-width: 1px;
      line-height: 20px;
      border-color: rgba(var(--v-theme-on-surface), 0.24);
      background: rgb(var(--v-theme-surface));
    }
    :deep(.progressbar li.active::before) {
      border-color: rgb(var(--v-theme-on-surface));
      background: rgb(var(--v-theme-on-surface));
    }
    :deep(.progressbar li .v-icon) {
      font-size: 12px !important;
    }
    :deep(.progressbar li:not(.active) .v-icon) {
      color: var(--sd-modern-muted) !important;
      opacity: 1 !important;
    }
    :deep(.progressbar li.sub-caption::after) {
      top: 28px;
      bottom: auto;
      width: 100%;
      padding: 0 4px;
      color: var(--sd-modern-muted);
      font-size: 11px;
      line-height: 15px;
      text-transform: none;
      white-space: normal;
    }
    :deep(.progressbar li.active.sub-caption::after) {
      color: rgb(var(--v-theme-on-surface));
    }
  }

  // Keep semantic colors readable inside the Smart invert content window.
  .smart-invert & :deep(.v-badge__badge),
  .smart-invert & :deep(.text-error) {
    filter: invert(1);
  }

  @media (max-width: 700px) {
    &__summary {
      // Keep the name beside the logo on phones; items and actions wrap below.
      flex-basis: 140px;
    }
    &__actions {
      width: 100%;
      margin-inline-start: 0;
    }
    &__stepper {
      padding-block-end: 48px;
    }
  }
}
</style>
