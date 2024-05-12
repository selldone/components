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
  <v-sheet :dark="dark !== 'upload'" color="transparent">
    <v-alert
      class="max-widget-width mx-auto mb-5 text-start"
      closable
      variant="outlined"
    >
      <v-row align="center" no-gutters>
        <div>Discover how it works.</div>
        <v-spacer></v-spacer>
        <v-btn
          class="ma-1 tnt"
          color="#fff"
          size="small"
          variant="flat"
          @click="dialog_video = true"
        >
          <v-icon class="me-1">smart_display</v-icon>
          Watch Now
        </v-btn>
      </v-row>
    </v-alert>

    <v-alert
      v-if="!is_premium"
      class="max-widget-width mx-auto mb-5 text-start"
      variant="outlined"
    >
      <v-row align="center" no-gutters>
        <div>
          Upgrade to <b>✨Premium User</b> and enjoy additional free background
          removal tokens.
        </div>
        <v-spacer></v-spacer>
        <v-btn
          class="ma-1 tnt"
          color="#fff"
          size="small"
          variant="flat"
          @click="showNeedSubscribePremium()"
          >View Plan
        </v-btn>
      </v-row>
    </v-alert>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Drop Image ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <v-expand-transition>
      <div v-if="step === 'upload'">
        <u-loading-progress v-if="uploading"></u-loading-progress>

        <v-text-field
          v-model="title"
          class="strong-field max-widget-width mx-auto"
          label="Name of product? (optional)"
          persistent-placeholder
          placeholder="Model name, product tile or ..."
          variant="underlined"
        ></v-text-field>

        <div class="position-relative">
          <s-image-uploader
            :allow-multiple="false"
            :dark="false"
            :headers="{ 'category-id': category?.id, prompt: title }"
            :placeholder-image="
              require('../../../product/add/ai/assets/upload.svg')
            "
            :server="window.API.POST_AI_ADD_PRODUCT(shop.id)"
            max-file-size="4MB"
            min-height="360px"
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
            class="typo-body text-white fadeIn delay_300 max-widget-width mx-auto py-2"
          >
            You just need to take a photo or drag and drop an image here!
          </div>
          <div class="max-widget-width mx-auto py-2 text-start">
            <v-icon class="me-1" size="small">auto_awesome</v-icon>
            Currently, free users receive 3 tokens daily, while premium users
            get 6 tokens. We plan to increase these limits in the future.
          </div>
        </div>
      </div>
    </v-expand-transition>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Change Price & Quantity ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <v-expand-transition>
      <div v-if="step === 'edit'">
        <v-sheet
          :style="{ '--background': '#344695' }"
          class="widget-box mb-5"
          color="#344695"
          theme="dark"
        >
          <s-widget-header
            :href="getProductLink(shop, product.id, product.slug)"
            add-caption="View Product"
            add-icon="open_in_new"
            add-text
            button-color="#FFEB3B"
            icon="warehouse"
            target="_blank"
            title="Type & Inventory"
          ></s-widget-header>
          <v-list-subheader
            >Here you can change the product type and quantity for the product
            you've added.
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
            :dark="dark"
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
          :style="{ '--background': '#344695' }"
          class="widget-box mb-5"
          color="#344695"
          theme="dark"
        >
          <s-widget-header
            icon="price_change"
            title="Pricing"
          ></s-widget-header>
          <v-list-subheader
            >Here you can specify the price and discount for the product you've
            added.
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
            required
            dark
          ></u-price-input>

          <u-price-input
            v-model="discount"
            :currency="currency"
            :label="$t('add_product.pricing.discount_input')"
            :messages="`${$t(
              'add_product.pricing.discount_input_message',
            )}: ${discount_percent}%`"
            required
            dark
          ></u-price-input>
        </v-sheet>

        <div class="widget-buttons">
          <v-btn
            :disabled="!type"
            :loading="busy_edit"
            color="#FFF"
            size="x-large"
            @click="saveProduct()"
          >
            <v-icon start>save</v-icon>
            {{ $t("global.actions.save") }}
          </v-btn>
        </div>
      </div>
    </v-expand-transition>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Finish ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <v-expand-transition>
      <div v-if="step === 'finish'">
        <v-sheet
          :style="{ '--background': '#344695' }"
          class="widget-box mb-5"
          color="#344695"
          theme="dark"
        >
          <s-widget-header icon="done_all" title="Finish"></s-widget-header>
          <v-list-subheader
            >Congratulations, your product has been successfully added to your
            store and is now in the current folder.
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
              color="#FFF"
              size="x-large"
              variant="outlined"
            >
              <v-avatar class="avatar-gradient -thin -current mx-2" size="32">
                <img :src="getShopImagePath(product.icon, 96)" />
              </v-avatar>

              <div class="flex-grow-1" style="max-width: calc(100% - 64px)">
                <div class="mb-1">Open {{ title }}</div>
                <div class="small">
                  Inventory: {{ product.quantity }} | Price:
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
              color="#FFF"
              size="x-large"
              variant="elevated"
              @click="reset()"
            >
              <v-icon class="me-1">add_box</v-icon>
              Add New Product
            </v-btn>
          </div>
        </v-sheet>
      </div>
    </v-expand-transition>

    <!-- █████████████████████ Dialog > Video █████████████████████ -->

    <v-dialog v-model="dialog_video" dark fullscreen scrim="#000">
      <v-card class="d-flex align-center justify-center" color="#000">
        <v-btn
          class="absolute-top-end z99"
          color="#FFF"
          icon
          size="large"
          variant="text"
          @click="dialog_video = false"
        >
          <v-icon>close</v-icon>
        </v-btn>

        <v-container class="max-width-container-1280px mx-auto">
          <video
            v-if="dialog_video"
            :autoplay="true"
            :controls="true"
            class="rounded-28px"
            fullscreen
            height="100%"
            preload="metadata"
            style="position: relative; background-color: #000"
            width="100%"
          >
            <source
              src="./assets/ai-add-product-small.mp4"
              type="video/mp4"
            />
          </video>
        </v-container>
      </v-card>
    </v-dialog>
  </v-sheet>
</template>

<script>
import SImageUploader from "../../../../ui/uploader/SImageUploader.vue";
import UPriceInput from "../../../../ui/price/input/UPriceInput.vue";
import UCurrencyInput from "../../../../ui/currency/input/UCurrencyInput.vue";
import { PriceHelper } from "@selldone/core-js/helper/price/PriceHelper";
import UNumberInput from "../../../../ui/number/input/UNumberInput.vue";
import { SetupService } from "@selldone/core-js/server/SetupService";
import USmartSelect from "../../../../ui/smart/select/USmartSelect.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import VueCompareImage from "../../../../ui/image-compare/VueCompareImage.vue";

export default {
  name: "BProductAddAi",
  components: {
    VueCompareImage,
    USmartSelect,
    UNumberInput,
    UCurrencyInput,
    UPriceInput,
    SImageUploader,
  },
  emits: ["product-add", "product-updated"],
  props: {
    shop: {
      required: true,
    },
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

    dialog_video: false,

    uploading: false,
  }),

  computed: {
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
      return !!this.USER().premium;
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
        this.showErrorAlert(null, response.error_msg);
        return;
      }
      this.showSuccessAlert("Create Product", "Product created successfully!");

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
            this.showSuccessAlert(
              "Update Product",
              "Product updated successfully!",
            );
            this.step = "finish";
            this.$emit("product-updated", data.product);
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
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

<style lang="scss" scoped></style>
