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
  <section
    v-if="modern"
    class="sd-modern-widget b-order-virtual-preparation-modern text-start"
  >
    <u-widget-header
      class="sd-modern-form-header b-order-virtual-preparation-modern__header"
      icon="inventory_2"
      :title="$t('process_center.modern.virtual_preparation')"
    >
      <template #append-actions>
        <span
          class="sd-modern-status sd-modern-status--plain b-order-virtual-preparation-modern__stage"
        >
          <span
            class="sd-modern-status__dot"
            :class="
              checked
                ? 'sd-modern-status__dot--success'
                : 'sd-modern-status__dot--warning'
            "
          />
          {{
            $t(
              checked
                ? "process_center.modern.virtual_preparation_complete"
                : in_this_step
                  ? "process_center.modern.virtual_preparation_ready"
                  : "process_center.modern.virtual_preparation_waiting",
            )
          }}
        </span>
      </template>
    </u-widget-header>
    <p class="sd-modern-subtitle b-order-virtual-preparation-modern__subtitle">
      <span>{{
        $t("process_center.modern.virtual_preparation_subtitle")
      }}</span>
      <v-tooltip
        location="top"
        content-class="sd-modern-tooltip text-start"
        open-on-focus
        open-on-click
      >
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            icon="info_outline"
            variant="text"
            class="sd-modern-icon-button sd-modern-info-button"
            :aria-label="
              $t('process_center.modern.virtual_preparation_help_label')
            "
          />
        </template>
        {{ $t("process_center.modern.virtual_preparation_help") }}
      </v-tooltip>
    </p>

    <div class="b-order-virtual-preparation-modern__records">
      <div
        v-for="item in preparation_items"
        :key="item.id"
        class="b-order-virtual-preparation-modern__item"
      >
        <div class="b-order-virtual-preparation-modern__identity">
          <img
            :src="
              item.product_id
                ? getProductImage(item.product_id)
                : ProductType.VIRTUAL.image
            "
            class="hover-scale"
            alt=""
            width="34"
            height="34"
          />
          <div>
            <span>{{ item.title }}</span>
            <small>{{
              $t("process_center.modern.virtual_record_summary", {
                units: item.count,
                records: item.records.length,
              })
            }}</small>
          </div>
        </div>
        <div class="b-order-virtual-preparation-modern__record-ids">
          <details v-if="item.records.length > 3">
            <summary>
              {{ $t("process_center.modern.virtual_records") }} ·
              {{ item.records.length }}
            </summary>
            <div class="b-order-virtual-preparation-modern__expanded-ids">
              <bdi v-for="record in item.records" :key="record.id"
                >VIT-{{ record.id }}</bdi
              >
            </div>
          </details>
          <template v-else-if="item.records.length"
            ><bdi v-for="record in item.records" :key="record.id"
              >VIT-{{ record.id }}</bdi
            ></template
          >
          <span v-else>{{
            $t("process_center.modern.virtual_no_records")
          }}</span>
        </div>
        <v-btn
          :to="{ name: 'BPageOrderVirtualInput', params: $route.params }"
          class="sd-modern-button sd-modern-button--inline"
          variant="text"
          color="primary"
        >
          {{ $t("process_center.modern.virtual_open_form")
          }}<v-icon end size="16" aria-hidden="true">arrow_forward</v-icon>
        </v-btn>
      </div>
      <p
        v-if="!preparation_items.length"
        class="b-order-virtual-preparation-modern__empty"
      >
        {{ $t("process_center.modern.virtual_no_items") }}
      </p>
    </div>

    <slot />
    <div v-if="delivered" class="b-order-virtual-preparation-modern__delivered">
      <v-icon size="20" aria-hidden="true">done_all</v-icon>
      <div>
        <span>{{ $t("process_center.modern.virtual_delivered") }}</span
        ><time v-if="basket.delivery_at" :datetime="basket.delivery_at">{{
          getLocalTimeString(basket.delivery_at)
        }}</time>
      </div>
    </div>
    <div class="b-order-virtual-preparation-modern__actions">
      <p>{{ $t("process_center.modern.virtual_preparation_guidance") }}</p>
      <v-btn
        class="sd-modern-button"
        :class="{ 'sd-modern-button--x-large': prominent_action }"
        :disabled="!can_prepare"
        :loading="busy"
        :color="prominent_action ? 'primary' : undefined"
        :size="prominent_action ? 'x-large' : undefined"
        :variant="prominent_action ? 'flat' : 'outlined'"
        @click="preparingOrder"
      >
        <v-icon start :size="prominent_action ? 20 : 18" aria-hidden="true">{{
          checked && !delivered ? "save" : "inventory_2"
        }}</v-icon>
        {{
          $t(
            checked && !delivered
              ? "process_center.basket_list.apply_change_action"
              : "process_center.modern.virtual_complete_preparation",
          )
        }}
      </v-btn>
    </div>
  </section>
  <div v-else class="widget shadow m-3">
    <div class="d-flex align-center">
      <h2>
        <v-icon class="me-1" color="#111">switch_access_shortcut_add</v-icon>
        {{ $t("process_center.preparing.title") }}
      </h2>
      <v-spacer></v-spacer>
    </div>
    <v-list-subheader class="px-0">
      <span v-html="$t('process_center.preparing.message')"></span>
    </v-list-subheader>
    <div class="text-start">
      <v-btn
        :class="{ disabled: !isActive }"
        :color="in_this_step ? 'primary' : '#000'"
        :loading="busy"
        :variant="!in_this_step ? 'outlined' : undefined"
        class="tnt"
        rounded
        @click="preparingOrder"
      >
        <v-icon v-if="checked" start>check</v-icon>
        {{ $t("process_center.preparing.action") }}
      </v-btn>

      <ul class="tips mt-4">
        <li
          v-for="item in $tm('process_center.preparing.checklist')"
          :key="item"
        >
          {{ item }}
        </li>
      </ul>
    </div>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { Basket } from "@selldone/core-js";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";

export default {
  name: "BOrderDashboardVirtualPreparing",
  mixins: [DateMixin],
  components: {},
  emits: ["confirm-preparing"],
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
      transportation: null,

      PhysicalOrderStates: Basket.PhysicalOrderStates,
      ProductType,
      busy: false,
    };
  },
  watch: {},

  computed: {
    preparation_items() {
      return (this.basket.items || []).map((item) => ({
        id: item.id,
        product_id: item.product_id,
        title: item.product?.title || item.product_id,
        count: item.count,
        // Overview reads identities only; output values remain in the existing Form.
        records: (item.virtual_items || [])
          .filter((record) => record?.id != null)
          .map((record) => ({ id: record.id })),
      }));
    },
    delivered() {
      return (
        this.basket.delivery_state ===
        Basket.PhysicalOrderStates.ToCustomer.code
      );
    },
    can_prepare() {
      return (
        !this.busy &&
        !this.basket.reject &&
        this.basket.status === Basket.Status.Payed.code &&
        this.isActive
      );
    },
    prominent_action() {
      return this.in_this_step && this.can_prepare;
    },
    checked() {
      return [
        Basket.PhysicalOrderStates.PreparingOrder.code,
        Basket.PhysicalOrderStates.SentOrder.code,
        Basket.PhysicalOrderStates.ToCustomer.code,
      ].includes(this.basket.delivery_state);
    },
    in_this_step() {
      return (
        this.basket.delivery_state ===
        Basket.PhysicalOrderStates.OrderConfirm.code
      );
    },

    isActive() {
      return (
        this.basket.delivery_state ===
          Basket.PhysicalOrderStates.OrderConfirm.code ||
        this.basket.delivery_state ===
          Basket.PhysicalOrderStates.PreparingOrder.code
      );
    },
  },
  methods: {
    preparingOrder() {
      if (this.modern && !this.can_prepare) return;
      this.busy = true;

      this.$emit("confirm-preparing", {
        callback: () => {
          this.busy = false;
        },
      });
    },
  },
  created() {},
};
</script>

<style scoped lang="scss">
.b-order-virtual-preparation-modern {
  &.sd-modern-widget {
    padding: 20px;
    margin-block-end: 18px;
    border-radius: 16px;
    font-family: inherit;
    font-size: 12px;
    line-height: 18px;
  }
  // Native disabled actions keep readonly record links and guidance accessible.
  &.disabled {
    opacity: 1 !important;
    pointer-events: auto !important;
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
  &__stage {
    font-size: 11px;
    line-height: 17px;
  }
  &__subtitle {
    display: flex;
    align-items: center;
    gap: 4px;
    margin: 4px 0 16px;
    font-size: 12px;
    line-height: 18px;
  }
  &__records {
    border-block-start: 1px solid var(--sd-modern-border);
  }
  &__item {
    display: flex;
    align-items: center;
    gap: 18px;
    padding-block: 15px;
    border-block-end: 1px solid var(--sd-modern-border);
  }
  &__identity {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    flex: 1 1 220px;
  }
  &__identity > img {
    flex: none;
    object-fit: contain;
    border: 1px solid var(--sd-modern-border);
    border-radius: 8px;
  }
  &__identity > div {
    min-width: 0;
    overflow-wrap: anywhere;
  }
  &__identity small {
    display: block;
    margin-block-start: 4px;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 17px;
    text-wrap: balance;
  }
  &__record-ids {
    display: flex;
    flex: 0 1 210px;
    flex-wrap: wrap;
    gap: 5px 9px;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 17px;
    overflow-wrap: anywhere;
  }
  &__record-ids > details {
    width: 100%;
  }
  &__record-ids summary {
    cursor: var(--cursor-interaction, pointer);
    padding-block: 7px;
  }
  &__record-ids summary:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 3px;
  }
  &__expanded-ids {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 10px;
    padding-block: 9px;
  }
  &__item > .v-btn {
    flex: none;
  }
  &__empty {
    margin: 0;
    padding-block: 16px;
    color: var(--sd-modern-muted);
  }
  &__delivered {
    display: flex;
    align-items: center;
    gap: 11px;
    padding-block: 18px;
  }
  &__delivered > .v-icon {
    color: var(--sd-modern-muted);
  }
  &__delivered time {
    display: block;
    color: var(--sd-modern-muted);
    margin-block-start: 4px;
    font-size: 11px;
    line-height: 17px;
    text-wrap: balance;
  }
  &__actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 14px;
    padding-block-start: 16px;
    margin-block-start: 13px;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  &__actions > p {
    flex: 1 1 220px;
    margin: 0;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 18px;
  }
  &__actions > .v-btn {
    margin: 0 !important;
  }
  &__actions > .v-btn--disabled :deep(.v-btn__overlay) {
    opacity: 0;
  }
  @media (max-width: 600px) {
    &.sd-modern-widget {
      padding: 17px 13px;
    }
    &__item {
      flex-wrap: wrap;
      gap: 12px;
    }
    &__identity {
      flex-basis: 100%;
    }
    &__record-ids {
      flex: 1 1 100px;
    }
    &__record-ids summary {
      min-height: 44px;
      display: flex;
      align-items: center;
    }
  }
}
</style>
