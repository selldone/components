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
  <tr
    :class="{
      disabled: busy_delete,
      'b-product-extra-pricing-row': modern,
      'b-product-extra-pricing-row--workspace': workspaceMode,
    }"
    class="text-start"
  >
    <td>
      <span
        v-if="modern"
        class="b-product-extra-pricing-row__caption sd-modern-list-header"
        >{{ $t("add_product.pricing.modern.minimum_quantity") }}</span
      >
      <v-icon v-if="color" :color="color" class="me-1" size="small"
        >circle
      </v-icon>
      <component :is="modern ? 'span' : 'b'">{{
        numeralFormat(extraPricing.min, workspaceMode ? "0,0" : "0.[00]a")
      }}</component>
    </td>

    <td>
      <span
        v-if="modern"
        class="b-product-extra-pricing-row__caption sd-modern-list-header"
        >{{
          $t(
            workspaceMode
              ? "add_product.pricing.workspace.after_discount"
              : "global.commons.price",
          )
        }}</span
      >
      <u-price
        :amount="calculatePrice"
        :class="{ 'text-danger': !modern && calculatePrice <= 0 }"
        :currency="currency"
      >
      </u-price>
      <span v-if="price_label" class="ms-2">{{ price_label }}</span>
    </td>

    <td>
      <span
        v-if="modern"
        class="b-product-extra-pricing-row__caption sd-modern-list-header"
        >{{ $t("add_product.pricing.discount_input") }}</span
      >
      <div
        v-if="discount_percent"
        :class="
          modern ? 'b-product-extra-pricing-row__discount' : 'text-center mb-2'
        "
      >
        <component :is="modern ? 'span' : 'b'"
          >{{ discount_percent }}%</component
        >

        <u-time-progress-bar
          v-if="extraPricing.dis_start || extraPricing.dis_end"
          :class="{ 'text-white': !modern && !light }"
          :created-time="
            extraPricing.created_at
              ? extraPricing.created_at
              : product.created_at
          "
          :end-time="extraPricing.dis_end"
          :start-time="extraPricing.dis_start"
          class="my-2 max-w-400 mx-auto"
          small
        />
      </div>
      <span v-else-if="modern">—</span>
    </td>

    <td class="text-end">
      <template v-if="!readonly">
        <div v-if="modern" class="b-product-extra-pricing-row__actions">
          <v-tooltip
            location="top"
            content-class="sd-modern-tooltip text-start"
          >
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                class="sd-modern-icon-button"
                :aria-label="$t('global.actions.edit')"
                :disabled="workspaceMode && (disabled || busy_delete)"
                icon
                variant="text"
                @click.stop="showEdit"
                ><b-product-edit-info-icon
                  v-if="workspaceMode"
                  name="Pencil"
                  :size="16"
                /><v-icon v-else size="16" aria-hidden="true"
                  >edit</v-icon
                ></v-btn
              >
            </template>
            {{ $t("global.actions.edit") }}
          </v-tooltip>
          <v-tooltip
            location="top"
            content-class="sd-modern-tooltip text-start"
          >
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                class="sd-modern-icon-button"
                :aria-label="$t('global.actions.delete')"
                :loading="busy_delete"
                :disabled="workspaceMode && (disabled || busy_delete)"
                icon
                variant="text"
                @click.stop="showDelete"
                ><b-product-edit-info-icon
                  v-if="workspaceMode"
                  name="Trash2"
                  :size="16"
                /><v-icon v-else size="16" aria-hidden="true"
                  >delete</v-icon
                ></v-btn
              >
            </template>
            {{ $t("global.actions.delete") }}
          </v-tooltip>
        </div>
        <template v-else>
          <v-btn rounded variant="text" @click="showEdit">
            <v-icon class="me-1" size="small">edit</v-icon>
            {{ $t("global.actions.edit") }}
          </v-btn>
          <v-btn
            :loading="busy_delete"
            class="me-2"
            rounded
            title="Delete pricing"
            variant="text"
            @click="showDelete"
          >
            <v-icon class="me-1" size="small">delete</v-icon>
            {{ $t("global.actions.delete") }}
          </v-btn>
        </template>
      </template>
      <slot name="action"></slot>
    </td>
  </tr>
  <tr
    v-if="error_msg"
    :class="{ 'b-product-extra-pricing-row--message': modern }"
  >
    <td class="small" colspan="4">
      <v-icon
        class="me-1"
        :class="{ 'blink-me-linear': !modern }"
        size="small"
        :color="modern ? 'warning' : undefined"
        >warning_amber
      </v-icon>
      <span v-if="modern">{{ error_msg }}</span>
      <span v-else v-html="error_msg"></span>
    </td>
  </tr>
  <v-dialog
    v-if="workspaceMode"
    :model-value="confirm_delete"
    :persistent="busy_delete"
    max-width="440"
    width="calc(100vw - 32px)"
    @update:model-value="
      (value) => {
        if (!busy_delete) confirm_delete = value;
      }
    "
  >
    <v-card
      class="sd-modern-widget b-product-extra-pricing-row__confirmation text-start"
    >
      <h2>{{ $t("add_product.pricing.workspace.tier_delete_title") }}</h2>
      <p>{{ $t("add_product.pricing.workspace.tier_delete_help") }}</p>
      <div>
        <v-btn
          class="sd-modern-button"
          variant="outlined"
          :disabled="busy_delete"
          @click="confirm_delete = false"
          >{{ $t("global.actions.cancel") }}</v-btn
        ><v-btn
          class="sd-modern-button sd-modern-button--danger"
          color="error"
          variant="elevated"
          :loading="busy_delete"
          :disabled="busy_delete"
          @click="deleteNow"
          ><template #prepend
            ><b-product-edit-info-icon name="Trash2" :size="16" /></template
          >{{ $t("global.actions.delete") }}</v-btn
        >
      </div>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import UTimeProgressBar from "../../../../ui/time/progress-bar/UTimeProgressBar.vue";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";
import ProductMixin from "@selldone/components-vue/mixin/product/ProductMixin.ts";
import BProductEditInfoIcon from "../../edit/info/BProductEditInfoIcon.vue";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BProductExtraPricingRow",
  mixins: [CurrencyMixin, ProductMixin],

  components: {
    BProductEditInfoIcon,
    UTimeProgressBar,
  },
  emits: ["select", "onDelete", "close", "activity"],

  props: {
    modern: { type: Boolean, default: false },
    workspace: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    shop: {
      required: true,
      type: Object,
    },
    vendor: {
      /*🟢 Vendor Panel 🟢*/ required: false,
    },
    vendorProduct: {
      /*🟢 Add extra pricing to product<->vendor in the Product > Vendors tab🟢*/ required: false,
    },

    product: {
      required: true,
      type: Object,
    },

    variant: {
      required: false,
      type: Object,
    },

    extraPricing: {
      required: true,
      type: Object,
    },
    allExtraPricings: {
      // Active extra pricing for current product / variant / vendor
      required: false,
      type: Array,
    },

    transparent: {
      type: Boolean,
      default: false,
    },
    light: {
      type: Boolean,
      default: false,
    },
    readonly: Boolean,

    color: {}, // Corresponding extra pricing color!
  },

  data: () => ({
    busy_delete: false,
    confirm_delete: false,
    dialogActivator: null,
  }),

  computed: {
    workspaceMode() {
      return this.modern && this.workspace;
    },
    workspaceActivity() {
      return this.confirm_delete || this.busy_delete;
    },
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    pricing() {
      return this.product.pricing;
    },
    price_label() {
      return this.product.price_label;
    },

    currency() {
      return this.product.currency;
    },
    currencyObject() {
      return this.GetCurrency(this.currency);
    },
    currencyName() {
      return this.getCurrencyName(this.currency);
    },

    calculatePrice() {
      return this.priceProductByCurrency(
        this.shop,
        {
          price: this.extraPricing.price,
          currency: this.currency,
          commission: this.extraPricing.commission,
          discount: this.extraPricing.discount,
        },
        null,
        this.currency,
      );
    },
    discount_percent() {
      return this.discountProductPercent(this.shop, {
        price: this.extraPricing.price,
        currency: this.currency,
        commission: this.extraPricing.commission,
        discount: this.extraPricing.discount,
      });
    },

    error_msg() {
      if (
        this.allExtraPricings?.some(
          (x) =>
            x.min > this.extraPricing.min &&
            x.price + x.commission - x.discount >
              this.extraPricing.price +
                this.extraPricing.commission -
                this.extraPricing.discount,
        )
      )
        return this.modern
          ? this.$t("add_product.pricing.modern.tier_price_lower")
          : "Double-check! The price appears to be <b>lower</b> than expected.";
      if (
        this.allExtraPricings?.some(
          (x) =>
            x.min < this.extraPricing.min &&
            x.price + x.commission - x.discount <
              this.extraPricing.price +
                this.extraPricing.commission -
                this.extraPricing.discount,
        )
      )
        return this.modern
          ? this.$t("add_product.pricing.modern.tier_price_higher")
          : "Double-check! The price appears to be <b>higher</b> than expected.";
      return null;
    },
  },

  watch: {
    workspaceActivity(value) {
      if (!this.workspaceMode) return;
      this.$emit("activity", value);
      if (!value) {
        const activator = this.dialogActivator;
        this.$nextTick(() => {
          if (activator?.isConnected && !activator.disabled)
            activator.focus({ preventScroll: true });
        });
      }
    },
  },

  created() {},
  beforeUnmount() {
    if (this.workspaceMode && this.workspaceActivity)
      this.$emit("activity", false);
  },

  methods: {
    showEdit() {
      if (
        this.workspaceMode &&
        (this.readonly || this.disabled || this.busy_delete)
      )
        return;
      this.$emit("select", this.extraPricing);
    },

    showDelete() {
      if (this.workspaceMode) {
        if (this.readonly || this.disabled || this.busy_delete) return;
        this.dialogActivator =
          typeof document !== "undefined" ? document.activeElement : null;
        this.confirm_delete = true;
        return;
      }
      NotificationService.openDangerAlert(
        this.modern
          ? this.$t("add_product.pricing.modern.delete_tier_title")
          : "Delete extra pricing",
        this.modern
          ? this.$t("add_product.pricing.modern.delete_tier_help")
          : "Are you certain you want to permanently remove this additional pricing?",
        this.modern ? this.$t("global.actions.delete") : "Yes, Delete now",
        () => {
          this.deleteNow();
        },
      );
    },
    deleteNow() {
      // The open confirmation owns the parent activity lock, so it must not disable itself.
      if (
        this.workspaceMode &&
        (this.readonly || this.busy_delete || !this.confirm_delete)
      )
        return;
      this.busy_delete = true;

      axios
        .delete(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.DELETE_MY_VENDOR_PRODUCT_EDIT_EXTRA_PRICINGS(
                this.$route.params.vendor_id,
                this.product.id,
                this.extraPricing.id,
              )
            : window.API.DELETE_PRODUCT_EDIT_EXTRA_PRICINGS(
                this.shop.id,
                this.product.id,
                this.extraPricing.id,
              ),
        )
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            if (this.workspaceMode) this.confirm_delete = false;
            this.$emit("onDelete", data.id);
            this.$emit("close");
            NotificationService.showSuccessAlert(
              null,
              this.modern
                ? this.$t("add_product.pricing.modern.tier_deleted")
                : "The product extra pricing has been deleted.",
            );
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_delete = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.b-product-extra-pricing-row {
  --sd-modern-icon-button-size: 32px;
  font-size: 13px;
  font-weight: 400;
  line-height: 20px;

  > td {
    padding: 12px 8px 12px 0 !important;
    padding-inline: 0 8px !important;
    border-block-start: 1px solid var(--sd-modern-border);
    vertical-align: middle;
    overflow-wrap: anywhere;
    font-size: inherit;
    line-height: inherit;
  }
  > td:last-child {
    min-width: 70px;
    padding-inline-end: 0 !important;
  }
  :deep(.u--price) {
    font-size: 13px;
    font-weight: 400;
    line-height: 20px;
  }
  &__caption {
    display: none;
    margin-block-end: 5px;
  }
  &__discount {
    font-weight: 400;
  }
  &__actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 6px;
  }
  &__actions :deep(.v-btn) {
    margin: 0 !important;
  }
  &__actions :deep(.v-btn:focus-visible) {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 2px;
  }

  @media (max-width: 600px) {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    padding-block: 12px;
    border-block-start: 1px solid var(--sd-modern-border);
    > td {
      display: block;
      padding: 0 !important;
      border: 0;
    }
    &__caption {
      display: block;
    }
  }
  @media (max-width: 799px), (pointer: coarse) {
    --sd-modern-icon-button-size: 44px;
    > td:last-child {
      min-width: 94px;
    }
  }
}
.b-product-extra-pricing-row--message > td {
  padding: 8px 0 12px !important;
  color: rgb(var(--v-theme-on-surface));
  font-size: 13px;
  line-height: 20px;
}
.b-product-extra-pricing-row__confirmation {
  padding: 23px !important;
  border-radius: 18px !important;
  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 500;
    line-height: 26px;
  }
  p {
    margin-block: 12px 23px;
    font-size: 13px;
    line-height: 21px;
    color: var(--sd-modern-muted);
  }
  > div {
    display: flex;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 9px;
  }
}
.b-product-extra-pricing-row--workspace {
  > td {
    padding: 14px 8px !important;
  }
  @media (max-width: 600px) {
    grid-template-columns: minmax(0, 1fr) 96px;
    gap: 10px 15px;
    padding-block: 16px;
    > td {
      padding: 0 !important;
    }
    > td:nth-child(2) {
      grid-row: 2;
      grid-column: 1;
    }
    > td:nth-child(3) {
      grid-row: 2;
      grid-column: 2;
      text-align: end;
    }
    > td:last-child {
      grid-row: 1;
      grid-column: 2;
    }
  }
}
</style>
