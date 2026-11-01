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
  <v-sheet class="b-product-add-studio sd-modern-canvas text-start">
    <div class="b-product-add-studio__workspace">
      <header class="b-product-add-studio__header">
        <b-product-edit-info-icon
          :name="product ? 'CircleCheck' : 'PackageOpen'"
          :size="23"
        />
        <div class="b-product-add-studio__heading">
          <h2>
            {{
              $t(
                product
                  ? "product_studio.fast.completion_title"
                  : "product_studio.fast.title",
              )
            }}
          </h2>
          <p>
            {{ product ? product.title : $t("product_studio.fast.subtitle") }}
          </p>
        </div>
        <v-btn
          class="sd-modern-icon-button"
          icon
          variant="text"
          :disabled="completionBusy"
          :aria-label="$t('global.actions.close')"
          @click="finish()"
        >
          <b-product-edit-info-icon name="X" :size="18" />
          <v-tooltip
            activator="parent"
            location="top"
            content-class="sd-modern-tooltip"
            >{{ $t("global.actions.close") }}</v-tooltip
          >
        </v-btn>
      </header>

      <v-form
        v-if="!product"
        ref="form"
        :disabled="busy_add"
        @submit.prevent="addProduct(false)"
      >
        <div class="b-product-add-studio__body">
          <!-- Type and essentials share the existing creation request. -->
          <section class="sd-modern-widget b-product-add-studio__essentials">
            <h3>{{ $t("global.commons.product_type") }}</h3>
            <b-product-edit-type
              :shop="shop"
              modern
              compact
              :selected-type="type?.code"
              :disabled="busy_add"
              has-add-connect-os
              has-add-dropshipping
              has-add-sku
              @select="setType"
            />
            <p v-if="type" class="b-product-add-studio__type-help">
              {{ $t(type.description) }}
            </p>
            <v-text-field
              v-model="title"
              :counter="120"
              maxlength="120"
              :label="$t('add_product.edit_info.product_name')"
              :placeholder="
                $t('add_product.edit_info.product_name_placeholder')
              "
              :rules="[GlobalRules.required(), GlobalRules.counter(120)]"
              class="sd-modern-underlined-field b-product-add-studio__name"
              variant="underlined"
            />
            <div
              class="b-product-add-studio__price-grid"
              :class="{ '-with-stock': hasQuantity }"
            >
              <u-price-input
                v-model="price"
                :currency="currency"
                :disabled="busy_add || !currency"
                :label="$t('add_product.pricing.price_input')"
                :dark="$vuetify.theme.current.dark"
                class="sd-modern-underlined-field"
                placeholder="0.00"
              />
              <u-currency-input
                v-model="currency"
                :active-currencies="shop.currencies"
                :disabled="busy_add"
                :label="$t('add_product.pricing.currency_input')"
                :dark="$vuetify.theme.current.dark"
                class="sd-modern-underlined-field"
              />
              <u-number-input
                v-if="hasQuantity"
                v-model="quantity"
                :disabled="busy_add"
                :label="$t('product_admin.inventory.variants.count_input')"
                :min="0"
                class="sd-modern-underlined-field"
              />
            </div>
            <details class="b-product-add-studio__optional">
              <summary>
                <b-product-edit-info-icon name="ChevronDown" :size="16" />{{
                  $t("product_studio.fast.optional_details")
                }}
              </summary>
              <v-text-field
                v-model="brand"
                :label="$t('add_product.edit_info.brand.label')"
                :placeholder="$t('add_product.edit_info.brand.placeholder')"
                variant="underlined"
                class="sd-modern-underlined-field"
              />
            </details>
            <p v-if="$route.query.dir" class="b-product-add-studio__context">
              <b-product-edit-info-icon name="Folder" :size="14" />{{
                $t("product_studio.add_in_current_category")
              }}
            </p>
          </section>

          <!-- Marketplace ownership keeps its native vendor-panel restrictions. -->
          <div
            v-if="is_marketplace"
            class="sd-modern-widget b-product-add-studio__marketplace"
          >
            <u-widget-header
              :title="$t('global.commons.vendor')"
              icon="storefront"
            ></u-widget-header>

            <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂ Vendor panel > Fixed mode ▂▂▂▂▂▂▂▂▂▂▂▂▂ -->

            <template v-if="vendor">
              <v-list-subheader>
                <div
                  v-html="
                    $t(
                      'add_product.edit_info.marketplace.vendor_panel_message',
                      {
                        vendor_name: vendor.name,
                      },
                    )
                  "
                ></div>
              </v-list-subheader>

              <v-list-item :prepend-avatar="getShopImagePath(vendor.icon, 64)">
                <v-list-item-title class="font-weight-bold"
                  >{{ vendor.name }}
                </v-list-item-title>
                <v-list-item-subtitle
                  >{{ vendor.description }}
                </v-list-item-subtitle>
              </v-list-item>
            </template>

            <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂ Marketplace panel > Subscription products ▂▂▂▂▂▂▂▂▂▂▂▂▂ -->

            <template v-else-if="isSubscription">
              <v-list-subheader>
                <div>
                  <img
                    :src="ProductType.SUBSCRIPTION.image"
                    class="me-1"
                    height="20"
                    width="20"
                  />
                  {{
                    $t("add_product.edit_info.marketplace.subscription_message")
                  }}
                </div>
              </v-list-subheader>

              <b-vendor-input
                v-model="selected_vendor_id"
                :disabled="!!vendor || busy_add"
                :shop="shop"
                flat
                :label="$t('global.commons.vendor')"
                solo
                clearable
              ></b-vendor-input>
            </template>

            <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂ Marketplace panel > Normal products ▂▂▂▂▂▂▂▂▂▂▂▂▂ -->
            <template v-else>
              <v-list-subheader>
                {{ $t("add_product.edit_info.marketplace.default_message") }}
              </v-list-subheader>

              <u-smart-switch
                v-model="single_vendor"
                :false-description="
                  $t('add_product.edit_info.marketplace.multi_vendors_desc')
                "
                :false-title="
                  $t('add_product.edit_info.marketplace.multi_vendors_title')
                "
                :true-description="
                  $t('add_product.edit_info.marketplace.single_vendor_desc')
                "
                :true-title="
                  $t('add_product.edit_info.marketplace.single_vendor_title')
                "
                class="my-3"
                :class="{ 'sd-modern-smart-select': modern }"
                :border="modern || undefined"
                @change="selected_vendor_id = null"
              ></u-smart-switch>

              <v-expand-transition>
                <div v-if="single_vendor">
                  <b-vendor-input
                    v-model="selected_vendor_id"
                    :disabled="!!vendor || busy_add"
                    :shop="shop"
                    class="mt-5"
                    flat
                    :label="$t('global.commons.vendor')"
                    solo
                    clearable
                    @change="$forceUpdate()"
                  ></b-vendor-input>
                </div>
              </v-expand-transition>
            </template>
          </div>

          <p
            v-if="create_error"
            role="alert"
            class="b-product-add-studio__error"
          >
            {{ create_error }}
          </p>
        </div>
        <div class="b-product-add-studio__actions">
          <v-btn
            type="submit"
            color="primary"
            variant="elevated"
            class="sd-modern-button sd-modern-button--primary"
            :disabled="!can_add || busy_add"
            :loading="busy_add && !complete_after_add"
          >
            <template #prepend
              ><b-product-edit-info-icon name="Plus" :size="16" /></template
            >{{ $t("product_studio.fast.add_finish") }}
          </v-btn>
          <v-tooltip
            location="top"
            content-class="sd-modern-tooltip text-start"
          >
            <template #activator="{ props }">
              <span
                v-bind="props"
                class="b-product-add-studio__complete"
                @focusin="props.onFocus"
                @focusout="props.onBlur"
              >
                <v-btn
                  type="button"
                  variant="outlined"
                  class="sd-modern-button"
                  :aria-describedby="props['aria-describedby']"
                  :disabled="!can_add || busy_add"
                  :loading="busy_add && complete_after_add"
                  @click="addProduct(true)"
                >
                  {{ $t("product_studio.fast.add_complete") }}
                  <template #append
                    ><b-product-edit-info-icon
                      :name="$vuetify.locale.isRtl ? 'ArrowLeft' : 'ArrowRight'"
                      :size="16"
                  /></template>
                </v-btn>
              </span>
            </template>
            {{ $t("product_studio.fast.add_images_help") }}
          </v-tooltip>
        </div>
      </v-form>

      <template v-else>
        <div class="b-product-add-studio__body">
          <p class="b-product-add-studio__saved" role="status">
            {{ $t("product_studio.fast.saved_notice") }}
          </p>
          <div
            class="b-product-add-studio__completion-nav"
            role="group"
            :aria-label="$t('product_studio.fast.completion_title')"
          >
            <v-btn
              variant="text"
              class="sd-modern-button"
              :class="{ '-selected': tab_product === 2 }"
              :aria-pressed="tab_product === 2"
              :disabled="completionBusy"
              @click="selectCompletion(2)"
              ><template #prepend
                ><b-product-edit-info-icon name="Image" :size="16" /></template
              >{{ $t("product_studio.fast.images") }}</v-btn
            >
            <v-btn
              variant="text"
              class="sd-modern-button"
              :class="{ '-selected': tab_product === 3 }"
              :aria-pressed="tab_product === 3"
              :disabled="completionBusy"
              @click="selectCompletion(3)"
              ><template #prepend
                ><b-product-edit-info-icon
                  :name="detailIcon"
                  :size="16" /></template
              >{{ $t(detailTitle) }}</v-btn
            >
          </div>
          <!-- Mount on first visit; retain native drafts when switching sections. -->
          <div v-if="visitedImages" v-show="tab_product === 2">
            <b-product-edit-images
              :ref="(editor) => (imagesEditor = editor)"
              :product="product"
              :modern="modern"
              for-studio
            />
          </div>
          <div v-if="visitedDetails" v-show="tab_product === 3">
            <b-product-inventory-management
              :ref="(editor) => (inventoryEditor = editor)"
              :product="product"
              :shop="shop"
              :vendor="vendor"
              :modern="modern"
              :product-workspace="modern"
              for-studio
            />
          </div>
        </div>
        <div class="b-product-add-studio__actions">
          <v-btn
            color="primary"
            variant="elevated"
            class="sd-modern-button sd-modern-button--primary"
            :disabled="completionBusy"
            @click="finish()"
            ><template #prepend
              ><b-product-edit-info-icon name="Check" :size="16" /></template
            >{{ $t("global.actions.finish") }}</v-btn
          >
          <v-btn
            variant="text"
            class="sd-modern-button"
            :disabled="completionBusy"
            @click="startNextProduct()"
            >{{ $t("product_studio.fast.add_another") }}</v-btn
          >
        </div>
      </template>
    </div>
  </v-sheet>
</template>
<script lang="ts">
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import { defineAsyncComponent } from "vue";
import { ProductCondition } from "@selldone/core-js/enums/product/ProductCondition";
import UNumberInput from "../../../../ui/number/input/UNumberInput.vue";
import UPriceInput from "../../../../ui/price/input/UPriceInput.vue";
import UCurrencyInput from "../../../../ui/currency/input/UCurrencyInput.vue";
import BProductEditInfoIcon from "../../edit/info/BProductEditInfoIcon.vue";
import { ShopOptionsHelper } from "@selldone/core-js/helper/shop/ShopOptionsHelper";
import BVendorInput from "../../../vendor/input/BVendorInput.vue";
import { BusinessModel } from "@selldone/core-js/enums/shop/BusinessModel";
import USmartSwitch from "../../../../ui/smart/switch/USmartSwitch.vue";
import BProductEditType from "../../../product/edit/type/BProductEditType.vue";
import ScrollHelper from "@selldone/core-js/utils/scroll/ScrollHelper.ts";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BProductAddStudio",
  mixins: [],
  components: {
    BProductEditInfoIcon,
    BProductEditType,
    USmartSwitch,
    BVendorInput,
    BProductEditImages: defineAsyncComponent(
      () => import("../../edit/images/BProductEditImages.vue"),
    ),
    UCurrencyInput,
    UPriceInput,
    UNumberInput,

    BProductInventoryManagement: defineAsyncComponent(
      () =>
        import("../../inventory/management/BProductInventoryManagement.vue"),
    ),
  },
  emits: ["add", "finish", "busy"],
  props: {
    modern: { type: Boolean, default: false },
    shop: {
      required: true,
    },

    vendor: {
      /*🟢 Vendor Panel 🟢*/ required: false,
    },
  },

  data: function () {
    return {
      ProductType: ProductType,

      //-------- Product ----------
      tab_product: 1,
      type: null,
      title: null,
      brand: null,
      price: 0,
      currency: null,
      quantity: 0,

      product: null,
      visitedImages: false,
      visitedDetails: false,
      imagesEditor: null,
      inventoryEditor: null,
      complete_after_add: false,
      create_error: "",
      disposed: false,

      selected_vendor_id: null,
      //---------------------------
      busy_add: false,

      //-----------------------------
      single_vendor: false,
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

    can_add() {
      return !!(
        this.available_types.some(
          (item) => item.enable && item.code === this.type?.code,
        ) &&
        this.title?.trim() &&
        this.title.length <= 120 &&
        this.price !== null &&
        this.price !== "" &&
        Number.isFinite(Number(this.price)) &&
        this.price >= 0 &&
        this.shop.currencies.includes(this.currency) &&
        (!this.hasQuantity ||
          (Number.isFinite(Number(this.quantity)) && this.quantity >= 0)) &&
        (!this.is_marketplace ||
          !this.isSubscription ||
          this.selected_vendor_id)
      );
    },
    hasQuantity() {
      return (
        this.type?.code === ProductType.PHYSICAL.code ||
        this.type?.code === ProductType.SERVICE.code
      );
    },
    detailTitle() {
      const kind = {
        PHYSICAL: "physical",
        VIRTUAL: "virtual",
        FILE: "file",
        SERVICE: "service",
        SUBSCRIPTION: "subscription",
      }[this.type?.code];
      return "product_studio.fast." + kind + "_details";
    },
    detailIcon() {
      return {
        PHYSICAL: "PackageOpen",
        VIRTUAL: "Globe",
        FILE: "Files",
        SERVICE: "ClipboardCheck",
        SUBSCRIPTION: "RotateCcw",
      }[this.type?.code];
    },
    completionBusy() {
      return (
        this.busy_add ||
        !!this.imagesEditor?.mediaBusy ||
        !!this.imagesEditor?.saveBlocked ||
        !!this.inventoryEditor?.workspaceBusy ||
        !!this.inventoryEditor?.saveBlocked
      );
    },

    isFile() {
      return this.type?.code === ProductType.FILE.code;
    },
    isVirtual() {
      return this.type?.code === ProductType.VIRTUAL.code;
    },
    isSubscription() {
      return this.type?.code === ProductType.SUBSCRIPTION.code;
    },
    is_marketplace() {
      return this.shop.model === BusinessModel.MARKETPLACE.code;
    },
  },
  watch: {
    completionBusy: {
      immediate: true,
      handler(busy) {
        this.$emit("busy", busy);
      },
    },
    type(type) {
      window.sessionStorage.setItem(
        "temp-studio-type",
        type ? type.code : null,
      );
    },
    currency(currency) {
      window.sessionStorage.setItem("temp-studio-currency", currency);
    },
  },
  created() {
    const savedCurrency = window.sessionStorage.getItem("temp-studio-currency");
    this.currency = this.shop.currencies.includes(savedCurrency)
      ? savedCurrency
      : this.shop.currencies[0] || null;

    // Assign vendor (used in subscription products)
    this.selected_vendor_id = this.vendor?.id;
  },

  beforeUnmount() {
    this.disposed = true;
    this.$emit("busy", false);
  },
  methods: {
    setType(type) {
      if (
        this.busy_add ||
        this.product ||
        !this.available_types.some(
          (item) => item.enable && item.code === type?.code,
        )
      )
        return;
      this.type = type;
    },
    selectCompletion(tab) {
      if (!this.product || this.completionBusy || ![2, 3].includes(tab)) return;
      this.tab_product = tab;
      if (tab === 2) this.visitedImages = true;
      else this.visitedDetails = true;
    },
    startNextProduct() {
      if (this.completionBusy) return;
      this.product = null;
      this.type = null;
      this.title = null;
      this.brand = null;
      this.price = 0;
      this.quantity = 0;
      this.tab_product = 1;
      this.visitedImages = false;
      this.visitedDetails = false;
      this.create_error = "";
      this.single_vendor = false;
      this.selected_vendor_id = this.vendor?.id || null;
    },
    async addProduct(complete = false) {
      if (this.busy_add || this.product || !this.can_add || this.disposed)
        return;
      this.busy_add = true;
      this.complete_after_add = complete;
      this.create_error = "";
      try {
        const validation = await this.$refs.form?.validate();
        if (validation?.valid === false || this.disposed || !this.can_add)
          return;
        const { data } = await axios.post(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.POST_MY_VENDOR_ADD_PRODUCT(this.vendor.id)
            : window.API.POST_ADD_PRODUCT(this.shop.id),

          {
            // For marketplace: Vendor owner
            vendor_id: this.selected_vendor_id,

            type: this.type.code,

            title: this.title.trim(),
            condition: ProductCondition.NEW.code,

            price: this.price,
            currency: this.currency,

            commission: 0,
            discount: 0,

            status: "Open",

            category_id: this.$route.query.dir,

            lead: 0,

            style: null,

            brand: this.brand,
            warranty: null,
            original: true,
            return_warranty: null,

            video: null,

            quantity: this.isSubscription
              ? 1 /*Subscription default available!*/
              : this.quantity,
          },
        );
        if (this.disposed) return;
        if (data.error || !data.product) {
          this.create_error =
            data.error_msg || this.$t("product_studio.fast.create_error");
          NotificationService.showErrorAlert(null, this.create_error);
          return;
        }
        this.product = data.product;
        this.$emit("add", data.product);
        if (complete) {
          this.tab_product = 2;
          this.visitedImages = true;
          this.GoToTopPage();
        } else {
          this.busy_add = false;
          this.finish();
        }
      } catch (error) {
        if (this.disposed) return;
        this.create_error = this.$t("product_studio.fast.create_error");
        NotificationService.showLaravelError(error);
      } finally {
        this.busy_add = false;
      }
    },

    finish() {
      if (!this.completionBusy) this.$emit("finish");
    },

    //―――――――――――――――――――――― Page Scroll Helper ――――――――――――――――――――
    GoToTopPage() {
      this.$nextTick(() => {
        this.$nextTick(() => {
          ScrollHelper.scrollToTop(0, "smooth");
        });
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.b-product-add-studio {
  font-family: inherit;
  font-size: 13px;
  line-height: 1.6;
  padding: 0;
  .b-product-add-studio__workspace {
    max-width: 760px;
    margin-inline: auto;
  }
  .b-product-add-studio__header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 24px;
  }
  .b-product-add-studio__header > svg {
    flex-shrink: 0;
    color: var(--sd-modern-muted);
  }
  .b-product-add-studio__heading {
    flex: 1;
    min-width: 0;
    overflow-wrap: anywhere;
  }
  h2 {
    font: inherit;
    font-size: 19px;
    font-weight: 500;
    margin: 0;
  }
  .b-product-add-studio__heading p {
    color: var(--sd-modern-muted);
    font-size: 12px;
    margin: 3px 0 0;
  }
  .b-product-add-studio__body {
    padding: 0 24px 20px;
  }
  .sd-modern-widget {
    --background: rgb(var(--v-theme-surface));
    padding: 22px;
    margin: 0;
  }
  .b-product-add-studio__essentials > h3 {
    font: inherit;
    font-weight: 500;
    margin: 0 0 10px;
  }
  .b-product-add-studio__type-help {
    color: var(--sd-modern-muted);
    font-size: 12px;
    margin: 12px 0 0;
  }
  .b-product-add-studio__name {
    margin-top: 20px;
  }
  .b-product-add-studio__price-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
    margin-top: 12px;
  }
  .b-product-add-studio__price-grid.-with-stock {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .b-product-add-studio__optional {
    margin-top: 16px;
  }
  .b-product-add-studio__optional summary {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 36px;
    color: var(--sd-modern-muted);
    list-style: none;
    cursor: pointer;
  }
  .b-product-add-studio__optional summary::-webkit-details-marker {
    display: none;
  }
  .b-product-add-studio__optional[open] summary > svg {
    transform: rotate(180deg);
  }
  .b-product-add-studio__optional :deep(.v-input) {
    margin-top: 10px;
  }
  .b-product-add-studio__context {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 12px 0 0;
    color: var(--sd-modern-muted);
    font-size: 12px;
  }
  .b-product-add-studio__marketplace {
    margin-top: 16px;
  }
  .b-product-add-studio__marketplace > :deep(.s--widget-header h2) {
    font-size: 16px;
    font-weight: 500;
  }
  .b-product-add-studio__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    padding: 18px 24px;
    background: var(--sd-modern-canvas-color);
    border-top: 1px solid var(--sd-modern-border);
  }
  .b-product-add-studio__actions > .v-btn {
    max-width: 100%;
  }
  .b-product-add-studio__complete {
    display: inline-flex;
    max-width: 100%;
  }
  .b-product-add-studio__saved {
    color: var(--sd-modern-muted);
    font-size: 12px;
    margin: 0 0 16px;
  }
  .b-product-add-studio__completion-nav {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 18px;
  }
  .b-product-add-studio__completion-nav .-selected {
    background: rgb(var(--v-theme-surface));
    box-shadow: 0 1px 5px rgba(var(--v-theme-on-surface), 0.08);
  }
  .b-product-add-studio__error {
    color: rgb(var(--v-theme-error));
    margin: 14px 0 0;
  }
  @media (max-width: 599px) {
    .b-product-add-studio__header {
      padding: 20px 16px;
    }
    .b-product-add-studio__body {
      padding: 0 16px 18px;
    }
    .sd-modern-widget {
      padding: 18px 16px;
    }
    .b-product-add-studio__price-grid,
    .b-product-add-studio__price-grid.-with-stock {
      grid-template-columns: 1fr;
      gap: 10px;
    }
    .b-product-add-studio__actions {
      padding: 16px;
    }
  }
  @media (max-width: 599px), (pointer: coarse) {
    .b-product-add-studio__optional summary {
      min-height: 44px;
    }
    :deep(input) {
      font-size: 16px;
    }
  }
}
</style>
