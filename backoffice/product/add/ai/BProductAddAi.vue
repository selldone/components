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
  <v-sheet
    :dark="modern ? false : dark !== 'upload'"
    color="transparent"
    :class="modern ? 'b-product-add-ai--modern sd-modern-canvas text-start' : 'text-center'"
  >
    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Drop Image ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <v-expand-transition>
      <div v-if="step === 'upload'">
        <u-loading-progress v-if="uploading"></u-loading-progress>

        <div class="max-widget-width mx-auto" :class="{ 'sd-modern-widget sd-modern-form': modern }">
          <u-widget-header :title="modern ? $t('products_select.modern.ai.write_about_product') : 'Write about product'" icon="looks_one" :class="{ 'sd-modern-form-header': modern }">
          </u-widget-header>
          <v-text-field
            v-model="title"
            class="strong-field"
            :label="modern ? $t('products_select.modern.ai.product_name_optional') : 'Name of product? (optional)'"
            persistent-placeholder
            :placeholder="modern ? $t('products_select.modern.ai.product_name_placeholder') : 'Model name, product tile or ...'"
            variant="underlined"
          ></v-text-field>

          <u-widget-header :title="modern ? $t('products_select.modern.ai.select_product_image') : &quot;Select product's image&quot;" icon="looks_two" :class="{ 'sd-modern-form-header': modern }">
          </u-widget-header>

          <div class="position-relative">
            <s-image-uploader
              :allow-multiple="false"
              :dark="false"
              :headers="{ 'category-id': category?.id, prompt: title }"
              :placeholder-image="
                require('../../../product/add/ai/assets/upload.svg')
              "
              :server="
                demo
                  ? window.GAPI.POST_DEMO_AI_ADD_PRODUCT()
                  : window.API.POST_AI_ADD_PRODUCT(shop.id)
              "
              max-file-size="4MB"
              min-height="320px"
              no-svg
              @onAddFile="onAddFile"
              @onError="uploading = false"
              @onProcessFileAbort="onAbortUpload"
              @onProcessFileStart="onStartUpload"
              @response="handleAiUploadImage"
            ></s-image-uploader>
            <u-lottie
              v-if="uploading"
              :options="{
                path: '/animation/animation-scan.json',
                loop: true,
              }"
              :speed="1"
              class="center-absolute pen"
              height="80%"
              style="z-index: 10"
              width="80%"
            />
          </div>
          <div>
            <img
              class="my-2"
              height="84"
              src="./assets/arrow-circle.svg"
              width="84"
            />
            <div
              :class="modern ? 'b-product-add-ai__guidance' : 'typo-body text-white fadeIn delay_300 max-widget-width mx-auto py-2'"
            >
              {{ modern ? $t('products_select.modern.ai.image_guidance') : 'You just need to take a photo or drag and drop an image here!' }}
            </div>
            <div
              v-if="!demo"
              class="max-widget-width mx-auto py-2 text-start text-subtitle-2"
            >
              <v-icon class="me-1" size="small">auto_awesome</v-icon>
              <template v-if="modern">{{ $t('products_select.modern.ai.tokens_guidance') }}</template>
              <template v-else>Currently, free users receive 10 tokens daily, while premium users
              get 100 tokens. To get more tokens, you can upgrade your user to
              premium.</template>
            </div>
          </div>

          <v-alert
            v-if="!is_premium && !demo"
            class="my-5 text-start"
            :class="{ 'sd-modern-notice': modern }"
            variant="outlined"
          >
            <v-row align="center" no-gutters>
              <div>
                <template v-if="modern">{{ $t('products_select.modern.ai.premium_guidance') }}</template>
                <template v-else>Upgrade to <b>✨Premium User</b> and enjoy additional free
                background removal tokens.</template>
              </div>
              <v-spacer></v-spacer>
              <v-btn
                class="ma-1 tnt"
                :color="modern ? 'primary' : '#fff'"
                :class="{ 'sd-modern-button sd-modern-button--compact': modern }"
                size="small"
                variant="flat"
                @click="showNeedSubscribePremium()"
                >{{ modern ? $t('products_select.modern.ai.view_plan') : 'View Plan' }}
              </v-btn>
            </v-row>
          </v-alert>
        </div>
      </div>
    </v-expand-transition>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Change Price & Quantity ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <v-expand-transition>
      <div v-if="step === 'edit'">
        <v-sheet
          :style="{ '--background': modern ? 'rgb(var(--v-theme-surface))' : '#344695' }"
          class="widget-box mb-5"
          :class="{ 'sd-modern-widget sd-modern-form': modern }"
          :color="modern ? undefined : '#344695'"
          :theme="modern ? undefined : 'dark'"
        >
          <u-widget-header
            :href="ShopURLs.GetProductLink(shop, product.id, product.slug)"
            :add-caption="modern ? $t('products_select.modern.ai.view_product') : 'View Product'"
            add-icon="open_in_new"
            add-text
            :button-color="modern ? 'primary' : '#FFEB3B'"
            icon="warehouse"
            target="_blank"
            :title="modern ? $t('products_select.modern.ai.type_inventory') : 'Type & Inventory'"
            :class="{ 'sd-modern-form-header': modern }"
          ></u-widget-header>
          <v-list-subheader
            ><template v-if="modern">{{ $t('products_select.modern.ai.type_inventory_guidance') }}</template>
            <template v-else>Here you can change the product type and quantity for the product
            you've added.</template>
          </v-list-subheader>

          <div class="position-relative">
            <vue-compare-image
              :left-image="getShopImagePath(product.icon)"
              :right-image="raw_selected_image"
              class="rounded-lg mb-3"
              left-image-class="bg-tiny-checkers"
              max-height="420px"
              @loaded:left="show_thumbnails = true"
            >
            </vue-compare-image>
            <template v-if="show_thumbnails">
              <v-img
                :src="getShopImagePath(product.icon)"
                class="pen rounded-lg position-absolute bg-amber-soft border zoomIn delay_300"
                height="64"
                style="left: 4px; top: 10px"
                width="64"
              ></v-img>
              <v-img
                :src="getShopImagePath(product.icon)"
                class="pen rounded-lg position-absolute bg-lily-meadow border zoomIn delay_400"
                height="64"
                style="left: 4px; top: 90px"
                width="64"
              ></v-img>
              <v-img
                :src="getShopImagePath(product.icon)"
                class="pen rounded-lg position-absolute bg-malibu-beach border zoomIn delay_500"
                height="64"
                style="left: 4px; top: 170px"
                width="64"
              ></v-img>
              <v-img
                :src="getShopImagePath(product.icon)"
                class="pen rounded-lg position-absolute bg-blacker zoomIn border delay_600"
                height="64"
                style="left: 4px; top: 250px"
                width="64"
              ></v-img>
            </template>
          </div>

          <u-smart-select
            v-model="type"
            :dark="modern ? false : dark"
            :class="{ 'sd-modern-smart-select': modern }"
            :border="modern || undefined"
            :items="types"
            class="my-3"
            item-description="description"
            item-image="image"
            item-text="name"
            item-value="code"
          ></u-smart-select>

          <v-text-field
            v-model="title"
            :label="$t('global.commons.title')"
            variant="underlined"
          ></v-text-field>

          <u-number-input
            v-model="quantity"
            :label="$t('product_admin.inventory.variants.count_input')"
            :min="0"
            append-icon="inventory"
            class="strong-field mt-5"
          >
          </u-number-input>
        </v-sheet>

        <v-sheet
          :style="{ '--background': modern ? 'rgb(var(--v-theme-surface))' : '#344695' }"
          class="widget-box mb-5"
          :class="{ 'sd-modern-widget sd-modern-form': modern }"
          :color="modern ? undefined : '#344695'"
          :theme="modern ? undefined : 'dark'"
        >
          <u-widget-header
            icon="price_change"
            :title="modern ? $t('global.commons.price') : 'Pricing'"
            :class="{ 'sd-modern-form-header': modern }"
          ></u-widget-header>
          <v-list-subheader
            ><template v-if="modern">{{ $t('products_select.modern.ai.pricing_guidance') }}</template>
            <template v-else>Here you can specify the price and discount for the product you've
            added.</template>
          </v-list-subheader>

          <u-currency-input
            v-model="currency"
            :activeCurrencies="shop.currencies"
            :label="$t('add_product.pricing.currency_input')"
            :messages="$t('add_product.pricing.currency_input_messages')"
            :return-object="false"
            class="sm-suffix price-input"
          />

          <u-price-input
            v-model="price"
            :currency="currency"
            :label="$t('add_product.pricing.price_input')"
            class="strong-field"
            :dark="!modern"
            required
          ></u-price-input>

          <u-price-input
            v-model="discount"
            :currency="currency"
            :label="$t('add_product.pricing.discount_input')"
            :messages="`${$t(
              'add_product.pricing.discount_input_message',
            )}: ${discount_percent}%`"
            :dark="!modern"
            required
          ></u-price-input>
        </v-sheet>

        <div v-if="!demo" class="widget-buttons">
          <v-btn
            :disabled="!type"
            :loading="busy_edit"
            :color="modern ? 'primary' : '#FFF'"
            :size="modern ? 'default' : 'x-large'"
            :class="{ 'sd-modern-button sd-modern-button--primary': modern }"
            @click="saveProduct()"
          >
            <v-icon start>save</v-icon>
            {{ $t("global.actions.save") }}
          </v-btn>
        </div>
        <div v-else class="widget-buttons">
          <v-btn
            :to="{ name: USER() ? 'BPageShuttleShops' : 'OnboardingPage' }"
            class="tnt mt-5"
            rounded="lg"
            color="#fff"
            height="unset"
            max-height="auto"
            min-height="64"
            size="large"
            prepend-icon="add_box"
          >
            <div class="d-flex flex-column p-2 text-subtitle-2">
              <span class="">{{ $t("home.create_shopping_website") }}</span>
              <b class="mt-1">{{ $t("home.start_now_btn") }}</b>
            </div>
            <v-icon end>{{ $t("icons.chevron_next") }}</v-icon>
          </v-btn>
        </div>
      </div>
    </v-expand-transition>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Finish ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <v-expand-transition>
      <div v-if="step === 'finish'">
        <v-sheet
          :style="{ '--background': modern ? 'rgb(var(--v-theme-surface))' : '#344695' }"
          class="widget-box mb-5"
          :class="{ 'sd-modern-widget sd-modern-form': modern }"
          :color="modern ? undefined : '#344695'"
          :theme="modern ? undefined : 'dark'"
        >
          <u-widget-header icon="done_all" :title="modern ? $t('global.actions.finish') : 'Finish'" :class="{ 'sd-modern-form-header': modern }"></u-widget-header>
          <v-list-subheader
            ><template v-if="modern">{{ $t('products_select.modern.ai.finish_guidance') }}</template>
            <template v-else>Congratulations, your product has been successfully added to your
            store and is now in the current folder.</template>
          </v-list-subheader>
          <div class="widget-buttons">
            <v-btn
              :to="{
                name: IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
                  ? 'Vendor_ProductDashboard'
                  : 'BPageProductDashboard',
                params: { product_id: product.id },
              }"
              class="single-line"
              :color="modern ? undefined : '#FFF'"
              :size="modern ? 'default' : 'x-large'"
              :class="{ 'sd-modern-button': modern }"
              variant="outlined"
            >
              <v-avatar class="avatar-gradient -thin -current mx-2" size="32">
                <img :src="getShopImagePath(product.icon, 96)" />
              </v-avatar>

              <div class="flex-grow-1" style="max-width: calc(100% - 64px)">
                <div class="mb-1">{{ modern ? $t('products_select.modern.ai.open_product', { title }) : 'Open ' + title }}</div>
                <div class="small">
                  {{ modern ? $t('global.commons.inventory') : 'Inventory' }}: {{ product.quantity }} | {{ modern ? $t('global.commons.price') : 'Price' }}:
                  <u-price
                    :amount="product.price"
                    :currency="product.currency"
                  ></u-price>
                </div>
              </div>

              <v-icon class="ms-1">{{ $t("icons.chevron_next") }}</v-icon>
            </v-btn>
          </div>

          <div class="widget-buttons">
            <v-btn
              :color="modern ? 'primary' : '#FFF'"
              :size="modern ? 'default' : 'x-large'"
              :class="{ 'sd-modern-button sd-modern-button--primary': modern }"
              variant="elevated"
              @click="reset()"
            >
              <v-icon class="me-1">add_box</v-icon>
              {{ modern ? $t('add_product.title_new') : 'Add New Product' }}
            </v-btn>
          </div>
        </v-sheet>
      </div>
    </v-expand-transition>

  </v-sheet>
</template>

<script lang="ts">
import SImageUploader from "../../../../ui/uploader/SImageUploader.vue";
import UPriceInput from "../../../../ui/price/input/UPriceInput.vue";
import UCurrencyInput from "../../../../ui/currency/input/UCurrencyInput.vue";
import { PriceHelper } from "@selldone/core-js/helper/price/PriceHelper";
import UNumberInput from "../../../../ui/number/input/UNumberInput.vue";
import { SetupService } from "@selldone/core-js/server/SetupService";
import USmartSelect from "../../../../ui/smart/select/USmartSelect.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import VueCompareImage from "../../../../ui/image-compare/VueCompareImage.vue";
import UWidgetHeader from "@selldone/components-vue/ui/widget/header/UWidgetHeader.vue";
import ULottie from "@selldone/components-vue/ui/lottie/ULottie.vue";
import { BEventBusMixin } from "../../../../utils/events/BEventBusMixin.ts";
import { Product } from "@selldone/core-js/models";
import {ShopURLs} from "@selldone/core-js/helper";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BProductAddAi",
  mixins: [BEventBusMixin ],
  components: {
    ULottie,
    UWidgetHeader,
    VueCompareImage,
    USmartSelect,
    UNumberInput,
    UCurrencyInput,
    UPriceInput,
    SImageUploader,
  },
  emits: ["product-add", "product-updated"],
  props: {
    modern: { type: Boolean, default: false },
    shop: {
      required: true,
    },
    demo: Boolean,
    vendor: {
      /*🟢 Vendor Panel 🟢*/ required: false,
    },
    category: {},
    dark: {
      default: false,
      type: Boolean,
    },
  },

  data: () => ({
    Product: Product,

    types: Object.values(ProductType),
    step: "upload",
    product: null,
    busy_edit: false,

    type: null,
    currency: SetupService.DefaultCurrency(),
    price: 0,
    discount: 0,
    quantity: 0,
    title: "",
    raw_selected_image: null,

    show_thumbnails: false,

    uploading: false,
  }),

  computed: {
    ShopURLs() {
      return ShopURLs
    },
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    discount_percent() {
      try {
        return PriceHelper.discountProductPercent(
          this.shop,
          {
            price: this.price,
            currency: this.currency,
            commission: this.commission,
            discount: this.discount,
          },
          null,
        );
      } catch (e) {
        console.error("Discount", e);
        return "🚨";
      }
    },
    is_premium() {
      return !!this.USER()?.premium;
    },
  },

  watch: {},

  created() {},

  mounted() {
    // Force load lottie plugin & animation json!
    this.uploading = true;
    this.$nextTick(() => {
      this.uploading = false;
    });
  },

  beforeUnmount() {},
  methods: {
    handleAiUploadImage(response) {
      this.uploading = false;

      if (response.error) {
        NotificationService.showErrorAlert(null, response.error_msg);
        return;
      }
      NotificationService.showSuccessAlert("Create Product", "Product created successfully!");

      const file = response.files;
      const product = response.product;
      this.product = product;

      // console.log("response", response);

      this.type = this.product.type;

      this.currency = this.product.currency;
      this.price = this.product.price;
      this.discount = this.product.discount;
      this.quantity = this.product.quantity;
      this.title = this.product.title;

      this.step = "edit";
      this.$emit("product-add", product);
    },

    saveProduct() {
      this.busy_edit = true;

      axios
        .post(
          window.API.POST_AI_EDIT_PRODUCT(
            this.$route.params.shop_id,
            this.product.id,
          ),
          {
            type: this.type,
            currency: this.currency,
            price: this.price,
            discount: this.discount,
            quantity: this.quantity,
            category_id: this.category?.id,
            title: this.title,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            NotificationService.showSuccessAlert(
              "Update Product",
              "Product updated successfully!",
            );
            this.step = "finish";
            this.$emit("product-updated", data.product);
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_edit = false;
        });
    },
    reset() {
      this.resetToDefault();
    },
    onAddFile({ error, file }) {
      this.uploading = true;
      //console.log("onAddFile", file);
      // Create a URL for the file
      this.raw_selected_image = URL.createObjectURL(file.file);
    },

    onStartUpload(file) {
      this.uploading = true;
      //console.log("onStartUpload", file);
    },
    onAbortUpload(file) {
      this.uploading = false;

      //console.log("onAbortUpload", file);
    },
  },
};
</script>

<style lang="scss" scoped>
.b-product-add-ai--modern {
  padding: 24px;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.6;
  .sd-modern-widget { --background: rgb(var(--v-theme-surface)); padding: 24px; margin-inline: auto; }
  .b-product-add-ai__guidance { margin-block: 10px; font-size: 12px; line-height: 19px; color: var(--sd-modern-muted); }
  .v-list-subheader { font-size: 12px; line-height: 19px; color: var(--sd-modern-muted); }
  .sd-modern-notice { background: var(--sd-modern-inset); border: 0; color: rgb(var(--v-theme-on-surface)); }
  .widget-buttons { display: flex; justify-content: flex-end; gap: 8px; flex-wrap: wrap; max-width: 760px; margin-inline: auto; }
  .sd-modern-form-header { margin-block: 14px; }
  .sd-modern-form-header:first-child { margin-block-start: 0; }

  @media (max-width: 599px) {
    padding: 20px 12px;
    .sd-modern-widget { padding: 20px 16px; }
  }
}
</style>
