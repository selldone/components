<!--
  - Copyright (c) 2023. Selldone® Business OS™
  -
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  - ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  -
  - All rights reserved.
  -->

<template>
  <div
    v-if="hasTaxDetails"
    class="s--shop-basket-item-tax-info"
    :class="{
      's--shop-basket-item-tax-info--dense': dense,
      's--shop-basket-item-tax-info--error': isError,
      's--shop-basket-item-tax-info--end': alignEnd,
    }"
  >
    <div class="tax-line">
      <v-icon v-if="isError" class="tax-warning" size="x-small">
        warning
      </v-icon>

      <span class="tax-title">
        {{ taxTitle }}
        <v-tooltip
          v-if="taxTitle"
          activator="parent"
          content-class="bg-black text-start"
          location="bottom"
        >
          {{ taxTitle }}
        </v-tooltip>
      </span>

      <span v-if="isCollectingDisabled" class="tax-amount tax-collecting-disabled">
        Collecting disabled
        <v-tooltip
          activator="parent"
          content-class="bg-black text-start"
          location="bottom"
        >
          Tax collection is disabled in the external tax service for this item,
          so tax is not calculated for it.
        </v-tooltip>
      </span>

      <span v-else-if="showAmount" class="tax-amount">
        <span v-if="profileLabel" class="tax-label">{{ profileLabel }}</span>
        <u-price :amount="taxAmount" :currency="currency || undefined" />
      </span>
    </div>

    <div v-if="isError && errorMessage" class="tax-message">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  tax?: Record<string, any> | null;
  currency?: string | null;
  dense?: boolean;
  alignEnd?: boolean;
}>();

const hasTaxDetails = computed(() => {
  const tax = props.tax;
  return !!(
    tax &&
    (tax.tax_status_msg ||
      tax.error_msg ||
      tax.profile_title ||
      tax.profile_label ||
      tax.amount !== undefined)
  );
});

const isError = computed(() => !!props.tax?.error);

const taxTitle = computed(() => {
  return props.tax?.profile_title || "Tax";
});

const showAmount = computed(() => {
  return !!props.tax && !props.tax.error && props.tax.amount !== undefined;
});

const isCollectingDisabled = computed(() => {
  return props.tax?.tax_collecting_enable === false;
});

const taxAmount = computed(() => {
  const amount = Number(props.tax?.amount);
  return Number.isFinite(amount) ? amount : 0;
});

const profileLabel = computed(() => props.tax?.profile_label || null);

const errorMessage = computed(() => props.tax?.error_msg || props.tax?.tax_status_msg || null);
</script>

<style lang="scss" scoped>
.s--shop-basket-item-tax-info {
  display: block;
  max-width: 100%;
  margin-top: 4px;
  color: #666;
  font-size: 0.76rem;
  line-height: 1.4;
  text-align: start;

  &--dense {
    font-size: 0.72rem;
  }

  &--error {
    color: #555;
  }

  &--end {
    text-align: end;

    .tax-line {
      justify-content: flex-end;
    }
  }

  .tax-line {
    display: flex;
    align-items: baseline;
    max-width: 100%;
    overflow: hidden;
    gap: 4px;
  }

  .tax-warning {
    flex: 0 0 auto;
    color: #c20e0e;
    transform: translateY(1px);
  }

  .tax-title {
    min-width: 0;
    overflow: hidden;
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tax-amount {
    flex: 0 0 auto;
    margin-inline-start: 6px;
    color: #333;
    font-weight: 700;
  }

  .tax-label {
    margin-inline-end: 4px;
    color: #777;
    font-weight: 500;
  }

  .tax-collecting-disabled {
    color: #8a5a00;
  }

  .tax-message {
    margin-top: 2px;
    overflow-wrap: anywhere;
    color: #c20e0e;
  }
}
</style>
