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
  <v-container
    class="text-start"
    :class="modern ? ['b-product-edit-type--modern', { 'b-product-edit-type--compact': compact }] : 'pt-3 pb-16 my-3'"
  >
    <template v-if="modern">
      <fieldset
        v-if="compact"
        class="b-product-edit-type__pills"
        :aria-label="$t('global.commons.product_type')"
        :disabled="disabled"
      >
        <v-tooltip
          v-for="item in available_types"
          :key="item.code"
          content-class="sd-modern-tooltip text-start"
          location="top"
          open-on-click
        >
          <template #activator="{ props }">
            <label
              class="b-product-edit-type__pill"
              :class="{ '-selected': selectedType === item.code, '-disabled': disabled || !item.enable }"
            >
              <input
                v-bind="props"
                type="radio"
                :name="typeInputName"
                :value="item.code"
                :checked="selectedType === item.code"
                :disabled="disabled || !item.enable"
                @change="!disabled && $emit('select', item)"
              />
              <b-product-edit-info-icon :name="compactTypeIcons[item.code]" :size="18" />
              <span>{{ $t(item.name) }}</span>
            </label>
          </template>
          {{ $t(item.description) }}
          <span v-if="item.code === ProductType.SERVICE.code" class="d-block">
            {{ $t('global.commons.installment') }} / {{ $t('global.commons.split_payment') }}
          </span>
          <span v-if="item.code === ProductType.SUBSCRIPTION.code" class="d-block">
            {{ $t('global.commons.recurring_payment') }}
          </span>
        </v-tooltip>
      </fieldset>
      <fieldset
        v-else
        class="b-product-edit-type__choices"
        :aria-label="$t('global.commons.product_type')"
        :disabled="disabled"
      >
        <label
          v-for="item in available_types"
          :key="item.code"
          class="b-product-edit-type__choice sd-modern-clickable-item"
          :class="{ '-selected': selectedType === item.code, disabled: disabled || !item.enable }"
        >
          <input
            type="radio"
            :name="typeInputName"
            :value="item.code"
            :checked="selectedType === item.code"
            :disabled="disabled || !item.enable"
            @change="!disabled && $emit('select', item)"
          />
          <img :src="item.image" alt="" width="28" height="30" />
          <span class="b-product-edit-type__copy">
            <span class="b-product-edit-type__title">{{ $t(item.name) }}</span>
            <span class="b-product-edit-type__description">{{ $t(item.description) }}</span>
            <span
              v-if="item.code === ProductType.SERVICE.code"
              class="b-product-edit-type__capability"
            >
              {{ $t('global.commons.installment') }} / {{ $t('global.commons.split_payment') }}
            </span>
            <span
              v-if="item.code === ProductType.SUBSCRIPTION.code"
              class="b-product-edit-type__capability"
            >{{ $t('global.commons.recurring_payment') }}</span>
          </span>
        </label>
      </fieldset>

      <component
        :is="compact ? 'details' : 'div'"
        v-if="!IS_VENDOR_PANEL && (hasAddDropshipping || hasAddConnectOs)"
        class="b-product-edit-type__imports"
      >
        <summary v-if="compact" class="b-product-edit-type__import-summary">
          <span>{{ $t('add_product.flow.existing_product') }}</span>
          <b-product-edit-info-icon name="ChevronDown" :size="16" />
        </summary>
        <h3 v-else class="sd-modern-eyebrow">{{ $t('add_product.flow.existing_product') }}</h3>
        <!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ Add By Drop shipping ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
        <button
          v-if="hasAddDropshipping && !IS_VENDOR_PANEL /*🟢 Not Vendor Panel 🟢*/"
          type="button"
          class="b-product-edit-type__import sd-modern-clickable-item"
          :disabled="disabled || !can_reselling"
          @click="!disabled && can_reselling && (dropshipping = !dropshipping)"
        >
          <img src="../../../../assets/icons/dropshipping-outline.svg" alt="" width="20" height="20" />
          <span class="b-product-edit-type__copy">
            <span class="b-product-edit-type__import-title">{{ $t('global.commons.drop_shipping') }}</span>
            <span class="b-product-edit-type__description">{{ !can_reselling ? $t('product_studio.your_license_is_not_eligible') : $t('product_studio.drop_shipping.subtitle') }}</span>
          </span>
          <v-icon size="16" aria-hidden="true">{{ $t('icons.arrow_end') }}</v-icon>
        </button>

        <!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ Connect ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
        <component
          :is="disabled ? 'span' : 'router-link'"
          v-if="hasAddConnectOs && !IS_VENDOR_PANEL /*🟢 Not Vendor Panel 🟢*/"
          :to="disabled ? undefined : { name: 'BPageShopChannelConnect' }"
          class="b-product-edit-type__import sd-modern-clickable-item"
          :aria-disabled="disabled || undefined"
        >
          <img src="../../../../assets/icons/connect.svg" alt="" width="20" height="20" />
          <span class="b-product-edit-type__copy">
            <span class="b-product-edit-type__import-title">Connect OS</span>
            <span class="b-product-edit-type__description">{{ $t('product_studio.by_connect.subtitle') }}</span>
          </span>
          <v-icon size="16" aria-hidden="true">{{ $t('icons.arrow_end') }}</v-icon>
        </component>
      </component>
    </template>

    <v-list v-else class="overflow-visible" lines="3">
      <v-list-item
        v-for="item in available_types"
        :key="item.code"
        :class="{ disabled: disabled || !item.enable }"
        :disabled="disabled || !item.enable"
        class="widget-hover -gray-bg widget-button"
        @click="!disabled && $emit('select', item)"
      >
        <template v-slot:prepend>
          <v-avatar rounded="0">
            <img :src="item.image" />
          </v-avatar>
        </template>

        <v-list-item-title>
          {{ $t(item.name) }}
        </v-list-item-title>

        <v-list-item-subtitle>
          {{ $t(item.description) }}
        </v-list-item-subtitle>

        <v-list-item-subtitle class="op-1-0">
          <v-chip
            v-if="item.code === ProductType.SERVICE.code"
            color="green"
            size="x-small"
            variant="tonal"
            class="mt-1"
          >
            ● {{ $t("global.commons.installment") }} /
            {{ $t("global.commons.split_payment") }}
          </v-chip>
          <v-chip
            v-if="item.code === ProductType.SUBSCRIPTION.code"
            color="green"
            size="x-small"
            variant="tonal"
            class="mt-1"
          >
            ● {{ $t("global.commons.recurring_payment") }}
          </v-chip>
        </v-list-item-subtitle>

        <v-expand-transition>
          <div v-if="expanded_type === item" class="max-widget-width mx-auto">
            <!-- ━━━━━━━━━━━━━ Pods ━━━━━━━━━━━━━ -->
            <order-type-minimal-flow
              :type="item"
              class="mt-2"
            ></order-type-minimal-flow>
            <!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
            <div class="mt-5 typo-body" style="line-height: 1.5em !important">
              <div v-if="item === ProductType.FILE">
                Use this type for selling files. This allows you to upload your
                files to the Selldone cloud at no cost and sell them using your
                custom domain.
              </div>

              <div v-else-if="item === ProductType.PHYSICAL">
                The physical type is ideal for selling tangible goods. It can
                also be used for selling services with a fixed price, such as
                theatre tickets or home services, essentially treating them as
                physical tokens or vouchers.
              </div>

              <div v-else-if="item === ProductType.VIRTUAL">
                Use the Virtual product type for selling items that require no
                delivery or shipping. This type is also suitable for instances
                where information, such as gift card codes, needs to be sent
                post-purchase.
              </div>

              <div v-else-if="item === ProductType.SERVICE">
                Use this type for order verification, final price determination,
                or checking availability prior to customer payment. Products of
                the Service type undergo an additional verification process.
                This process, to be carried out by the seller, takes place after
                the user completes the order checkout and prior to the final
                payment.
              </div>

              <div v-else-if="item === ProductType.SUBSCRIPTION">
                This type can be used to sell subscription services, products,
                and content. Note that only certain payment gateways, such as
                Stripe, support the subscription model.
              </div>
            </div>
          </div>
        </v-expand-transition>

        <template v-slot:append>

          
        </template>
      </v-list-item>

      <v-divider></v-divider>
      <!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ Add By Drop shipping ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->

      <v-list-item
        v-if="hasAddDropshipping && !IS_VENDOR_PANEL /*🟢 Not Vendor Panel 🟢*/"
        key="ds"
        :class="{ disabled: disabled || !can_reselling }"
        :disabled="disabled || !can_reselling"
        class="widget-hover -gray-bg widget-button"
        @click="!disabled && can_reselling && (dropshipping = !dropshipping)"
        append-icon="conveyor_belt"
      >
        <template v-slot:prepend>
          <v-avatar rounded="0">
            <img src="../../../../assets/icons/dropshipping-outline.svg" />
          </v-avatar>
        </template>

        <v-list-item-title>
          {{ $t("global.commons.drop_shipping") }}
          <v-chip
            class="m-1 pa-1"
            color="#eee"
            label
            size="x-small"
            variant="flat"
            >wholesalers on
            <img
              class="ms-1"
              height="12"
              src="../../../../assets/selldone-logo/logo-box.svg"
              width="12"
          /></v-chip>
        </v-list-item-title>

        <v-list-item-subtitle>
          {{
            !can_reselling
              ? $t("product_studio.your_license_is_not_eligible")
              : $t("product_studio.drop_shipping.subtitle")
          }}
        </v-list-item-subtitle>
      </v-list-item>

      <!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ Connect ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->

      <v-list-item
        v-if="hasAddConnectOs && !IS_VENDOR_PANEL /*🟢 Not Vendor Panel 🟢*/"
        key="cn"
        :disabled="disabled"
        :to="{ name: 'BPageShopChannelConnect' }"
        class="widget-hover -gray-bg widget-button"
      >
        <template v-slot:prepend>
          <v-avatar rounded="0">
            <img src="../../../../assets/icons/connect.svg" />
          </v-avatar>
        </template>

        <v-list-item-title>
          {{ $t("global.commons.drop_shipping") }}
          <v-chip
            class="m-1 pa-1"
            color="#eee"
            label
            size="x-small"
            variant="flat"
            >Connect OS
          </v-chip>
        </v-list-item-title>

        <v-list-item-subtitle>
          {{ $t("product_studio.by_connect.subtitle") }}
        </v-list-item-subtitle>
      </v-list-item>
    </v-list>
    <!-- ██████████████████████ Add Drop Shipping ██████████████████████ -->
    <v-dialog
      v-model="dropshipping"
      fullscreen
      scrollable
      :theme="USER()?.preferences?.dark ? 'dark' : undefined"
      transition="dialog-bottom-transition"
    >
      <v-card class="b-product-edit-type__dropshipping text-start">
        <v-card-title class="b-product-edit-type__dropshipping-header">
          <v-avatar class="avatar-gradient -thin -shop" size="32">
            <v-img :src="getShopImagePath(shop.icon, 128)" />
          </v-avatar>

          <div class="b-product-edit-type__dropshipping-title">
            {{ shop.title }}
            <p>
              {{ $t("product_studio.dropshipping_dialog.title") }}
            </p>
          </div>
          <v-tooltip content-class="sd-modern-tooltip" location="top">
            <template #activator="{ props }">
              <v-btn v-bind="props" class="sd-modern-icon-button" variant="text" icon="close" :aria-label="$t('global.actions.close')" @click="dropshipping = false" />
            </template>
            {{ $t("global.actions.close") }}
          </v-tooltip>
        </v-card-title>

        <v-card-text class="sd-modern-canvas b-product-edit-type__dropshipping-content">
          <b-product-add-dropshipping v-if="dropshipping" :shop="shop" @back="dropshipping = false">
          </b-product-add-dropshipping>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
import { useId } from "vue";
import OrderTypeMinimalFlow from "../../../product/widgets/OrderTypeMinimalFlow.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import { ShopOptionsHelper } from "@selldone/core-js/helper/shop/ShopOptionsHelper";
import BProductAddDropshipping from "../../../product/add/drop-shipping/BProductAddDropshipping.vue";
import { Eligible } from "@selldone/core-js/enums/shop/ShopLicense";
import BProductEditInfoIcon from "../info/BProductEditInfoIcon.vue";
const COMPACT_TYPE_ICONS = {
  PHYSICAL: "PackageOpen",
  VIRTUAL: "Globe",
  FILE: "Files",
  SERVICE: "ClipboardCheck",
  SUBSCRIPTION: "RotateCcw",
};

export default {
  name: "BProductEditType",
  mixins: [],
  emits: ["select"],
  setup() {
    return { typeInputName: useId(), compactTypeIcons: COMPACT_TYPE_ICONS };
  },
  components: {
    BProductEditInfoIcon,
    BProductAddDropshipping,
    OrderTypeMinimalFlow,
  },

  props: {
    modern: { type: Boolean, default: false },
    compact: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    selectedType: { type: String, default: null },
    shop: {
      required: true,
      type: Object,
    },

    hasAddDropshipping: {
      default: false,
      type: Boolean,
    },
    hasAddConnectOs: {
      default: false,
      type: Boolean,
    },
  },
  data: function () {
    return {
      ProductType: ProductType,

      expanded_type: null,
      dropshipping: false,
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

    option_types() {
      return ShopOptionsHelper.GetActiveTypes(this.shop);
    },

    available_types() {
      return Object.values(ProductType).filter((t) =>
        this.option_types.includes(t.code),
      );
    },

    can_reselling() {
      return Eligible.CanReselling(this.shop);
    },
  },

};
</script>

<style lang="scss" scoped>
.b-product-edit-type__dropshipping {
  --sd-modern-icon-button-size: 32px;
  letter-spacing: 0;
  // Text and illustration ink need a lighter dark-theme tone; filled primary actions keep their native blue.
  &.v-theme--dark {
    --dropshipping-primary-ink: color-mix(in srgb, rgb(var(--v-theme-primary)) 65%, rgb(var(--v-theme-on-surface)));
    --dropshipping-art-mix: 65%;
    :deep(.sd-modern-button.v-btn--variant-text.text-primary) { color: var(--dropshipping-primary-ink) !important; }
  }
  &-header { display: flex; align-items: center; gap: 11px; padding: 17px 24px; border-block-end: 1px solid rgba(var(--v-theme-on-surface), .09); }
  &-title { flex: 1; min-width: 0; font-family: inherit; font-size: 14px; font-weight: 400; line-height: 21px; white-space: normal; overflow-wrap: anywhere; }
  &-title p { margin: 0; color: rgba(var(--v-theme-on-surface), .66); font-size: 12px; font-weight: 400; line-height: 19px; }
  &-content { padding: 0 24px !important; letter-spacing: 0; }
  @media(max-width: 620px) {
    &-header { padding: 16px; }
    &-content { padding-inline: 14px !important; }
  }
}
.b-product-edit-type--modern {
  width: 100%;
  padding: 0;
  margin: 0;
  font-family: inherit;
  color: rgb(var(--v-theme-on-surface));

  .b-product-edit-type__choices {
    display: flex;
    flex-direction: column;
    gap: 7px;
    min-width: 0;
    padding: 0;
    margin: 0;
    border: 0;
  }

  .b-product-edit-type__choice {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    min-height: 68px;
    padding: 13px 12px;
    border: 1px solid transparent;
    border-radius: 10px;
    background: transparent;
    text-align: start;

    &.-selected {
      border-color: rgb(var(--v-theme-primary));
      background: rgb(var(--v-theme-surface));
    }

    &.disabled {
      opacity: .6;
    }

    > input {
      flex-shrink: 0;
      width: 15px;
      height: 15px;
      margin: 7px 0 0;
      accent-color: rgb(var(--v-theme-primary));

      &:focus-visible {
        outline: 2px solid rgb(var(--v-theme-primary));
        outline-offset: 4px;
      }
    }

    > img {
      flex-shrink: 0;
      object-fit: contain;
    }
  }

  .b-product-edit-type__copy {
    display: block;
    flex: 1;
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .b-product-edit-type__title {
    display: block;
    font-size: 14px;
    font-weight: 500;
    line-height: 21px;
    letter-spacing: 0;
  }

  .b-product-edit-type__description {
    display: block;
    margin-top: 2px;
    color: var(--sd-modern-muted);
    font-size: 12px;
    font-weight: 400;
    line-height: 19px;
    letter-spacing: 0;
  }

  .b-product-edit-type__capability {
    display: block;
    margin-top: 4px;
    color: var(--sd-modern-muted);
    font-size: 11px;
    font-weight: 400;
    line-height: 17px;

    &::before {
      display: inline-block;
      width: 4px;
      height: 4px;
      margin-inline-end: 5px;
      border-radius: 50%;
      background: rgb(var(--v-theme-primary));
      vertical-align: middle;
      content: "";
    }
  }

  .b-product-edit-type__imports {
    margin-top: 24px;

    > h3 { margin-bottom: 8px; }
  }

  .b-product-edit-type__import {
    display: flex;
    align-items: center;
    gap: 11px;
    width: 100%;
    min-height: 54px;
    padding: 11px 12px;
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: inherit;
    font-family: inherit;
    text-align: start;
    text-decoration: none;

    > img { flex-shrink: 0; object-fit: contain; }
    > .v-icon { color: var(--sd-modern-muted); }
    &:disabled { opacity: .6; }
    &:focus-visible {
      outline: 2px solid rgb(var(--v-theme-primary));
      outline-offset: 3px;
    }
  }

  .b-product-edit-type__import-title {
    display: block;
    font-size: 13px;
    font-weight: 400;
    line-height: 20px;
    letter-spacing: 0;
  }

  @media (max-width: 599px) {
    .b-product-edit-type__choice { padding: 12px; gap: 9px; }
  }

  &.b-product-edit-type--compact {
    .b-product-edit-type__pills {
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: 7px;
      min-width: 0;
      padding: 0;
      margin: 0;
      border: 0;
    }

    .b-product-edit-type__pill {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      min-width: 0;
      min-height: 42px;
      padding: 8px 6px;
      border: 1px solid rgba(var(--v-theme-on-surface), .12);
      border-radius: 9px;
      background: rgb(var(--v-theme-surface));
      font-size: 13px;
      font-weight: 400;
      line-height: 20px;
      letter-spacing: 0;
      text-align: center;
      overflow-wrap: anywhere;
      cursor: pointer;

      > input {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        margin: 0;
        opacity: 0;
        cursor: inherit;
      }

      &:has(:focus-visible) {
        outline: 2px solid rgb(var(--v-theme-primary));
        outline-offset: 3px;
      }

      &.-selected {
        color: rgb(var(--v-theme-primary));
        border-color: currentColor;
        background: rgba(var(--v-theme-primary), .04);
      }

      &.-disabled { opacity: .6; cursor: default; }
    }

    .b-product-edit-type__imports { margin-top: 16px; }
    .b-product-edit-type__import-summary {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      min-height: 42px;
      font-size: 13px;
      font-weight: 400;
      line-height: 20px;
      cursor: pointer;

      &::-webkit-details-marker { display: none; }
      &:focus-visible {
        outline: 2px solid rgb(var(--v-theme-primary));
        outline-offset: 3px;
      }
    }
    details[open] > .b-product-edit-type__import-summary > svg { transform: rotate(180deg); }
    .b-product-edit-type__import[aria-disabled="true"] { opacity: .6; }

    @media (max-width: 599px) {
      .b-product-edit-type__pills { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    @media (max-width: 599px), (pointer: coarse) {
      .b-product-edit-type__pill,
      .b-product-edit-type__import-summary { min-height: 44px; }
    }
  }
}
</style>
