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
        <div class="b-products-panel-header__title-row">
          <h1 class="sd-modern-title-text">{{ $t('global.commons.products') }}</h1>
          <b-products-workspace-help v-model="workspace_help">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                class="sd-modern-button sd-modern-button--compact b-products-panel-header__help"
                color="primary"
                variant="text"
                prepend-icon="help_outline"
              >
                {{ $t('product_panel.workspace.help.open') }}
                <v-tooltip
                  activator="parent"
                  location="top"
                  content-class="sd-modern-tooltip text-start"
                  :open-on-focus="true"
                  :text="$t('product_panel.workspace.help.tooltip')"
                />
              </v-btn>
            </template>
          </b-products-workspace-help>
        </div>
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

        <v-menu
          v-model="tools_menu"
          activator="parent"
          :location="modern ? 'bottom end' : undefined"
          :offset="modern ? 8 : undefined"
          :width="modern ? 620 : undefined"
          :max-width="modern ? 'calc(100vw - 24px)' : undefined"
          :max-height="modern ? 'calc(100dvh - 24px)' : undefined"
          :close-on-content-click="!modern"
        >
          <v-list
            class="text-start pa-0"
            :class="modern ? 'b-products-panel-header__popover sd-modern-widget' : undefined"
            slim
            rounded="lg"
            @keydown.enter="modern && $event.stopPropagation()"
          >
            <header v-if="modern" class="b-products-panel-header__popover-heading">
              <h2>{{ $t('product_panel.workspace.tools') }}</h2>
              <v-icon size="16" aria-hidden="true">tune</v-icon>
            </header>
            <div class="b-products-panel-header__menu-columns">
              <div class="b-products-panel-header__catalog" :aria-label="modern ? $t('product_panel.workspace.catalog') : undefined">
                <h3 v-if="modern" class="b-products-panel-header__menu-eyebrow">{{ $t('product_panel.workspace.catalog') }}</h3>
                <v-list-item
                  :to="{
                    name: IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
                      ? 'VPageVendorProducts'
                      : 'BPageShopProductsList',
                  }"
                  exact
                  prepend-icon="shelves"
                  :append-icon="modern ? $t('icons.chevron_next') : undefined"
                  :active="modern ? false : undefined"
                  @click="tools_menu = false"
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
                  :append-icon="modern ? $t('icons.chevron_next') : undefined"
                  :active="modern ? false : undefined"
                  @click="tools_menu = false"
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
                  :append-icon="modern ? $t('icons.chevron_next') : undefined"
                  :active="modern ? false : undefined"
                  @click="tools_menu = false"
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
                  :append-icon="modern ? $t('icons.chevron_next') : undefined"
                  @click="tools_menu = false; rss_dialog = true"
                >
                  <template v-slot:title>
                    {{ $t("admin_shop.products.products_rss.title") }}

                    <img
                      class="mx-1"
                      :height="modern ? 14 : 22"
                      src="./../../../../assets/trademark/google.svg"
                      :width="modern ? 14 : 22"
                      alt="Google"
                    />
                    <img
                      class="mx-1"
                      :height="modern ? 14 : 22"
                      src="./../../../../assets/trademark/meta.png"
                      :width="modern ? 14 : 22"
                      alt="Meta"
                    />
                  </template>
                </v-list-item>

                <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬ API ⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
                <v-list-item
                  v-if="!IS_VENDOR_PANEL /*🟢 Not Vendor Panel 🟢*/"
                  exact
                  prepend-icon="api"
                  :subtitle="$t('admin_shop.products.products_api.subtitle')"
                  :append-icon="modern ? $t('icons.chevron_next') : undefined"
                  @click="tools_menu = false; api_dialog = true"
                >
                  <template v-slot:title>
                    {{ $t("admin_shop.products.products_api.title") }}

                    <img
                      v-for="i in available_api_feeds.limit(3)"
                      :key="i.driver"
                      :src="i.logo"
                      class="mx-1"
                      :height="modern ? 14 : 22"
                      :width="modern ? 14 : 22"
                      :alt="i.title"
                    />
                  </template>
                </v-list-item>

                <template v-if="!IS_VENDOR_PANEL">
                  <v-divider v-if="!modern" class="my-1"></v-divider>

                  <v-list-item
                    prepend-icon="settings_suggest"
                    :append-icon="modern ? $t('icons.chevron_next') : undefined"
                    @click="tools_menu = false; showAdvancedOptions()"
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
                </div>

              <v-divider v-if="!modern" class="my-2" thickness="2" opacity="1"></v-divider>

              <div :class="modern ? 'b-products-panel-header__toggles' : 'text-center px-1 d-flex flex-column align-center'">
                <h3 v-if="modern" class="b-products-panel-header__menu-eyebrow">{{ $t('product_panel.workspace.display') }}</h3>
                <div
                  v-for="(toggle, index) in toggles"
                  :key="index"
                  :class="modern ? 'b-products-panel-header__preference' : undefined"
                >
                  <div v-if="modern" class="b-products-panel-header__preference-label" :class="{ 'b-products-panel-header__preference-label--mode': toggle.modelValue === 'tableMode' }">
                    <v-icon size="16" aria-hidden="true">{{ toggle.icon }}</v-icon>
                    {{ $t(toggle.label) }}
                  </div>
                  <v-icon v-else class="me-2">{{ toggle.icon }}</v-icon>
                  <v-btn-toggle
                    :model-value="$props[toggle.modelValue]"
                    @update:model-value="
                      (v) => $emit(`update:${toggle.emitKey}`, v)
                    "
                    :selected-class="modern ? 'b-products-panel-header__choice--selected' : 'black-flat'"
                    :class="modern ? 'b-products-panel-header__choices' : 'mb-1'"
                    :aria-label="modern ? $t(toggle.label) : undefined"
                    :aria-keyshortcuts="modern && toggle.shortcut ? `Control+${toggle.shortcut} Meta+${toggle.shortcut}` : undefined"
                    divided
                    mandatory
                    rounded="lg"
                  >
                    <v-btn
                      v-for="value in modern && toggle.modelValue === 'tableMode' ? [false, true] : [true, false]"
                      :key="String(value)"
                      :value="value"
                      :stacked="!modern"
                      size="small"
                      :width="modern ? undefined : 200"
                      :max-width="modern ? undefined : 200"
                      :height="modern ? undefined : 'auto'"
                      :rounded="modern ? undefined : 'lg'"
                      :aria-label="modern ? $t(value ? toggle.trueTitle : toggle.falseTitle) : undefined"
                      :aria-pressed="modern ? $props[toggle.modelValue] === value : undefined"
                    >
                      <v-icon v-if="modern && toggle.modelValue === 'tableMode'" size="14" class="me-1" aria-hidden="true">{{ value ? 'view_list' : 'folder_open' }}</v-icon>
                      {{ $t(modern ? value ? toggle.compactTrueTitle : toggle.compactFalseTitle : value ? toggle.trueTitle : toggle.falseTitle) }}
                      <small v-if="!modern" class="tnt">{{ $t(value ? toggle.trueDescription : toggle.falseDescription) }}</small>
                      <v-tooltip
                        v-if="modern && toggle.modelValue !== 'tableMode'"
                        activator="parent"
                        location="top"
                        content-class="sd-modern-tooltip text-start"
                        :open-on-focus="true"
                        :text="$t(value ? toggle.trueHelp : toggle.falseHelp) + (toggle.shortcut ? ` · ⌘/Ctrl + ${toggle.shortcut}` : '')"
                      />
                    </v-btn>
                  </v-btn-toggle>
                  <p v-if="modern && toggle.modelValue === 'tableMode'" class="b-products-panel-header__mode-description">{{ $t(tableMode ? toggle.trueDescription : toggle.falseDescription) }}</p>
                </div>
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
import BProductsWorkspaceHelp from "../help/BProductsWorkspaceHelp.vue";

export default {
  name: "BProductsPanelHeader",
  components: {
    BProductsWorkspaceHelp,
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

    tools_menu: false,
    workspace_help: false,

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
          label: "product_panel.workspace.view_mode",
          compactTrueTitle: "product_panel.workspace.table",
          compactFalseTitle: "product_panel.workspace.drag_drop",
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
          label: "product_panel.workspace.deleted_products",
          compactTrueTitle: "global.commons.show",
          compactFalseTitle: "global.commons.hide",
          trueHelp: "product_panel.workspace.deleted_show_help",
          falseHelp: "product_panel.workspace.deleted_hide_help",
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
                label: "product_panel.workspace.vendor_identities",
                compactTrueTitle: "global.commons.show",
                compactFalseTitle: "global.commons.hide",
                trueHelp: "product_panel.workspace.vendors_show_help",
                falseHelp: "product_panel.workspace.vendors_hide_help",
                shortcut: "1",
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
          label: "product_panel.workspace.notes",
          compactTrueTitle: "global.actions.show_all",
          compactFalseTitle: "product_panel.workspace.hide_empty_notes",
          trueHelp: "product_panel.workspace.notes_show_help",
          falseHelp: "product_panel.workspace.notes_hide_help",
          shortcut: "2",
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
.b-products-panel-header__menu-columns,
.b-products-panel-header__catalog { display: contents; }

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
  .b-products-panel-header__title-row { display: flex; align-items: center; flex-wrap: wrap; gap: 4px 10px; }
  .b-products-panel-header__help { flex: 0 0 auto; }
  .sd-modern-title-text { font-size: 25px; font-weight: 500; line-height: 31.25px; letter-spacing: -.55px; }
  .sd-modern-subtitle { margin-block: 5px 0; font-size: 12px; font-weight: 400; line-height: 18px; }
  .b-products-panel-header__actions { gap: 8px; }
  .b-products-panel-header__menu { display: flex; flex: 0 0 auto; }
  .b-products-panel-header__queue { flex: 1 0 100%; }
  .b-products-panel-header__queue:empty { display: none; }
}

.b-products-panel-header__popover {
  width: 100%;
  max-height: inherit;
  overflow-y: auto;
  overscroll-behavior: contain;
  border: 1px solid var(--sd-modern-border);
  border-radius: 14px !important;
  color: rgb(var(--v-theme-on-surface));
  background: rgb(var(--v-theme-surface));
  box-shadow: 0 10px 36px rgba(var(--v-theme-on-surface), .11);
  font-family: inherit;
  font-size: 13px;
  line-height: 19.5px;

  .b-products-panel-header__popover-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 16px 13px; border-block-end: 1px solid var(--sd-modern-border); }
  .b-products-panel-header__popover-heading h2 { margin: 0; font-family: inherit; font-size: 14px; font-weight: 500; line-height: 21px; }
  .b-products-panel-header__popover-heading > .v-icon { color: var(--sd-modern-muted); }
  .b-products-panel-header__menu-columns { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr); }
  .b-products-panel-header__catalog { display: block; min-width: 0; padding: 0 7px 7px; }
  .b-products-panel-header__menu-eyebrow { margin: 0; padding: 10px 9px 5px; color: var(--sd-modern-muted); font-size: 11px; font-weight: 500; line-height: 16.5px; letter-spacing: .6px; text-transform: uppercase; }
  &:dir(rtl) .b-products-panel-header__menu-eyebrow { letter-spacing: 0; }
  .b-products-panel-header__catalog > .v-list-item { min-height: 49px; padding: 8px 10px; border-radius: 7px; }
  :deep(.v-list-item__prepend > .v-icon) { font-size: 18px; opacity: 1; color: var(--sd-modern-muted); }
  :deep(.v-list-item__prepend > .v-list-item__spacer) { width: 11px; }
  :deep(.v-list-item__append > .v-icon) { font-size: 14px; opacity: 1; color: var(--sd-modern-muted); }
  :deep(.v-list-item__append > .v-list-item__spacer) { width: 8px; }
  :deep(.v-list-item-title) { display: flex; flex-wrap: wrap; align-items: center; min-width: 0; font-family: inherit; font-size: 13px; font-weight: 500; line-height: 19.5px; letter-spacing: 0; white-space: normal; }
  :deep(.v-list-item-subtitle) { display: block; margin-block-start: 2px; color: var(--sd-modern-muted); font-size: 11px; font-weight: 400; line-height: 16px; letter-spacing: 0; white-space: normal; overflow: visible; opacity: 1; -webkit-line-clamp: unset; }

  .b-products-panel-header__toggles { min-width: 0; padding: 0 14px 12px; border-inline-start: 1px solid var(--sd-modern-border); }
  .b-products-panel-header__toggles > .b-products-panel-header__menu-eyebrow { padding-inline: 0; }
  .b-products-panel-header__preference { min-width: 0; padding-block: 8px; }
  .b-products-panel-header__preference-label { display: flex; align-items: center; gap: 9px; margin-block-end: 7px; font-size: 12px; font-weight: 400; line-height: 18px; }
  .b-products-panel-header__preference-label > .v-icon { color: var(--sd-modern-muted); }
  .b-products-panel-header__preference-label--mode { display: none; }
  .b-products-panel-header__choices { display: flex; width: 100%; height: auto; padding: 3px; gap: 2px; border-radius: 8px; background: rgba(var(--v-theme-on-surface), .045); }
  .b-products-panel-header__choices > .v-btn { flex: 1 1 0; width: auto; max-width: none; min-width: 0; height: auto; min-height: 30px; padding: 4px 10px; border: 0; border-radius: 5px !important; background: transparent; color: var(--sd-modern-muted); font-family: inherit; font-size: 11px; font-weight: 400; line-height: 16.5px; letter-spacing: 0; text-transform: none; }
  .b-products-panel-header__choices > .b-products-panel-header__choice--selected { background: rgb(var(--v-theme-surface)); color: rgb(var(--v-theme-on-surface)); box-shadow: 0 1px 3px rgba(var(--v-theme-on-surface), .09); font-weight: 500; }
  .b-products-panel-header__choice--selected :deep(.v-btn__overlay) { opacity: 0 !important; }
  .b-products-panel-header__choices :deep(.v-btn__content) { white-space: normal; }
  .b-products-panel-header__preference:has(.b-products-panel-header__preference-label--mode) .v-btn { min-height: 34px; font-size: 12px; line-height: 18px; }
  .v-btn:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 1px; }
  .b-products-panel-header__mode-description { margin: 3px 0 0; color: var(--sd-modern-muted); font-size: 11px; font-weight: 400; line-height: 16px; }

  @media (max-width: 599px) {
    .b-products-panel-header__menu-columns { grid-template-columns: minmax(0, 1fr); }
    .b-products-panel-header__toggles { border-inline-start: 0; border-block-start: 1px solid var(--sd-modern-border); }
    .b-products-panel-header__preference { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 12px; }
    .b-products-panel-header__preference:has(.b-products-panel-header__preference-label--mode) { display: block; }
    .b-products-panel-header__preference-label { margin: 0; }
    .b-products-panel-header__preference > .b-products-panel-header__choices { width: auto; max-width: 100%; }
    .b-products-panel-header__preference:has(.b-products-panel-header__preference-label--mode) > .b-products-panel-header__choices { width: 100%; }
  }
  @media (max-width: 599px), (pointer: coarse) {
    .b-products-panel-header__choices > .v-btn,
    .b-products-panel-header__preference:has(.b-products-panel-header__preference-label--mode) .v-btn { min-height: 44px; }
  }
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
