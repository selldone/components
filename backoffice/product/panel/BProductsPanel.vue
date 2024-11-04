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
  <div
    class="overflow-hidden"
    @dragleave="
      (e) => {
        show_drop ? undefined : dragleave(e);
      }
    "
    @dragover="dragover"
    @drop="
      (e) => {
        show_drop ? undefined : drop(e);
      }
    "
  >
    <!-- ███████████████████████████ Toolbar ███████████████████████████ -->

    <b-products-panel-header
      v-model:showDeletes="show_deletes"
      v-model:showNotes="show_notes"
      v-model:showVendors="show_vendors"
      :shop="shop"
      :vendor="vendor"
      @click:addProduct="add_product_dialog = true"
      @click:addCategory="dialog_add_category = true"
    >
      <template v-slot:center>
        <v-slide-y-transition>
          <v-btn
            v-if="(importing || images_que) && importing_collapse"
            class="tnt"
            rounded
            size="small"
            title="Collapse"
            variant="text"
            @click.stop="importing_collapse = false"
          >
            <span v-if="importing" class="me-2">
              <v-icon class="me-1">fa:fas fa-box</v-icon>
              {{ $t("global.commons.products") }} |
              {{ numeralFormat(importing, "0.[0] a") }}</span
            >
            <span v-if="images_que" class="me-2">
              <v-icon class="me-1">fa:fas fa-image</v-icon
              >{{ $t("global.commons.images") }} |
              {{ numeralFormat(images_que, "0.[0] a") }}</span
            >
            Importing...
            <v-icon :class="{ 'rotate-180': !importing_collapse }" end
              >expand_more
            </v-icon>
          </v-btn>
        </v-slide-y-transition>
      </template>
    </b-products-panel-header>

    <!-- ███████████████████████████ Importing Products Que ███████████████████████████ -->

    <v-expand-transition>
      <div v-if="!importing_collapse">
        <b-shop-products-import-processing
          :shop="shop"
          class="position-relative"
        >
          <v-btn
            class="absolute-top-end"
            icon
            title="Collapse"
            variant="text"
            @click="importing_collapse = true"
          >
            <v-icon :class="{ 'rotate-180': !importing_collapse }"
              >expand_more
            </v-icon>
          </v-btn>
        </b-shop-products-import-processing>
      </div>
    </v-expand-transition>

    <!-- ███████████████████████████ Products List ███████████████████████████ -->

    <b-products-window
      ref="products_list"
      :shop="shop"
      :show-deletes="show_deletes"
      :show-notes="show_notes"
      :show-vendors="show_vendors"
      :vendor="vendor"
      :add-product-button="CAN_ADD_PRODUCT"
      class="mb-5 fadeIn"
      draggable
      multi-select-products
      style="min-height: 680px"
      with-category-translations
      @select="
        (product) =>
          $router.push({
            name: IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
              ? 'Vendor_ProductDashboard'
              : 'BPageProductDashboard',
            params: { product_id: product.id },
          })
      "
      @select:middle="openInNewTab"
      @change:parent-folder="(folder) => (parent_folders = folder)"
      @click:add="add_product_dialog = true"
      @click:fast-add="add_product_studio_dialog = true"
      @click:ai-add="showAIAddDialog()"
    >
      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅ Import Product Button ▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
      <template v-if="CAN_ADD_PRODUCT" v-slot:append-products>
        <v-col key="importer" class="p-2" cols="12" lg="3" md="4" sm="6" xl="3">
          <div
            class="dashed rounded-8px d-flex align-center justify-center pa-3 bg-white min-h-100 position-relative"
          >
            <div>
              <!-- ✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜ In App Help (Help Center) ✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜ -->
              <inline-help
                :code="HelpCenterCode.SHOP_PRODUCTS_IMPORT"
                class="absolute-top-end"
              ></inline-help>
              <!-- ✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜ -->

              <img
                alt="Excel"
                class="mb-3"
                height="36"
                src="../../../assets/file/excel.svg"
                width="36"
              />
              <h3>{{ $t("product_panel.excel_import.title") }}</h3>
              <small class="me-2">{{ $t("global.commons.or") }}</small>
              <v-btn
                :to="{
                  name: IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
                    ? 'VendorProducts_Importer'
                    : 'BPageShopProductsImporter',
                }"
                class="tnt m-1"
                color="primary"
                exact
                size="small"
              >
                <v-icon class="me-1" size="small">file_upload</v-icon>

                {{ $t("product_panel.excel_import.select_file") }}
              </v-btn>

              <small class="d-block">
                {{ $t("product_panel.excel_import.max_file") }}</small
              >

              <div>
                <hr />
                <v-btn
                  class="tnt m-1"
                  color="primary"
                  size="small"
                  variant="text"
                  @click="dialog_sample = true"
                >
                  <v-icon class="me-1" size="small">download</v-icon>
                  {{ $t("product_panel.excel_import.download_sample") }}
                </v-btn>
              </div>
            </div>
          </div>
        </v-col>
      </template>
    </b-products-window>

    <!-- ███████████████████████████ Extra ███████████████████████████ -->

    <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬ Drop Zone ⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

    <div
      v-if="show_drop"
      class="drop-container"
      @dragleave="dragleave"
      @drop="drop"
    >
      <div class="center-absolute p-3">
        <div>
          <v-icon class="m-2" color="#fff" size="64">topic</v-icon>
        </div>
        {{ $t("admin_shop.products.drop_import_message") }}
      </div>
    </div>

    <!-- █████████████████████ Dialog > Sample excel █████████████████████ -->

    <b-product-importer-sample-dialog
      v-model="dialog_sample"
    ></b-product-importer-sample-dialog>

    <!-- ███████████████████████ Dialog > Add product by AI ███████████████████████ -->
    <v-dialog
      v-model="ai_dialog"
      fullscreen
      transition="dialog-bottom-transition"
    >
      <v-card v-if="ai_dialog_pre" color="#516ad6" dark rounded="0">
        <v-card-title class="d-flex align-center">
          <v-icon class="me-2">auto_fix_high</v-icon>
          {{ $t("product_panel.ai.title") }}

          <span v-if="parent_folders">
            <span class="mx-2">|</span>
            <v-avatar
              v-if="parent_folders.icon"
              class="me-1 avatar-gradient -thin -category"
              size="24"
            >
              <v-img :src="getShopImagePath(parent_folders.icon, 64)"></v-img>
            </v-avatar>
            {{ parent_folders.title }}
          </span>

          <v-spacer></v-spacer>

          <v-btn
            color="#FFF"
            icon
            size="x-large"
            variant="text"
            @click="ai_dialog = false"
          >
            <v-icon>close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <b-product-add-ai
            :category="parent_folders"
            :shop="shop"
            :vendor="vendor"
            dark
            @product-add="
              (product) => $refs.products_list?.onAddOrUpdateProduct(product)
            "
            @product-updated="
              (product) => $refs.products_list?.onAddOrUpdateProduct(product)
            "
          ></b-product-add-ai>
        </v-card-text>

        <v-card-actions>
          <div class="widget-buttons">
            <v-btn size="x-large" variant="text" @click="ai_dialog = false">
              <v-icon start>close</v-icon>
              {{ $t("global.actions.close") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ███████████████████████████ Add Category ███████████████████████████ -->

    <v-dialog
      v-model="dialog_add_category"
      fullscreen
      scrollable
      transition="dialog-bottom-transition"
    >
      <b-category-add
        :categories="null"
        :category="null"
        :parent-folder="parent_folders"
        :shop="shop"
        :vendor="vendor"
        hide-top-bar
        @add="
          (category) => $refs.products_list?.onAddOrUpdateCategory(category)
        "
        @back="dialog_add_category = false"
      />
    </v-dialog>

    <!-- ███████████████████████ Dialog > Add product Normal ███████████████████████ -->
    <b-products-panel-add-product
      v-model="add_product_dialog"
      @add="
        (p) => {
          $refs.products_list?.onAddOrUpdateProduct(p);
        }
      "
      :category="parent_folders"
    >
    </b-products-panel-add-product>

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
            Utilize this RSS feed to maintain an up-to-date list of all
            products.
          </v-list-subheader>
          <u-text-copy-box
            :image="getShopImagePath(shop.icon, 128)"
            :value="products_feed"
            small-width-mode
            title="Products RSS"
          ></u-text-copy-box>

          <u-text-copy-box
            :image="require('../../../assets/trademark/google.svg')"
            :value="products_feed_google"
            small-width-mode
            title="Google Merchants Feed"
          ></u-text-copy-box>

          <u-text-copy-box
            :image="require('../../../assets/trademark/meta.png')"
            :value="products_feed_facebook"
            small-width-mode
            title="Facebook Business Feed"
          ></u-text-copy-box>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>

    <!-- ███████████████████████████ Dialog > Add Product > Add Studio (fast) ███████████████████████████ -->

    <v-dialog
      v-model="add_product_studio_dialog"
      fullscreen
      transition="dialog-bottom-transition"
    >
      <v-card color="#FFF">
        <v-card-text>
          <b-product-add-studio
            :shop="shop"
            :vendor="vendor"
            class="fadeIn"
            dark
            @add="(p) => $refs.products_list?.onAddOrUpdateProduct(p)"
            @finish="add_product_studio_dialog = false"
          >
          </b-product-add-studio>
        </v-card-text>

        <v-card-actions>
          <div class="widget-buttons">
            <v-btn
              size="x-large"
              variant="text"
              @click="add_product_studio_dialog = false"
            >
              <v-icon start>close</v-icon>
              {{ $t("global.actions.close") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import BProductsWindow from "../../product/window/BProductsWindow.vue";
import BProductAddStudio from "../add/studio/BProductAddStudio.vue";
import BCategoryAdd from "../../category/add/BCategoryAdd.vue";
import { UploadHelper } from "@selldone/core-js/helper/upload/UploadHelper";
import { FileFormatConverterOnline } from "@selldone/core-js/helper/converters/FileFormatConverterOnline";
import BProductImporterSampleDialog from "../../product/importer/sample-dialog/BProductImporterSampleDialog.vue";
import InlineHelp from "../../help/InlineHelp.vue";
import { BusinessModel } from "@selldone/core-js/enums/shop/BusinessModel";

import UTextCopyBox from "../../../ui/text/copy-box/UTextCopyBox.vue";
import _ from "lodash-es";
import BProductAddAi from "../../product/add/ai/BProductAddAi.vue";
import { TemporaryDataHelper } from "../../../utils/temporary-data/TemporaryDataHelper";
import BShopProductsImportProcessing from "../../product/importer/processing/BShopProductsImportProcessing.vue";
import BProductsPanelHeader from "../../product/panel/header/BProductsPanelHeader.vue";
import { VendorMemberTypes } from "@selldone/core-js/models/shop/vendor/vendor_member.model.ts";
import BProductsPanelAddProduct from "@selldone/components-vue/backoffice/product/panel/add-product/BProductsPanelAddProduct.vue";

export default {
  name: "BProductsPanel",
  components: {
    BProductsPanelAddProduct,
    BProductsPanelHeader,
    BShopProductsImportProcessing,
    BProductAddAi,
    UTextCopyBox,

    InlineHelp,
    BProductImporterSampleDialog,
    BCategoryAdd,
    BProductAddStudio,
    BProductsWindow,
  },

  props: {
    shop: {
      required: true,
    },
    vendor: {
      /*🟢 Vendor Panel 🟢*/ required: false,
    },
  },
  delimiters: ["${", "}"], // Avoid Twig conflicts
  data: () => ({
    VendorMemberRegionCode: VendorMemberTypes.VendorMemberRegionCode,

    dialog_add_category: false,
    add_product_dialog: false,

    mode: "list",
    ai_dialog: false,
    ai_dialog_pre: false,

    add_product_studio_dialog: false,

    parent_folders: null,

    show_drop: false,
    relase_to_leave: true, //Solve chrome and fire fox bug!
    dragged_external: false,

    show_deletes: window.show_deletes,
    show_vendors: window.show_vendors,
    show_notes: window.show_notes,

    dialog_sample: false,

    key_listener_keydown: null,

    rss_dialog: false,

    importing_collapse: window.importing_collapse,
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

    //--------------------------------------------------------------------------------

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

    importing() {
      return this.shop.importing;
    },
    images_que() {
      return this.shop["images-que"];
    },
  },

  watch: {
    mode() {
      this.GoToTopPage();
    },
    show_deletes(val) {
      window.show_deletes = val; // Keep value temporary!
    },
    show_vendors(val) {
      window.show_vendors = val; // Keep value temporary!
    },
    show_notes(val) {
      window.show_notes = val; // Keep value temporary!
    },
    importing_collapse(val) {
      window.importing_collapse = val; // Keep value temporary!
    },
  },

  created() {
    if (this.$route.hash) {
      this.mode = this.$route.hash.replace("#", "");
      if (
        this.mode !== "list" &&
        this.mode !== "add" &&
        this.mode !== "category"
      )
        this.mode = "list";
    }
  },

  mounted() {
    //――――――――――――――――――――――  START Editor key listener ――――――――――――――――――――

    //const t = this;

    this.key_listener_keydown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.code === "KeyP") {
        this.add_product_dialog = true;
        event.preventDefault();
      }
      if ((event.ctrlKey || event.metaKey) && event.code === "KeyX") {
        this.showAIAddDialog();
        event.preventDefault();
      } else if ((event.ctrlKey || event.metaKey) && event.code === "Digit1") {
        this.show_vendors = !this.show_vendors;
        event.preventDefault();
      } else if ((event.ctrlKey || event.metaKey) && event.code === "Digit2") {
        this.show_notes = !this.show_notes;
        event.preventDefault();
      }
    };

    document.addEventListener("keydown", this.key_listener_keydown);
  },

  beforeUnmount() {
    document.removeEventListener("keydown", this.key_listener_keydown);
  },
  methods: {
    openInNewTab(product) {
      const routeData = this.$router.resolve({
        name: this.IS_VENDOR_PANEL
          ? "Vendor_ProductDashboard"
          : "BPageProductDashboard",
        params: { product_id: product.id },
      });
      window.open(routeData.href, "_blank");
    },

    //--------------------------------------------------------------------------------------
    overDropImage: _.throttle((selector) => {
      // Clear all:
      $("*[drop-image]").removeClass("shadow-drop-img");

      // Add class to jquery selector:
      if (selector) {
        selector.addClass("shadow-drop-img");
      }
    }, 500),

    isDropImage(event) {
      return (
        Object.values(event.dataTransfer.items).some((i) =>
          i.type.includes("image"),
        ) &&
        (event.target.getAttribute("drop-image") ||
          $(event.target).closest("*[drop-image]").attr("drop-image"))
      );
    },

    getProductId(target) {
      return parseInt($(target).closest("*[product-id]").attr("product-id"));
    },

    getCategoryId(target) {
      return parseInt($(target).closest("*[category-id]").attr("category-id"));
    },
    //--------------------------------------------------------------------------------------

    dragover(event) {
      if (!this.$refs.products_list || this.$refs.products_list.inDragState) {
        return;
      }
      // console.log('products > dragover')

      event.preventDefault();

      if (this.$refs.products_list) this.$refs.products_list.onDragEnd();

      this.dragged_external = true;

      //console.log('dragover',event.target,event.dataTransfer.items)

      // Image File:
      if (
        Object.values(event.dataTransfer.items).some((i) =>
          i.type.includes("image"),
        )
      ) {
        // Try get product ID from parent:
        let drop_image = this.isDropImage(event);

        // Drop image for product:
        if (drop_image) {
          this.overDropImage($(event.target).closest("*[drop-image]"));

          // Drop image for product:
          const product_id = this.getProductId(event.target);

          // Drop image for category:
          const category_id = this.getCategoryId(event.target);

          if (product_id) {
            //console.log("product_id", product_id);

            this.show_drop = false;
            return;
          } else if (category_id) {
            //console.log("category_id", category_id);

            this.show_drop = false;
            return;
          }
        }
      }

      this.overDropImage();

      // CSV File:
      if (
        Object.values(event.dataTransfer.items).some((i) => {
          return i.type.includes("application/vnd") || i.type.includes("csv"); // text/csv
        })
      ) {
        this.show_drop = true;
      }

      // Default file drop:
    },
    dragleave(event) {
      if (!this.$refs.products_list || this.$refs.products_list.inDragState)
        return;

      //console.log('products > dragleave')

      //   console.log('dragleave')
      // Clean up
      this.overDropImage();

      this.dragged_external = false;
      this.show_drop = false;
    },
    drop(event) {
      if (!this.$refs.products_list) return;
      // Clean up
      this.overDropImage();

      this.show_drop = false;

      if (!this.dragged_external) {
        return;
      }
      this.dragged_external = false;

      // console.log("drop", event);
      event.preventDefault();

      const files = event.dataTransfer.files;

      // Image files:
      if (this.isDropImage(event)) {
        const image_files = Object.values(event.dataTransfer.files).filter(
          (i) => i.type.includes("image"),
        );

        // Drop image for product:
        const product_id = this.getProductId(event.target);

        // Drop image for category:
        const category_id = this.getCategoryId(event.target);

        // console.log("image_files", image_files, "product_id", product_id, "category_id", category_id);

        if (image_files.length && product_id) {
          image_files.forEach((file) => {
            const url = this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
              ? window.VAPI.POST_MY_VENDOR_UPLOAD_PRODUCT_COVER(
                  this.vendor.id,
                  product_id,
                )
              : window.API.POST_UPLOAD_PRODUCT_COVER(this.shop.id, product_id);

            UploadHelper.UploadFile(
              this,
              { product: product_id }, // Use to show upload indicator on product card!
              url,
              file.name,
              file,
              "photo",
              { "auto-set-main": "true" },
              true,
              (data) => {
                if (
                  this.$refs.products_list &&
                  !data.files.item /*item = ProductImage  null if is icon*/
                )
                  this.$refs.products_list.updateProductMainImage(
                    product_id,
                    data.files.path,
                  );
              },
            );
          });
        } else if (image_files.length && category_id) {
          const file = image_files[0];
          const url = this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.POST_MY_VENDOR_UPLOAD_CATEGORY_IMAGE(
                this.vendor.id,
                category_id,
              )
            : window.API.POST_UPLOAD_CATEGORY_IMAGE(this.shop.id, category_id);

          UploadHelper.UploadFile(
            this,
            { category: category_id }, // Use to show upload indicator on category card!
            url,
            file.name,
            file,
            "photo",
            null,
            true,
            (data) => {
              if (this.$refs.products_list)
                this.$refs.products_list.updateCategoryImage(
                  category_id,
                  data.files.path,
                );
            },
          );
        }

        return;
      }

      // CSV files:

      if (files.length) {
        const file = files[0];

        // Upload to convert file format:
        if (
          file.name.toLowerCase().endsWith(".xls") ||
          file.name.toLowerCase().endsWith(".xlsx")
        ) {
          // Online convert excel to csv:

          /*🟢 Vendor Panel 🟢*/
          if (this.IS_VENDOR_PANEL) {
            FileFormatConverterOnline.VendorConvertToCsv(
              this,
              this.vendor.id,
              file,
              (data) => {
                this.loadCsvImport(data, true);
              },
            );
          } else {
            FileFormatConverterOnline.ConvertToCsv(
              this,
              this.shop.id,
              file,
              (data) => {
                this.loadCsvImport(data, true);
              },
            );
          }

          return;
        }
        if (!file.name.toLowerCase().endsWith(".csv")) {
          this.showErrorAlert(null, "Acceptable file format is CSV!");
          return;
        }
        if (file.size > 20 * 1024 * 1024) {
          this.showErrorAlert(null, "Maximum file size limited to 20MB!");
          return;
        }

        this.loadCsvImport(file, false);
      }
    },

    loadCsvImport(file, converted_file = false) {
      // 🔹Save the temporary data:
      TemporaryDataHelper.Set(this, {
        file: file,
        converted_file: converted_file,
      });

      this.$router.push({
        name: this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
          ? "VendorProducts_Importer"
          : "BPageShopProductsImporter",
        query: {
          category: this.parent_folders ? this.parent_folders.name : null,
        }, // Tips: Send current 'category_name' to use as default products import (category if not set!)
      });
    },

    //----------------------------------------

    showAIAddDialog() {
      this.ai_dialog_pre = false;
      this.$nextTick(() => {
        this.ai_dialog_pre = true;
        this.ai_dialog = true;
      });
    },
  },
};
</script>

<style lang="scss" scoped></style>
