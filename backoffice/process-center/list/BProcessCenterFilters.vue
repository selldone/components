<template>
  <v-dialog
    :model-value="modelValue"
    max-width="640"
    scrollable
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="b-process-center-filters text-start" rounded="xl">
      <v-form class="b-process-center-filters__form" @submit.prevent="applyFilters">
        <header class="sd-modern-header b-process-center-filters__header">
          <h2 class="sd-modern-title-text">
            {{ $t("admin_shop.orders.physical.modern.filters.title") }}
          </h2>
          <v-btn
            class="sd-modern-icon-button"
            icon="close"
            variant="text"
            :aria-label="$t('global.actions.close')"
            @click="close"
          />
        </header>

        <v-card-text class="b-process-center-filters__fields sd-modern-form">
          <b-products-select-box
            v-if="!fixedProductId"
            v-model="draft.productId"
            :shop="shop"
            :label="$t('admin_shop.orders.physical.modern.filters.product')"
            :no-data="$t('admin_shop.orders.physical.modern.filters.all_products')"
            single-product-select
            products-only
            simple-mode
            border-less
          >
            {{ $t("admin_shop.orders.physical.modern.filters.product") }}
          </b-products-select-box>

          <b-customer-input
            v-if="!fixedCustomerId"
            v-model="draft.customerId"
            :shop="shop"
            :label="$t('admin_shop.orders.physical.modern.filters.customer')"
            :placeholder="$t('admin_shop.orders.physical.modern.filters.all_customers')"
            variant="underlined"
            @update:user="draft.customerName = $event?.name || ''"
          />

          <div>
            <u-date-input
              v-model="draft.updatedAfter"
              :label="$t('admin_shop.orders.physical.modern.filters.updated_after')"
              variant="underlined"
              clearable
              return-utc
            />
            <p class="sd-modern-help b-process-center-filters__date-help">
              {{ $t("admin_shop.orders.physical.modern.filters.updated_after_help") }}
            </p>
          </div>
        </v-card-text>

        <v-card-actions class="b-process-center-filters__actions">
          <v-btn
            class="sd-modern-button sd-modern-button--inline"
            variant="text"
            @click="clearDraft"
          >{{ $t("admin_shop.orders.physical.modern.filters.clear") }}</v-btn>
          <v-spacer />
          <v-btn class="sd-modern-button" variant="text" @click="close">
            {{ $t("global.actions.cancel") }}
          </v-btn>
          <v-btn
            class="sd-modern-button"
            color="primary"
            variant="flat"
            type="submit"
            :disabled="!normalizedFilters"
          >{{ $t("admin_shop.orders.physical.modern.filters.apply") }}</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import BProductsSelectBox from "../../product/select-box/BProductsSelectBox.vue";
import BCustomerInput from "../../customer/input/BCustomerInput.vue";
import UDateInput from "../../../ui/date/input/UDateInput.vue";

function filterId(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "number" && typeof value !== "string") return NaN;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : NaN;
}

export default {
  name: "BProcessCenterFilters",
  components: { BProductsSelectBox, BCustomerInput, UDateInput },
  emits: ["update:modelValue", "apply"],
  props: {
    modelValue: { type: Boolean, default: false },
    filters: { type: Object, required: true },
    shop: { type: Object, required: true },
    fixedProductId: { type: [Number, String], default: null },
    fixedCustomerId: { type: [Number, String], default: null },
  },
  data: () => ({
    draft: { productId: null, customerId: null, updatedAfter: null, customerName: "" },
  }),
  computed: {
    normalizedFilters() {
      const productId = filterId(this.fixedProductId ?? this.draft.productId);
      const customerId = filterId(this.fixedCustomerId ?? this.draft.customerId);
      if (Number.isNaN(productId) || Number.isNaN(customerId)) return null;
      const value = this.draft.updatedAfter;
      let updatedAfter = null;
      if (value !== null && value !== undefined && value !== "") {
        if (typeof value !== "string" || value.length > 80) return null;
        const date = new Date(value);
        if (!Number.isFinite(date.getTime())) return null;
        updatedAfter = date.toISOString();
      }
      return {
        productId,
        customerId,
        updatedAfter,
        customerName: customerId && customerId === filterId(this.draft.customerId) && typeof this.draft.customerName === "string"
          ? this.draft.customerName.trim().slice(0, 120)
          : "",
      };
    },
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(open) {
        if (!open) return;
        this.draft = {
          productId: this.filters.productId ?? null,
          customerId: this.filters.customerId ?? null,
          updatedAfter: this.filters.updatedAfter ?? null,
          customerName: this.filters.customerName ?? "",
        };
      },
    },
  },
  methods: {
    clearDraft() {
      this.draft = { productId: null, customerId: null, updatedAfter: null, customerName: "" };
    },
    close() {
      this.$emit("update:modelValue", false);
    },
    applyFilters() {
      if (!this.normalizedFilters) return;
      this.$emit("apply", this.normalizedFilters);
      this.close();
    },
  },
};
</script>

<style lang="scss" scoped>
.b-process-center-filters {
  &__form { display: flex; flex-direction: column; min-height: 0; }
  &__header { flex-shrink: 0; margin: 0; padding: 20px 24px 0; }
  &__fields { display: grid; min-height: 0; gap: 24px; padding: 20px 24px; overflow-y: auto; }
  &__date-help { margin-block: 8px 0; }
  &__actions { flex-shrink: 0; flex-wrap: wrap; gap: 8px; padding: 12px 24px 20px; }

  @media (max-width: 600px) {
    &__header, &__fields, &__actions { padding-inline: 16px; }
  }
}
</style>
