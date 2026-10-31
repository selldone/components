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
  <div
    :class="
      modern
        ? 'sd-modern-widget b-order-service-tasks-modern text-start'
        : {
            '-activated': in_this_step,
            disabled: !is_active,
            'widget shadow m-3': true,
          }
    "
  >
    <template v-if="modern">
      <u-widget-header
        class="sd-modern-form-header b-order-service-tasks-modern__header"
        icon="checklist"
        :title="$t('process_center.modern.service_progress_title')"
      >
        <template #append-actions>
          <span class="b-order-service-tasks-modern__stage">{{
            $t(progress_stage_key)
          }}</span>
        </template>
      </u-widget-header>
      <p class="sd-modern-subtitle b-order-service-tasks-modern__subtitle">
        <span>{{ $t("process_center.modern.service_progress_subtitle") }}</span>
        <v-tooltip
          location="top"
          content-class="sd-modern-tooltip text-start"
          :open-on-focus="true"
          :open-on-click="true"
        >
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              icon="info_outline"
              variant="text"
              class="sd-modern-icon-button sd-modern-info-button"
              :aria-label="
                $t('process_center.modern.service_progress_help_title')
              "
            ></v-btn>
          </template>
          {{ $t("process_center.modern.service_progress_help") }}
        </v-tooltip>
      </p>
    </template>
    <div
      v-if="!modern || !can_end"
      :class="
        modern
          ? 'b-order-service-tasks-modern__actions'
          : 'widget-buttons w-100'
      "
    >
      <p v-if="modern" class="b-order-service-tasks-modern__guidance">
        {{ $t(progress_guidance_key) }}
      </p>
      <v-btn
        v-if="can_start"
        :loading="busy_start"
        :disabled="modern ? !current_action_enabled : undefined"
        :class="{
          'sd-modern-button': modern,
          'sd-modern-button--x-large': modern && current_action_enabled,
        }"
        :color="!modern || current_action_enabled ? 'primary' : undefined"
        :size="!modern || current_action_enabled ? 'x-large' : undefined"
        :variant="
          modern ? (current_action_enabled ? 'flat' : 'outlined') : undefined
        "
        @click="start()"
      >
        <v-icon start>play_arrow</v-icon>
        {{ $t("service_bill.start_service") }}
      </v-btn>
    </div>

    <div
      :class="
        modern
          ? 'b-order-service-tasks-modern__items'
          : 'border-between-vertical'
      "
    >
      <service-billing-item
        v-for="item in items"
        :key="item.id"
        :basket="basket"
        :initial-expand="in_this_step"
        :item="item"
        :product="item.product"
        :shop="shop"
        :modern="modern"
        :view-only-progress="modern && (!is_active || !!basket.reject)"
      ></service-billing-item>
    </div>

    <div
      v-if="!modern || can_end"
      :class="
        modern
          ? 'b-order-service-tasks-modern__actions'
          : 'widget-buttons w-100'
      "
    >
      <p v-if="modern" class="b-order-service-tasks-modern__guidance">
        {{ $t(progress_guidance_key) }}
      </p>
      <v-btn
        v-if="can_end"
        :loading="busy_end"
        :disabled="modern ? !current_action_enabled : undefined"
        :class="{
          'sd-modern-button': modern,
          'sd-modern-button--x-large sd-modern-button--danger':
            modern && current_action_enabled,
        }"
        :color="modern ? (current_action_enabled ? 'error' : undefined) : 'red'"
        :size="!modern || current_action_enabled ? 'x-large' : undefined"
        :variant="
          modern ? (current_action_enabled ? 'flat' : 'outlined') : undefined
        "
        @click="finish()"
      >
        <v-icon start>stop</v-icon>
        {{ $t("service_bill.end_service") }}
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import ServiceBillingItem from "../../../../storefront/order/billing/ServiceBillingItem.vue";
import { Basket } from "@selldone/core-js";
import UWidgetHeader from "@selldone/components-vue/ui/widget/header/UWidgetHeader.vue";

export default {
  name: "BOrderDashboardServiceTasks",
  components: { ServiceBillingItem, UWidgetHeader },
  props: {
    modern: { type: Boolean, default: false },
    shop: {
      require: true,
      type: Object,
    },
    basket: {
      require: true,
      type: Object,
    },
  },

  data: function () {
    return {
      busy_start: false,
      busy_end: false,

      ServiceOrderStates: Basket.ServiceOrderStates,
    };
  },

  computed: {
    current_action_enabled() {
      return (
        this.is_active &&
        !this.basket.reject &&
        (this.can_start || this.can_end) &&
        !this.busy_start &&
        !this.busy_end
      );
    },
    progress_stage_key() {
      if (this.basket.reject)
        return "process_center.modern.service_progress_rejected";
      if (!this.is_active)
        return "process_center.modern.service_progress_unpaid";
      if (this.can_start) return "process_center.modern.service_progress_ready";
      if (this.can_end) return "process_center.modern.service_progress_active";
      return this.basket.delivery_state ===
        Basket.ServiceOrderStates.ToCustomer.code
        ? "process_center.modern.service_progress_completed"
        : "process_center.modern.service_progress_unavailable";
    },
    progress_guidance_key() {
      if (this.basket.reject)
        return "process_center.modern.service_progress_rejected_guidance";
      if (!this.is_active)
        return "process_center.modern.service_progress_unpaid_guidance";
      if (this.can_start)
        return "process_center.modern.service_progress_start_guidance";
      if (this.can_end)
        return "process_center.modern.service_progress_end_guidance";
      return this.basket.delivery_state ===
        Basket.ServiceOrderStates.ToCustomer.code
        ? "process_center.modern.service_progress_completed_guidance"
        : "process_center.modern.service_progress_unavailable_guidance";
    },
    can_start() {
      return (
        this.basket.delivery_state ===
        Basket.ServiceOrderStates.OrderConfirm.code
      );
    },
    can_end() {
      return (
        this.basket.delivery_state ===
        Basket.ServiceOrderStates.PreparingOrder.code
      );
    },

    items() {
      return this.basket.items;
    },

    is_active() {
      return this.basket.status === Basket.Status.Payed.code;
    },
    in_this_step() {
      return (
        this.basket.status === Basket.Status.Payed.code &&
        this.basket.delivery_state ===
          Basket.ServiceOrderStates.PreparingOrder.code
      );
    },
  },
  methods: {
    start() {
      if (this.modern && (!this.can_start || !this.current_action_enabled))
        return;
      this.busy_start = true;
      this.$emit("confirm-preparing", {
        callback: () => {
          this.busy_start = false;
        },
      });
    },
    finish() {
      if (this.modern && (!this.can_end || !this.current_action_enabled))
        return;
      NotificationService.openConfirmationAlert(
        this.$t("service_tasks.notification_finish.title"),
        this.$t("service_tasks.notification_finish.message"),
        this.$t("service_tasks.notification_finish.action"),
        () => {
          // The order may have changed while the confirmation was open.
          if (this.modern && (!this.can_end || !this.current_action_enabled))
            return;
          this.busy_end = true;
          this.$emit("confirm-finish", {
            callback: () => {
              this.busy_end = false;
            },
          });
        },
      );
    },
  },
  created() {},
};
</script>

<style lang="scss" scoped>
.b-order-service-tasks-modern {
  &.sd-modern-widget {
    display: flex;
    flex-direction: column;
    padding: 20px;
    margin-block-end: 18px;
    border-radius: 16px;
    font-family: inherit;
    font-size: 12px;
    line-height: 18px;
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
  &__header :deep(h2 > .v-icon) {
    font-size: 20px;
  }
  &__stage {
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 17px;
  }
  &__subtitle {
    display: flex;
    align-items: center;
    gap: 4px;
    margin: 4px 0 20px;
    font-size: 12px;
    line-height: 18px;
  }
  &__items {
    order: 1;
    min-width: 0;
  }
  &__actions {
    order: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 14px;
    border-block-start: 1px solid var(--sd-modern-border);
    padding-block-start: 16px;
    margin-block-start: 18px;
  }
  &__guidance {
    flex: 1 1 240px;
    margin: 0;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 17px;
  }
  @media (max-width: 599px) {
    &__actions > .v-btn {
      width: 100%;
    }
  }
}
</style>
