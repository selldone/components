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
  <!-- ███████████████████████████ Toolbar ███████████████████████████ -->
  <v-toolbar extended extension-height="10" v-bind="SUB_TOOLBAR_CONFIG">
    <template v-slot:extension>
      <div style="height: 10px"></div>
    </template>

    <div class="body-title px-2">
      <v-btn color="primary" icon variant="text">
        <v-icon>more_vert</v-icon>

        <v-menu activator="parent">
          <v-list class="text-start pa-0" density="compact" rounded="lg">
            <v-list-item
              :to="{
                name: IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
                  ? 'VPageVendorProducts'
                  : 'BPageShopProductsList',
              }"
              exact
              prepend-icon="shelves"
            >
              <v-list-item-title
                >{{ $t("admin_shop.products.menu_products_list") }}
              </v-list-item-title>
            </v-list-item>

            <v-list-item
              :to="{
                name: IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
                  ? 'VendorProducts_Exporter'
                  : 'BPageShopProductsExporter',
              }"
              exact
              prepend-icon="file_download"
            >
              <v-list-item-title>
                {{ $t("admin_shop.products.menu_export") }}
              </v-list-item-title>
            </v-list-item>
            <v-list-item
              :to="{
                name: IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
                  ? 'VendorProducts_Importer'
                  : 'BPageShopProductsImporter',
              }"
              exact
              prepend-icon="system_update_alt"
            >
              <v-list-item-title
                >{{ $t("admin_shop.products.menu_import") }}
              </v-list-item-title>
            </v-list-item>

            <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬ RSS ⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
            <v-list-item
              v-if="!IS_VENDOR_PANEL /*🟢 Not Vendor Panel 🟢*/"
              exact
              prepend-icon="rss_feed"
              :subtitle="$t('admin_shop.products.products_rss.subtitle')"
              @click="rss_dialog = true"
            >
              <template v-slot:title>
                {{ $t("admin_shop.products.products_rss.title") }}

                <img
                  class="mx-1"
                  height="22"
                  src="./../../../../assets/trademark/google.svg"
                  width="22"
                />
                <img
                  class="mx-1"
                  height="22"
                  src="./../../../../assets/trademark/meta.png"
                  width="22"
                />
              </template>
            </v-list-item>

            <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬ API ⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
            <v-list-item
              v-if="!IS_VENDOR_PANEL /*🟢 Not Vendor Panel 🟢*/"
              exact
              prepend-icon="api"
              :subtitle="$t('admin_shop.products.products_api.subtitle')"
              @click="api_dialog = true"
            >
              <template v-slot:title>
                {{ $t("admin_shop.products.products_api.title") }}

                <img
                  v-for="i in available_api_feeds.limit(3)"
                  :key="i.driver"
                  :src="i.logo"
                  class="mx-1"
                  height="22"
                  width="22"
                />
              </template>
            </v-list-item>

            <template v-if="!IS_VENDOR_PANEL">
              <v-divider class="my-1"></v-divider>

              <v-list-item
                prepend-icon="settings_suggest"
                @click="showAdvancedOptions"
              >
                <v-list-item-title>
                  {{ $t("admin_shop.products.menu_advanced_options") }}
                </v-list-item-title>
              </v-list-item>
            </template>

            <v-divider class="my-1"></v-divider>
            <v-list-item>
              <u-smart-toggle
                :model-value="showDeletes"
                :true-description="$t('admin_shop.products.menu_show_deletes')"
                color="red"
                false-gray
                :false-title="
                  $t('admin_shop.products.show_deletes.false_title')
                "
                :true-title="$t('admin_shop.products.show_deletes.true_title')"
                @update:model-value="(v) => $emit('update:showDeletes', v)"
              ></u-smart-toggle>
            </v-list-item>

            <v-list-item v-if="IS_MARKETPLACE && !IS_VENDOR_PANEL">
              <u-smart-toggle
                :model-value="showVendors"
                false-gray
                :false-title="
                  $t('admin_shop.products.show_vendors.false_title')
                "
                :true-description="
                  $t('admin_shop.products.show_vendors.false_description')
                "
                :true-title="$t('admin_shop.products.show_vendors.true_title')"
                @update:model-value="(v) => $emit('update:showVendors', v)"
              ></u-smart-toggle>
            </v-list-item>

            <v-list-item>
              <u-smart-toggle
                :model-value="showNotes"
                false-gray
                :false-title="$t('admin_shop.products.show_notes.false_title')"
                :true-description="
                  $t('admin_shop.products.show_notes.false_description')
                "
                :true-title="$t('admin_shop.products.show_notes.true_title')"
                @update:model-value="(v) => $emit('update:showNotes', v)"
              ></u-smart-toggle>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-btn>

      <router-link
        v-if="$vuetify.display.smAndUp"
        :to="{
          name: IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? 'VPageVendorProducts'
            : 'BPageShopProductsList',
        }"
        class="text-primary ms-1"
        exact
      >
        {{ $t("admin_shop.products.title") }}
      </router-link>
    </div>

    <v-chip
      v-if="!IS_VENDOR_PANEL && service_google_sheet"
      :href="`https://docs.google.com/spreadsheets/d/${service_google_sheet.products_sheet_id}`"
      class="mx-2"
      color="primary"
      target="_blank"
      :title="$t('admin_shop.products.google_sheet.tooltip')"
      variant="flat"
    >
      <img
        height="16"
        src="../../../../assets/trademark/google-drive.svg"
        width="16"
      />
      <span class="d-none d-sm-inline small ms-2">{{
        $t("admin_shop.products.google_sheet.action")
      }}</span>
      <v-icon class="mx-1 d-none d-sm-inline" size="small">open_in_new</v-icon>
    </v-chip>

    <!-- ✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜ In App Help (Help Center) ✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜ -->
    <inline-help
      :code="HelpCenterCode.SHOP_PRODUCTS"
      class="mx-2"
    ></inline-help>
    <!-- ✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜ -->
    <v-spacer />
    <slot name="center"></slot>
    <v-spacer />

    <u-button-circle
      v-if="CAN_ADD_PRODUCT"
      key="it1"
      :src="require('../../../../assets/icons/product-outline.svg')"
      :tooltip="'✚' + $t('global.commons.product')"
      class="cii"
      tile
      @click="$emit('click:addProduct')"
    >
    </u-button-circle>
    <u-button-circle
      v-if="CAN_ADD_CATEGORY"
      key="it2"
      :src="require('../../../../assets/icons/category-outline.svg')"
      :tooltip="'✚' + $t('global.commons.category')"
      class="cii"
      tile
      @click="$emit('click:addCategory')"
    >
    </u-button-circle>
  </v-toolbar>

  <!-- █████████████████████ RSS Dialog █████████████████████ -->

  <v-bottom-sheet
    v-model="rss_dialog"
    content-class="rounded-t-xl"
    max-width="840"
  >
    <v-card class="rounded-t-xl text-start" rounded="0">
      <v-card-title>
        <v-icon class="me-1" color="#111">rss_feed</v-icon>
        {{ $t("admin_shop.products.rss_dialog.title") }}
      </v-card-title>
      <v-card-text>
        <p class="py-5">
          {{ $t("admin_shop.products.rss_dialog.subtitle") }}
        </p>

        <u-text-copy-box
          :image="getShopImagePath(shop.icon, 128)"
          :value="products_feed"
          message="Products RSS"
          small-width-mode
        ></u-text-copy-box>

        <u-text-copy-box
          :image="require('../../../../assets/trademark/google.svg')"
          :value="products_feed_google"
          message="Google Merchants Feed"
          small-width-mode
        ></u-text-copy-box>

        <u-text-copy-box
          :image="require('../../../../assets/trademark/meta.png')"
          :value="products_feed_facebook"
          message="Facebook Business Feed"
          small-width-mode
        ></u-text-copy-box>
      </v-card-text>
    </v-card>
  </v-bottom-sheet>

  <!-- █████████████████████ API Dialog █████████████████████ -->

  <v-bottom-sheet
    v-model="api_dialog"
    content-class="rounded-t-xl"
    max-width="840"
  >
    <v-card class="rounded-t-xl text-start" rounded="0">
      <v-card-title>
        <v-icon class="me-1" color="#111">rss_feed</v-icon>
        {{ $t("admin_shop.products.api_dialog.title") }}
      </v-card-title>
      <v-card-text>
        <p class="py-5">
          {{ $t("admin_shop.products.api_dialog.subtitle") }}
        </p>

        <u-text-copy-box
          :image="getShopImagePath(shop.icon, 128)"
          :value="products_api_feed"
          message="Products API"
          small-width-mode
        ></u-text-copy-box>

        <u-text-copy-box
          v-for="item in available_api_feeds"
          :key="item.driver"
          :image="item.logo"
          :message="item.title"
          :value="generateApiFeedUrl(item)"
          small-width-mode
        ></u-text-copy-box>
      </v-card-text>
    </v-card>
  </v-bottom-sheet>

  <!-- █████████████████████ Advanced Options Dialog █████████████████████ -->
  <b-products-advanced-options
    v-model="dialog_advanced"
    :shop="shop"
    :vendor="vendor"
  >
  </b-products-advanced-options>
</template>

<script>
import InlineHelp from "../../../help/InlineHelp.vue";
import USmartToggle from "../../../../ui/smart/toggle/USmartToggle.vue";
import { BusinessModel } from "@selldone/core-js/enums/shop/BusinessModel";

import BProductsAdvancedOptions from "../../../product/advanced-options/BProductsAdvancedOptions.vue";
import UTextCopyBox from "../../../../ui/text/copy-box/UTextCopyBox.vue";
import { HelpCenterCode } from "../../../help/HelpCenterCode";
import { ShopPublicFeedApi } from "@selldone/core-js/enums/shop/feeds/api/ShopPublicFeedApi";
import { SetupService } from "@selldone/core-js/server/SetupService";

export default {
  name: "BProductsPanelHeader",
  components: {
    UTextCopyBox,
    BProductsAdvancedOptions,

    USmartToggle,
    InlineHelp,
  },

  emits: ["update:showDeletes", "update:showVendors", "update:showNotes"],
  props: {
    showDeletes: Boolean,
    showVendors: Boolean,
    showNotes: Boolean,

    shop: {
      required: true,
    },
    vendor: {
      /*🟢 Vendor Panel 🟢*/ required: false,
    },
  },

  data: () => ({
    HelpCenterCode: HelpCenterCode,

    dialog_advanced: false,

    rss_dialog: false,
    api_dialog: false,

    ShopPublicFeedApi: ShopPublicFeedApi,
  }),

  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    CAN_ADD_PRODUCT() {
      return (
        !this.IS_VENDOR_PANEL ||
        (this.shop.marketplace && this.shop.marketplace.product)
      );
    },
    CAN_ADD_CATEGORY() {
      return (
        !this.IS_VENDOR_PANEL ||
        (this.shop.marketplace && this.shop.marketplace.category)
      );
    },

    IS_MARKETPLACE() {
      return this.shop.model === BusinessModel.MARKETPLACE.code;
    },

    products_feed() {
      return `${this.getShopMainUrl(this.shop)}/rss/products`;
    },
    products_feed_google() {
      return `${this.getShopMainUrl(this.shop)}/rss/google`;
    },

    products_feed_facebook() {
      return `${this.getShopMainUrl(this.shop)}/rss/facebook`;
    },

    products_api_feed() {
      return `${this.getShopMainUrl(this.shop)}/api/products`;
    },
    available_api_feeds() {
      return ShopPublicFeedApi.filter(
        (i) => !i.local || i.local === SetupService.LocalServiceCountry(),
      );
    },

    service_google_sheet() {
      return this.shop.service_google_sheet;
    },
  },

  watch: {
    mode() {
      this.GoToTopPage();
    },
  },

  created() {},

  mounted() {},

  beforeUnmount() {},
  methods: {
    showAdvancedOptions() {
      this.dialog_advanced = true;
    },

    generateApiFeedUrl(item) {
      return `${this.getShopMainUrl(this.shop)}/api/${item.driver}/products`;
    },
  },
};
</script>

<style lang="scss" scoped></style>
