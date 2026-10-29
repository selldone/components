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
  <v-toolbar
    v-bind="modern ? {} : SUB_TOOLBAR_CONFIG"
    :extended="!modern"
    :extension-height="modern ? 0 : 10"
    :height="modern ? 'auto' : undefined"
    class="b-products-panel-header text-start"
    :class="{ 'b-products-panel-header--modern sd-modern-header': modern }"
  >
    <template v-if="!modern" v-slot:extension>
      <div style="height: 10px"></div>
    </template>

    <div v-if="modern" class="b-products-panel-header__heading sd-modern-title">
      <v-icon class="b-products-panel-header__purpose" aria-hidden="true">inventory_2</v-icon>
      <div>
        <h1 class="sd-modern-title-text">{{ $t('global.commons.products') }}</h1>
        <p class="sd-modern-subtitle">{{ $t('product_panel.workspace.subtitle') }}</p>
      </div>
    </div>

    <div v-if="modern" class="b-products-panel-header__actions sd-modern-actions">
      <v-btn
        v-if="tableMode && CAN_ADD_PRODUCT"
        class="sd-modern-button sd-modern-button--small sd-modern-button--primary"
        color="primary"
        variant="flat"
        prepend-icon="library_add"
        @click="$emit('click:addProduct')"
      >{{ $t('product_panel.workspace.add_product') }}</v-btn>
      <v-btn
        v-if="tableMode && CAN_ADD_CATEGORY"
        class="sd-modern-button sd-modern-button--small"
        color="surface"
        variant="flat"
        prepend-icon="create_new_folder"
        @click="$emit('click:addCategory')"
      >{{ $t('product_panel.workspace.add_category') }}</v-btn>
      <v-btn
        :to="{ name: IS_VENDOR_PANEL ? 'VendorProducts_Importer' : 'BPageShopProductsImporter' }"
        class="sd-modern-button sd-modern-button--small"
        color="surface"
        variant="flat"
        prepend-icon="file_upload"
      >{{ $t('admin_shop.products.menu_import') }}</v-btn>
      <v-btn
        :to="{ name: IS_VENDOR_PANEL ? 'VendorProducts_Exporter' : 'BPageShopProductsExporter' }"
        class="sd-modern-button sd-modern-button--small"
        color="surface"
        variant="flat"
        prepend-icon="file_download"
      >{{ $t('admin_shop.products.menu_export') }}</v-btn>
      <v-btn
        v-if="!IS_VENDOR_PANEL && service_google_sheet"
        :href="`https://docs.google.com/spreadsheets/d/${service_google_sheet.products_sheet_id}`"
        class="sd-modern-button sd-modern-button--small b-products-panel-header__sheet"
        color="surface"
        variant="flat"
        target="_blank"
        rel="noopener noreferrer"
        :aria-label="$t('admin_shop.products.google_sheet.tooltip')"
      >
        <img src="../../../../assets/trademark/google-drive.svg" width="16" height="16" class="me-2" alt="" />
        {{ $t('admin_shop.products.google_sheet.action') }}
        <v-icon end size="small">north_east</v-icon>
        <v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start" :text="$t('admin_shop.products.google_sheet.tooltip')" :open-on-focus="true" />
      </v-btn>
    </div>

    <div :class="modern ? 'b-products-panel-header__menu' : 'body-title px-2'">
      <v-btn
        :color="modern ? undefined : '#000'"
        :class="{ 'sd-modern-icon-button': modern }"
        :aria-label="$t('product_panel.workspace.tools')"
        icon
        variant="text"
      >
        <v-icon>more_vert</v-icon>
        <v-tooltip
          v-if="modern"
          activator="parent"
          location="top"
          content-class="sd-modern-tooltip text-start"
          :text="$t('product_panel.workspace.tools')"
          :open-on-focus="true"
        />

        <v-menu activator="parent">
          <v-list
            class="text-start pa-0"
            :class="{ 'b-products-panel-header__popover': modern }"
            slim
            rounded="lg"
          >
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
                <v-list-item-subtitle>
                  {{
                    $t("admin_shop.products.menu_advanced_options_description")
                  }}
                </v-list-item-subtitle>
              </v-list-item>
            </template>

            <v-divider class="my-2" thickness="2" opacity="1"></v-divider>

            <div class="text-center px-1 d-flex flex-column align-center" :class="{ 'b-products-panel-header__toggles': modern }">
              <div v-for="(toggle, index) in toggles" :key="index">
                <v-icon class="me-2">{{ toggle.icon }}</v-icon>
                <v-btn-toggle
                  :model-value="$props[toggle.modelValue]"
                  @update:model-value="
                    (v) => $emit(`update:${toggle.emitKey}`, v)
                  "
                  selected-class="black-flat"
                  class="mb-1"
                  divided
                  mandatory
                  rounded="lg"
                >
                  <v-btn
                    :value="true"
                    stacked
                    size="small"
                    width="200"
                    max-width="200"
                    height="auto"
                    rounded="lg"
                  >
                    {{ $t(toggle.trueTitle) }}
                    <small class="tnt">{{ $t(toggle.trueDescription) }}</small>
                  </v-btn>
                  <v-btn
                    :value="false"
                    stacked
                    size="small"
                    width="200"
                    max-width="200"
                    height="auto"
                    rounded="lg"
                  >
                    {{ $t(toggle.falseTitle) }}
                    <small class="tnt">{{ $t(toggle.falseDescription) }}</small>
                  </v-btn>
                </v-btn-toggle>
              </div>
            </div>
          </v-list>
        </v-menu>
      </v-btn>
      <!--
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
            </router-link>-->
    </div>

    <v-chip
      v-if="!modern && !IS_VENDOR_PANEL && service_google_sheet"
      :href="`https://docs.google.com/spreadsheets/d/${service_google_sheet.products_sheet_id}`"
      class="mx-2"
      color="primary"
      target="_blank"
      rel="noopener noreferrer"
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
      <v-icon class="mx-1 d-none d-sm-inline" size="small">north_east</v-icon>
    </v-chip>


    <v-spacer v-if="!modern" />
    <div :class="{ 'b-products-panel-header__queue': modern }"><slot name="center"></slot></div>
    <v-spacer v-if="!modern" />

    <u-button-circle
      v-if="!modern && CAN_ADD_PRODUCT"
      key="it1"
      :src="require('../../../../assets/icons/product-outline.svg')"
      :tooltip="'✚' + $t('global.commons.product')"
      class="cii"
      tile
      @click="$emit('click:addProduct')"
    >
    </u-button-circle>
    <u-button-circle
      v-if="!modern && CAN_ADD_CATEGORY"
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
          class="mb-3"
        ></u-text-copy-box>

        <u-text-copy-box
          :image="require('../../../../assets/trademark/google.svg')"
          :value="products_feed_google"
          message="Google Merchants Feed"
          small-width-mode
          class="mb-3"
        ></u-text-copy-box>

        <u-text-copy-box
          :image="require('../../../../assets/trademark/meta.png')"
          :value="products_feed_facebook"
          message="Facebook Business Feed"
          small-width-mode
          class="mb-3"
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
          class="mb-3"
        ></u-text-copy-box>

        <u-text-copy-box
          v-for="item in available_api_feeds"
          :key="item.driver"
          :image="item.logo"
          :message="item.title"
          :value="generateApiFeedUrl(item)"
          small-width-mode
          class="mb-3"
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

<script lang="ts">
import USmartToggle from "../../../../ui/smart/toggle/USmartToggle.vue";
import { BusinessModel } from "@selldone/core-js/enums/shop/BusinessModel";

import BProductsAdvancedOptions from "../../../product/advanced-options/BProductsAdvancedOptions.vue";
import UTextCopyBox from "../../../../ui/text/copy-box/UTextCopyBox.vue";
import { ShopPublicFeedApi } from "@selldone/core-js/enums/shop/feeds/api/ShopPublicFeedApi";
import { SetupService } from "@selldone/core-js/server/SetupService";
import { VendorMemberTypes } from "@selldone/core-js/models/shop/vendor/vendor_member.model.ts";
import ScrollHelper from "@selldone/core-js/utils/scroll/ScrollHelper.ts";
import { ShopURLs } from "@selldone/core-js/helper";

export default {
  name: "BProductsPanelHeader",
  components: {
    UTextCopyBox,
    BProductsAdvancedOptions,

    USmartToggle,
  },

  emits: [
    "update:showDeletes",
    "update:showVendors",
    "update:showNotes",
    "click:addProduct",
    "click:addCategory",
    "update:tableMode",
  ],
  props: {
    modern: Boolean,
    showDeletes: Boolean,
    showVendors: Boolean,
    showNotes: Boolean,
    tableMode: Boolean,

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
        (!this.IS_VENDOR_PANEL ||
          (this.shop.marketplace && this.shop.marketplace.product)) &&
        // Check in vendor panel limitations: (In the vendor panel, should have written product access)
        (!this.IS_VENDOR_PANEL ||
          this.writeVendorAccess(
            this.vendor,
            VendorMemberTypes.VendorMemberRegionCode.PRODUCTS,
          ))
      );
    },
    CAN_ADD_CATEGORY() {
      return (
        (!this.IS_VENDOR_PANEL ||
          (this.shop.marketplace && this.shop.marketplace.category)) &&
        // Check in vendor panel limitations: (In the vendor panel, should have written product access)
        (!this.IS_VENDOR_PANEL ||
          this.writeVendorAccess(
            this.vendor,
            VendorMemberTypes.VendorMemberRegionCode.PRODUCTS,
          ))
      );
    },

    IS_MARKETPLACE() {
      return this.shop.model === BusinessModel.MARKETPLACE.code;
    },

    products_feed() {
      return `${ShopURLs.MainShopUrl(this.shop)}/rss/products`;
    },
    products_feed_google() {
      return `${ShopURLs.MainShopUrl(this.shop)}/rss/google`;
    },

    products_feed_facebook() {
      return `${ShopURLs.MainShopUrl(this.shop)}/rss/facebook`;
    },

    products_api_feed() {
      return `${ShopURLs.MainShopUrl(this.shop)}/api/products`;
    },
    available_api_feeds() {
      return ShopPublicFeedApi.filter(
        (i) => !i.local || i.local === SetupService.LocalServiceCountry(),
      );
    },

    service_google_sheet() {
      return this.shop.service_google_sheet;
    },

    toggles() {
      return [
        {
          modelValue: "tableMode",
          emitKey: "tableMode",
          trueTitle: "admin_shop.products.table_mode.true_title",
          trueDescription: "admin_shop.products.table_mode.true_description",
          falseTitle: "admin_shop.products.table_mode.false_title",
          falseDescription: "admin_shop.products.table_mode.false_description",
          icon: "view_list",
        },

        {
          modelValue: "showDeletes",
          emitKey: "showDeletes",
          trueTitle: "admin_shop.products.show_deletes.true_title",
          trueDescription: "admin_shop.products.show_deletes.true_description",
          falseTitle: "admin_shop.products.show_deletes.false_title",
          falseDescription:
            "admin_shop.products.show_deletes.false_description",
          icon: "delete_outline",
        },
        ...(this.IS_MARKETPLACE && !this.IS_VENDOR_PANEL
          ? [
              {
                modelValue: "showVendors",
                emitKey: "showVendors",
                trueTitle: "admin_shop.products.show_vendors.true_title",
                trueDescription:
                  "admin_shop.products.show_vendors.true_description",
                falseTitle: "admin_shop.products.show_vendors.false_title",
                falseDescription:
                  "admin_shop.products.show_vendors.false_description",
                condition: "IS_MARKETPLACE && !IS_VENDOR_PANEL",
                icon: "storefront",
              },
            ]
          : []),

        {
          modelValue: "showNotes",
          emitKey: "showNotes",
          trueTitle: "admin_shop.products.show_notes.true_title",
          trueDescription: "admin_shop.products.show_notes.true_description",
          falseTitle: "admin_shop.products.show_notes.false_title",
          falseDescription: "admin_shop.products.show_notes.false_description",
          icon: "sticky_note_2",
        },
      ];
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
      return `${ShopURLs.MainShopUrl(this.shop)}/api/${item.driver}/products`;
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
.b-products-panel-header--modern {
  overflow: visible;
  background: transparent !important;
  margin-block-end: 23px;

  :deep(.v-toolbar__content) {
    height: auto !important;
    min-height: 58px;
    overflow: visible;
    flex-wrap: wrap;
    align-items: center;
    column-gap: 8px;
    row-gap: 16px;
  }

  .b-products-panel-header__heading {
    flex: 1 1 250px;
    align-items: center;
    gap: 12px;
  }

  .b-products-panel-header__purpose { font-size: 26px; }
  .sd-modern-title-text { font-size: 25px; font-weight: 500; line-height: 31.25px; letter-spacing: -.55px; }
  .sd-modern-subtitle { margin-block: 5px 0; font-size: 12px; font-weight: 400; line-height: 18px; }
  .b-products-panel-header__actions { gap: 8px; }
  .b-products-panel-header__menu { display: flex; flex: 0 0 auto; }
  .b-products-panel-header__queue { flex: 1 0 100%; }
  .b-products-panel-header__queue:empty { display: none; }
}

.b-products-panel-header__popover {
  width: min(440px, calc(100vw - 32px));
  max-width: calc(100vw - 32px);
  color: rgb(var(--v-theme-on-surface));
  background: rgb(var(--v-theme-surface));

  :deep(.v-list-item-title) { font-size: 13px; font-weight: 500; line-height: 20px; }
  :deep(.v-list-item-subtitle) { font-size: 12px; line-height: 18px; white-space: normal; }
}

.b-products-panel-header__toggles {
  align-items: stretch !important;
  padding: 8px 12px 12px !important;

  > div { display: flex; align-items: center; gap: 8px; min-width: 0; }
  :deep(.v-btn-toggle) { flex: 1; height: auto; min-width: 0; padding-block: 4px; gap: 4px; }
  :deep(.v-btn) { flex: 1 1 0; width: auto !important; max-width: none !important; min-width: 0; min-height: 52px; padding: 8px; font-size: 12px; letter-spacing: 0; }
  :deep(.v-btn__content) { white-space: normal; }
  :deep(.v-btn small) { font-size: 11px; font-weight: 400; }
}

@media (max-width: 600px) {
  .b-products-panel-header--modern {
    .b-products-panel-header__heading { order: 1; flex: 1 1 calc(100% - 52px); min-width: 0; }
    .b-products-panel-header__menu { order: 2; }
    .b-products-panel-header__sheet { grid-column: 1 / -1; }
    .b-products-panel-header__actions { order: 3; flex: 1 0 100%; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .b-products-panel-header__actions > .v-btn { min-width: 0; padding-inline: 8px; }
    .b-products-panel-header__actions :deep(.v-btn__content) { white-space: normal; }
    .sd-modern-title-text { font-size: 22px; line-height: 28px; }
  }
}
</style>
