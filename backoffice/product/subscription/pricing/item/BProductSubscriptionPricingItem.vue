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
  <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Refined row (Pricings tab) ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
  <div
    v-if="modern"
    class="b-pricing-plan"
    :class="{ 'b-pricing-plan--deleted': is_deleted }"
  >
    <div
      class="b-pricing-plan__row"
      :class="{ 'sd-modern-clickable-item': !is_deleted, disabled: loading }"
      :role="is_deleted ? undefined : 'button'"
      :tabindex="is_deleted ? undefined : 0"
      :aria-label="`${$t('b_product_pricing.open_plan')} ${code}`"
      :aria-disabled="loading || undefined"
      @click="is_deleted ? undefined : $emit('select')"
      @keydown.enter.self.prevent="is_deleted ? undefined : $emit('select')"
      @keydown.space.self.prevent="is_deleted ? undefined : $emit('select')"
    >
      <div class="b-pricing-plan__plan">
        <div class="b-pricing-plan__title">
          <span
            class="sd-modern-status__dot"
            :class="`sd-modern-status__dot--${state.tone}`"
            aria-hidden="true"
          ></span>
          <b>{{ subscriptionPrice.title }}</b>
        </div>
        <span
          v-if="subscriptionPrice.description"
          class="b-pricing-plan__description"
          >{{ subscriptionPrice.description }}</span
        >
        <span class="b-pricing-plan__state"
          >{{ state.label
          }}<template v-if="is_deleted">
            ·
            {{
              $t("b_product_pricing.deleted_at", {
                date: getLocalTimeString(subscriptionPrice.deleted_at),
              })
            }}</template
          ></span
        >
      </div>

      <div class="b-pricing-plan__ids">
        <span class="sd-modern-list-header b-pricing-plan__caption">{{
          $t("b_product_pricing.col_identifiers")
        }}</span>
        <b dir="ltr">{{ code }}</b>
        <span
          >{{ $t("global.commons.sku") }}: <bdi>{{ sku || "—" }}</bdi></span
        >
      </div>

      <div class="b-pricing-plan__price">
        <span class="sd-modern-list-header b-pricing-plan__caption">{{
          $t("b_product_pricing.col_price")
        }}</span>
        <b><u-price :amount="price" :currency="currency"></u-price></b>
        <span
          ><i
            class="b-pricing-plan__period-dot"
            :style="{ background: period?.color }"
            aria-hidden="true"
          ></i
          >{{ period ? $t(period.title) : subscriptionPrice.period }}</span
        >
      </div>

      <div class="b-pricing-plan__provider">
        <span class="sd-modern-list-header b-pricing-plan__caption">{{
          $t("b_product_pricing.col_provider")
        }}</span>
        <template v-if="gateway">
          <img
            v-if="gateway.icon"
            :src="getShopImagePath(gateway.icon)"
            width="22"
            height="22"
            alt=""
          />
          <v-icon v-else size="22" aria-hidden="true">credit_card</v-icon>
          <div>
            <b>{{ gateway.name }}</b>
            <span class="sd-modern-status sd-modern-status--plain"
              ><span
                class="sd-modern-status__dot"
                :class="`sd-modern-status__dot--${provider_state.tone}`"
                aria-hidden="true"
              ></span
              >{{ provider_state.label }}</span
            >
          </div>
        </template>
        <span v-else class="b-pricing-plan__muted">{{
          $t("b_product_pricing.provider_missing")
        }}</span>
      </div>

      <div class="b-pricing-plan__sync">
        <span class="sd-modern-list-header b-pricing-plan__caption">{{
          $t("b_product_pricing.col_sync")
        }}</span>
        <template v-if="meta_entries.length">
          <span
            v-for="[key, value] in meta_entries"
            :key="key"
            class="b-pricing-plan__chip"
            @click.stop
            @keydown.stop
            ><span>{{ key }}</span><code>{{ value }}</code
            ><button
              type="button"
              class="b-pricing-plan__copy"
              :aria-label="$t('b_product_pricing.copy_value', { key })"
              @click.stop="copyToClipboard(value)"
              ><v-icon size="13" aria-hidden="true">content_copy</v-icon
              ><v-tooltip
                activator="parent"
                location="top"
                content-class="sd-modern-tooltip text-start"
                open-on-focus
                >{{ $t("b_product_pricing.copy_value", { key }) }}</v-tooltip
              ></button
            ></span
          >
        </template>
        <span
          v-else
          class="b-pricing-plan__muted"
          tabindex="0"
          @click.stop
          @keydown.stop
          ><v-icon size="14" aria-hidden="true">cloud_off</v-icon
          >{{ $t("b_product_pricing.not_synced") }}
          <v-tooltip
            activator="parent"
            location="top"
            content-class="sd-modern-tooltip text-start"
            open-on-focus
            open-on-click
            >{{ $t("b_product_pricing.not_synced_help") }}</v-tooltip
          ></span
        >
      </div>

      <div class="b-pricing-plan__actions">
        <v-btn
          v-if="!is_deleted"
          class="sd-modern-icon-button"
          icon="edit"
          variant="text"
          size="small"
          :disabled="loading"
          :aria-label="$t('b_product_pricing.edit_plan')"
          @click.stop="$emit('select')"
        >
          <v-icon size="16">edit</v-icon>
          <v-tooltip
            activator="parent"
            location="top"
            content-class="sd-modern-tooltip text-start"
            open-on-focus
            >{{ $t("b_product_pricing.edit_plan") }}</v-tooltip
          >
        </v-btn>
        <v-btn
          v-if="hasDelete"
          class="sd-modern-icon-button"
          :icon="is_deleted ? 'restore' : 'delete_outline'"
          variant="text"
          size="small"
          :loading="loading"
          :aria-label="
            $t(is_deleted ? 'global.actions.restore' : 'global.actions.delete')
          "
          @click.stop="is_deleted ? showRestoreDialog() : showDeleteDialog()"
        >
          <v-icon size="16">{{
            is_deleted ? "restore" : "delete_outline"
          }}</v-icon>
          <v-tooltip
            activator="parent"
            location="top"
            content-class="sd-modern-tooltip text-start"
            open-on-focus
            >{{
              $t(
                is_deleted ? "global.actions.restore" : "global.actions.delete",
              )
            }}</v-tooltip
          >
        </v-btn>
      </div>
    </div>
  </div>

  <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Legacy card ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
  <div
    v-else
    class="product-variant-card widget widget-hover rounded-18px d-flex flex-wrap my-2 p-3"
    @click="$emit('select')"
  >
    <div class="cel-1 border-end-grater-md pe-3">
      <b>
        <v-icon
          v-if="enable != null"
          :color="enable ? 'green' : 'red'"
          :title="enable ? 'Available to select by customers.' : 'Unavailable.'"
          class="me-1"
          size="small"
          >{{ enable ? "check_circle" : "cancel" }}
        </v-icon>

        {{ subscriptionPrice.title }}</b
      >
      <div v-if="subscriptionPrice.description" class="small my-1">
        {{ subscriptionPrice.description }}
      </div>
    </div>

    <div class="cel-2 border-end-grater-md">
      <div class="min-width-150 py-1 px-2">
        <p class="mb-1"><small>Code:</small> PRC{{ subscriptionPrice.id }}</p>

        <p class="mb-1">
          <small>{{ $t("global.commons.sku") }}:</small> {{ sku ? sku : "-" }}
        </p>
      </div>
    </div>

    <div class="cel-3 border-end-grater-md">
      <u-price
        :amount="price"
        :currency="currency"
        :title="$t('product_admin.inventory.variant_item.price')"
        class="text-success"
        large
      ></u-price>
      <div class="font-weight-black my-1" title="Billing period">
        <v-icon :color="period?.color" class="me-1" size="small">circle</v-icon>
        {{ $t(period?.title) }}
      </div>
    </div>

    <div class="cel-4 border-end-grater-md">
      <!-- Gateway info -->
      <div v-if="gateway" class="mb-1 d-flex align-center w-100">
        <img
          :src="getShopImagePath(gateway.icon)"
          class="me-1"
          height="24"
          width="24"
        />
        <b class="flex-grow-1 mx-1">{{ gateway.name }}</b>
        <v-chip
          v-if="!shop_gateway.enable"
          class="mx-1"
          color="red"
          label
          size="small"
          title="Your gateway is disable."
          variant="flat"
        >
          <v-icon start>credit_card_off</v-icon>
          {{ $t("global.commons.disable") }}
        </v-chip>
        <v-chip
          v-else-if="!shop_gateway.livemode"
          class="mx-1"
          color="amber"
          label
          size="small"
          title="Your gateway is in the debug mode."
          variant="flat"
        >
          <v-icon start>science</v-icon>
          {{ $t("global.commons.debug") }}
        </v-chip>
      </div>
      <!-- 3rd party keep meta -->
      <v-icon
        v-if="!subscriptionPrice.meta"
        class="op-0-2 mt-2"
        size="large"
        title="Price not synced!"
        >foggy
      </v-icon>
      <div v-else class="small">
        <u-text-value-dashed v-for="(v, k) in subscriptionPrice.meta" :key="k">
          <template v-slot:label>{{ k }}</template>
          <code v-copy @click.stop>{{ v }}</code>
        </u-text-value-dashed>
      </div>
    </div>

    <div
      v-if="badge || loading"
      class="blue-badge m-2 align-self-center flex-grow-0"
    >
      <v-progress-circular v-if="loading" color="#fff" indeterminate>
      </v-progress-circular>
      <span v-else>{{ badge }}</span>
    </div>

    <div v-if="hasDelete" class="m-2 ms-auto align-self-center flex-grow-0">
      <u-button-circle
        v-if="!subscriptionPrice.deleted_at"
        :tooltip="$t('global.actions.delete')"
        icon="close"
        icon-color="red"
        @click="showDeleteDialog()"
      />
      <u-button-circle
        v-else
        :tooltip="$t('global.actions.restore')"
        icon="cached"
        icon-color="#673AB7"
        @click="showRestoreDialog()"
      />
    </div>
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import BillingPeriod from "@selldone/core-js/enums/subscription/BillingPeriod";
import UTextValueDashed from "../../../../../ui/text/value-dashed/UTextValueDashed.vue";

export default {
  name: "BProductSubscriptionPricingItem",
  components: { UTextValueDashed },
  emits: ["select", "delete", "restore"],
  props: {
    shop: {
      required: true,
      type: Object,
    },
    product: {
      required: true,
      type: Object,
    },
    subscriptionPrice: {
      required: true,
      type: Object,
    },

    hasDelete: {
      default: false,
      type: Boolean,
    },
    // Refined data-table row (Pricings tab); the legacy card stays for Studio and Vendor.
    modern: { type: Boolean, default: false },
    badge: {},
    loading: {},

    validateVariants: {
      type: Array,
    },
  },
  data() {
    return {};
  },
  computed: {
    enable() {
      return this.subscriptionPrice.enable;
    },

    sku() {
      return this.subscriptionPrice.sku;
    },

    price() {
      return this.subscriptionPrice.price;
    },

    currency() {
      return this.subscriptionPrice.currency;
    },

    period() {
      return BillingPeriod[this.subscriptionPrice.period];
    },

    shop_gateways() {
      return this.shop.shop_gateways;
    },
    shop_gateway() {
      return (
        this.shop_gateways &&
        this.shop_gateways.find(
          (sg) => sg.gateway?.code === this.subscriptionPrice.gateway_code,
        )
      );
    },
    gateway() {
      return this.shop_gateway?.gateway;
    },

    code() {
      return `PRC${this.subscriptionPrice.id}`;
    },
    is_deleted() {
      return !!this.subscriptionPrice.deleted_at;
    },
    state() {
      if (this.is_deleted)
        return {
          tone: "error",
          label: this.$t("b_product_pricing.state_deleted"),
        };
      if (this.enable)
        return {
          tone: "success",
          label: this.$t("b_product_pricing.state_available"),
        };
      return {
        tone: "warning",
        label: this.$t("b_product_pricing.state_unavailable"),
      };
    },
    provider_state() {
      const sg = this.shop_gateway;
      if (!sg?.enable || !sg.gateway?.enable)
        return { tone: "error", label: this.$t("b_product_pricing.disabled") };
      if (!sg.livemode)
        return { tone: "warning", label: this.$t("b_product_pricing.sandbox") };
      return { tone: "success", label: this.$t("b_product_pricing.live") };
    },
    meta_entries() {
      const meta = this.subscriptionPrice.meta;
      return meta && typeof meta === "object" ? Object.entries(meta) : [];
    },
  },
  methods: {
    showDeleteDialog() {
      NotificationService.openDangerAlert(
        this.$t("product_admin.inventory.variant_item.delete_dialog.title"),
        this.$t("product_admin.inventory.variant_item.delete_dialog.message"),
        this.$t("global.actions.delete"),
        () => {
          this.$emit("delete");
        },
      );
    },

    showRestoreDialog() {
      NotificationService.openDangerAlert(
        "Restore deleted variant",
        "Do you want to restore this deleted variant?",
        "Yes, Restore now",
        () => {
          this.$emit("restore");
        },
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.product-variant-card {
  cursor: pointer;
  min-height: 90px;
  position: relative;
  flex-direction: row !important;
}

.cel-1,
.cel-2,
.cel-3,
.cel-4 {
  display: flex;
  flex-direction: column;
}

.cel-1 {
  align-items: flex-start;
  justify-content: flex-start;
  flex-grow: 1;
  width: 50%;
  max-width: 300px;
  min-width: 250px;
  text-align: start;
}

.cel-2 {
  align-items: flex-start;
  justify-content: center;
  padding: 8px;
}

.cel-3 {
  justify-content: center;
  padding: 8px;
  flex-grow: 1;
  min-width: 150px;
  align-items: center;
}

.cel-4 {
  justify-content: center;
  flex-grow: 0;
  padding: 8px;
  min-width: 100px;
  align-items: center;

  code {
    border-radius: 5px;
    padding: 2px 6px;
  }
}

// Refined row: same geometry as the refined variant rows (87px, 12px inset, column captions on phones).
.b-pricing-plan {
  border-block-end: 1px solid var(--sd-modern-border);
  padding-block: 2px;
  font-size: 12px;
  font-weight: 400;
  line-height: 18px;
  text-align: start;

  &__row {
    position: relative;
    display: grid;
    grid-template-columns: var(--pricing-columns);
    align-items: center;
    gap: 12px;
    min-height: 87px;
    padding: 12px;
    border-radius: 8px;
  }
  &__row > div {
    min-width: 0;
  }
  &__row[role="button"]:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: -2px;
  }
  &__title {
    display: flex;
    align-items: center;
    gap: 7px;
    min-width: 0;
  }
  &__title > .sd-modern-status__dot {
    flex: 0 0 7px;
    width: 7px;
    height: 7px;
  }
  &__title > b {
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &__description {
    display: block;
    margin-block-start: 2px;
    color: var(--sd-modern-muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &__state {
    display: inline-block;
    margin-block-start: 3px;
    font-size: 10px;
    line-height: 15px;
    color: var(--sd-modern-muted);
  }
  &__ids > b {
    display: block;
    font-size: 12px;
    font-weight: 500;
  }
  &__ids > span {
    display: flex;
    gap: 3px;
    font-size: 10px;
    line-height: 16px;
    color: var(--sd-modern-muted);
  }
  &__ids bdi {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &__price > b {
    display: block;
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
  }
  &__price > span {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    margin-block-start: 2px;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 16px;
  }
  &__period-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex: none;
  }
  &__provider {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  &__provider > img {
    flex: none;
    border-radius: 5px;
    object-fit: contain;
  }
  &__provider > div {
    min-width: 0;
  }
  &__provider b {
    display: block;
    font-size: 12px;
    font-weight: 500;
    line-height: 18px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &__provider .sd-modern-status {
    font-size: 10px;
    line-height: 15px;
  }
  &__sync {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  &__chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    max-width: 100%;
    padding: 2px 3px 2px 7px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 6px;
    background: var(--sd-modern-inset);
    font-size: 11px;
    line-height: 16px;
  }
  &__chip > span {
    flex: none;
    color: var(--sd-modern-muted);
  }
  &__chip > code {
    min-width: 0;
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 11px;
  }
  &__copy {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    width: 22px;
    height: 22px;
    margin-inline-start: 1px;
    padding: 0;
    border: 0;
    border-radius: 5px;
    background: transparent;
    color: var(--sd-modern-muted);
    cursor: pointer;
  }
  &__copy:hover,
  &__copy:focus-visible {
    background: rgba(var(--v-theme-on-surface), 0.06);
    color: rgb(var(--v-theme-on-surface));
  }
  &__copy:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 1px;
  }
  &__muted {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: rgba(var(--v-theme-on-surface), 0.45);
    font-size: 11px;
    line-height: 16px;
    border-radius: 4px;
  }
  &__muted:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 2px;
  }
  &__actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 4px;
  }
  &__actions .v-btn {
    width: 32px;
    height: 32px;
    border-radius: 7px;
  }
  // Beats the shared .sd-modern-data-table caption rule on desktop; phones show the captions.
  &__caption.sd-modern-list-header {
    display: none;
  }
  &--deleted &__plan,
  &--deleted &__ids,
  &--deleted &__price,
  &--deleted &__provider,
  &--deleted &__sync {
    opacity: 0.6;
  }

  // Two labelled columns when the plans list (BProductInventoryManagementSubscription) is too narrow for its grid.
  @container pricing-plans (max-width: 784.98px) {
    &__row {
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      gap: 10px 16px;
      padding: 12px;
    }
    &__plan {
      grid-column: 1 / -1;
      padding-inline-end: 92px;
    }
    &__ids,
    &__price,
    &__provider,
    &__sync {
      align-self: start;
    }
    &__provider {
      flex-wrap: wrap;
    }
    &__caption.sd-modern-list-header {
      display: block;
      flex-basis: 100%;
      margin-block-end: 3px;
    }
    &__actions {
      position: absolute;
      inset-inline-end: 12px;
      top: 12px;
    }
    &__actions .v-btn {
      width: 44px;
      height: 44px;
    }
  }
}
.smart-invert .b-pricing-plan__period-dot {
  filter: invert(1);
}
</style>
