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

    <div class="body-title">
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn color="primary" icon v-bind="props" variant="text">
            <v-icon>more_vert</v-icon>
          </v-btn>
        </template>
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
            subtitle="Importing products into Google, Meta, ..."
            title="Products RSS"
            @click="rss_dialog = true"
          >
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
              false-title="Hide deleted"
              true-title="Show deleted"
              @update:model-value="(v) => $emit('update:showDeletes', v)"
            ></u-smart-toggle>
          </v-list-item>

          <v-list-item v-if="IS_MARKETPLACE && !IS_VENDOR_PANEL">
            <u-smart-toggle
              :model-value="showVendors"
              false-gray
              false-title="Hide vendors"
              true-description="Show all vendors, ⌘Ctrl+1"
              true-title="Show vendors"
              @update:model-value="(v) => $emit('update:showVendors', v)"
            ></u-smart-toggle>
          </v-list-item>

          <v-list-item>
            <u-smart-toggle
              :model-value="showNotes"
              false-gray
              false-title="Hide notes"
              true-description="Show all notes, ⌘Ctrl+2"
              true-title="Show notes"
              @update:model-value="(v) => $emit('update:showNotes', v)"
            ></u-smart-toggle>
          </v-list-item>
        </v-list>
      </v-menu>

      <router-link
        v-if="$vuetify.display.smAndUp"
        :to="{
          name: IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? 'VPageVendorProducts'
            : 'BPageShopProductsList',
        }"
        class="text-primary"
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
      title="Products in this shop has been linked to a sheet in the Google Drive."
      variant="flat"
    >
      <img
        height="16"
        src="../../../../assets/trademark/google-drive.svg"
        width="16"
      />
      <span class="d-none d-sm-inline small ms-2">Linked Sheet</span>
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
        Product RSS
      </v-card-title>
      <v-card-text class="py-5">
        <v-list-subheader>
          Utilize this RSS feed to maintain an up-to-date list of all products.
        </v-list-subheader>
        <u-text-copy-box
          :image="getShopImagePath(shop.icon, 128)"
          :value="products_feed"
          small-width-mode
          title="Products RSS"
        ></u-text-copy-box>

        <u-text-copy-box
          :image="require('../../../../assets/trademark/google.svg')"
          :value="products_feed_google"
          small-width-mode
          title="Google Merchants Feed"
        ></u-text-copy-box>

        <u-text-copy-box
          :image="require('../../../../assets/trademark/meta.png')"
          :value="products_feed_facebook"
          small-width-mode
          title="Facebook Business Feed"
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

export default {
  name: "BProductsPanelHeader",
  components: {
    UTextCopyBox,
    BProductsAdvancedOptions,

    USmartToggle,
    InlineHelp,
  },

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
    dialog_advanced: false,

    rss_dialog: false,
  }),

  computed: {
    HelpCenterCode() {
      return HelpCenterCode;
    },
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
  },
};
</script>

<style lang="scss" scoped></style>
