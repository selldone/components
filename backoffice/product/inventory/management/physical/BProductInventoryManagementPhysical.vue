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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div v-bind="$attrs" :class="{ 'b-product-inventory-refined': modern, 'b-product-inventory-refined--workspace': modern && productWorkspace }">
    <header v-if="modern && !productWorkspace" class="sd-modern-header b-product-inventory-refined__header">
      <div>
        <h1>{{ $t('b_product_inventory.title') }}</h1>
        <p class="sd-modern-subtitle">{{ $t('b_product_inventory.subtitle') }}</p>
      </div>
      <div class="sd-modern-actions">
        <v-btn v-if="hasVariants && !add_by_dropShipping" class="sd-modern-button" color="primary" variant="flat" prepend-icon="add" @click="showEdit()">
          {{ $t('product_admin.inventory.variants.add_action') }}
        </v-btn>
        <u-smart-menu v-if="hasVariants || product_variants.length" :items="inventory_menu" :with-trashed="withTrashed" has-with-trashed @update:withTrashed="(val) => $emit('update:withTrashed', val)" />
      </div>
    </header>
    <!-- ----------------------- Physical------------------------ -->

    <div v-if="modern && productWorkspace && add_by_dropShipping" class="sd-modern-notice" role="status">
      <v-icon class="sd-modern-notice__icon" aria-hidden="true">link</v-icon>
      <span class="sd-modern-notice__content">{{ $t('add_product.inventory_modern.supplier_hint') }}</span>
    </div>
    <component :is="modern && productWorkspace ? 'details' : 'div'" :class="modern ? 'sd-modern-widget b-product-inventory-refined__options' : 'widget-box -large mb-5'">
      <summary v-if="modern && productWorkspace" class="b-product-inventory-refined__summary">
        <v-icon aria-hidden="true">tune</v-icon>
        <span class="b-product-inventory-refined__summary-copy">
          <span class="b-product-inventory-refined__summary-title">{{ $t('add_product.inventory_modern.options_title') }}</span>
          <span class="b-product-inventory-refined__digest">{{ options_digest }}</span>
        </span>
        <v-icon class="b-product-inventory-refined__chevron" aria-hidden="true">expand_more</v-icon>
      </summary>
      <div :class="{ 'b-product-inventory-refined__options-body': modern && productWorkspace }">
      <p v-if="modern && productWorkspace" class="b-product-inventory-refined__help">{{ $t('add_product.inventory_modern.options_intro') }}</p>
      <header v-if="modern && !productWorkspace" class="sd-modern-header b-product-inventory-refined__section-header">
        <div>
          <h2>{{ $t('b_product_inventory.options_title') }}</h2>
          <p class="sd-modern-subtitle">{{ $t('b_product_inventory.options_subtitle') }}</p>
        </div>
        <v-btn class="sd-modern-button sd-modern-button--small" variant="text" size="small" prepend-icon="edit" @click="edit_property_set_dialog = true">
          {{ product.property_set?.title || $t('b_product_inventory.default_property_set') }}
        </v-btn>
      </header>
      <u-widget-header
        v-if="!modern"
        :add-caption="
          hasVariants && !add_by_dropShipping
            ? $t('product_admin.inventory.variants.add_action')
            : null
        "
        :title="$t('product_admin.inventory.variants.title')"
        icon="fa:fas fa-cubes-stacked"
        @click:add="showEdit()"
      >
        <template v-if="hasVariants || product_variants.length" v-slot:actions>
          <u-smart-menu
            :items="inventory_menu"
            :with-trashed="withTrashed"
            class="mt-1 ms-2"
            has-with-trashed
            @update:withTrashed="(val) => $emit('update:withTrashed', val)"
          >
          </u-smart-menu>
        </template>
      </u-widget-header>

      <v-list-subheader v-if="!modern"
        >{{ $t("product_admin.inventory.variants.sub_title") }}

      </v-list-subheader>

      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Variants ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <div
        :class="[modern ? 'b-product-inventory-refined__attributes' : 'd-flex flex-wrap h--border-dash-long pa-2 position-relative', { disabled: add_by_dropShipping }]"
        :style="modern ? undefined : 'border-radius: 8px'"
      >
        <v-chip
          v-if="!modern"
          style="right: 12px; top: -10px; z-index: 1"
          class="position-absolute hover-scale-tiny"
          color="#000"
          size="x-small"
          variant="flat"
          @click="edit_property_set_dialog = true"
          prepend-icon="edit"
        >
          {{
            product.property_set
              ? product.property_set.title
              : "Default Property Set"
          }}
        </v-chip>

        <b-product-variants-option-button
          v-model="has_color"
          :product="product"
          :modern="modern"
          :disabled="modern && add_by_dropShipping"
          variant-code="color"
          @update:model-value="reassign"
        >
        </b-product-variants-option-button>

        <b-product-variants-option-button
          v-model="has_style"
          :product="product"
          :modern="modern"
          :disabled="modern && add_by_dropShipping"
          variant-code="style"
          @update:model-value="reassign"
        >
        </b-product-variants-option-button>

        <b-product-variants-option-button
          v-model="has_volume"
          :product="product"
          :modern="modern"
          :disabled="modern && add_by_dropShipping"
          variant-code="volume"
          @update:model-value="reassign"
        >
        </b-product-variants-option-button>

        <b-product-variants-option-button
          v-model="has_weight"
          :product="product"
          :modern="modern"
          :disabled="modern && add_by_dropShipping"
          variant-code="weight"
          @update:model-value="reassign"
        >
        </b-product-variants-option-button>

        <b-product-variants-option-button
          v-model="has_pack"
          :product="product"
          :modern="modern"
          :disabled="modern && add_by_dropShipping"
          variant-code="pack"
          @update:model-value="reassign"
        >
        </b-product-variants-option-button>

        <b-product-variants-option-button
          v-model="has_type"
          :product="product"
          :modern="modern"
          :disabled="modern && add_by_dropShipping"
          variant-code="type"
          @update:model-value="reassign"
        >
        </b-product-variants-option-button>
      </div>
      <template v-if="modern && productWorkspace">
        <div class="b-product-inventory-refined__property">
          <div><span class="b-product-inventory-refined__help">{{ $t('add_product.inventory_modern.property_set') }}</span><span>{{ property_set_title }}</span></div>
          <v-btn class="sd-modern-button sd-modern-button--inline" variant="text" prepend-icon="edit" @click="edit_property_set_dialog = true">{{ $t('add_product.inventory_modern.change') }}</v-btn>
        </div>
        <p class="b-product-inventory-refined__help b-product-inventory-refined__options-scope">{{ $t('add_product.inventory_modern.options_scope') }}</p>
      </template>
      </div>
    </component>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Variants List ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <div
      v-if="hasVariants || product_variants.length"
      :class="modern ? 'sd-modern-widget sd-modern-data-table b-product-inventory-refined__list' : 'widget-box -large'"
    >
      <header v-if="modern" class="sd-modern-header b-product-inventory-refined__section-header">
        <div>
          <h2>{{ $t('b_product_inventory.variants_title') }} <span class="b-product-inventory-refined__count">{{ product_variants.length }}</span></h2>
          <p class="sd-modern-subtitle">{{ $t('b_product_inventory.variants_hint') }}</p>
        </div>
        <div v-if="productWorkspace" class="sd-modern-actions b-product-inventory-refined__list-actions">
          <v-btn v-if="hasVariants && !add_by_dropShipping" class="sd-modern-button sd-modern-button--primary" color="primary" variant="elevated" prepend-icon="add" @click="showEdit()">{{ $t('product_admin.inventory.variants.add_action') }}</v-btn>
          <u-smart-menu modern icon="more_horiz" :title="$t('add_product.inventory_modern.more_tools')" :items="inventory_menu" :with-trashed="withTrashed" has-with-trashed @update:withTrashed="(val) => $emit('update:withTrashed', val)" />
        </div>
      </header>
      <div v-if="modern" class="sd-modern-list-header b-product-inventory-refined__columns" aria-hidden="true">
        <span>{{ $t('b_product_inventory.identifiers') }}</span>
        <span>{{ $t('b_product_inventory.options_title') }}</span>
        <span>{{ $t(productWorkspace ? 'b_product_inventory.base_price' : 'b_product_inventory.pricing') }}</span>
        <span>{{ $t('b_product_inventory.in_stock') }}</span>
        <span>{{ $t('b_product_inventory.availability') }}</span>
        <span class="text-end">{{ $t('global.commons.actions') }}</span>
      </div>
      <v-fade-transition group hide-on-leave>
        <b-product-variant-item
          v-for="product_variant in paged_variants"
          :key="product_variant.id"
          ref="variant_items_list"
          :product="product"
          :product-variant="product_variant"
          :modern="modern"
          :product-workspace="productWorkspace"
          :validate-variants="validate_variants"
          has-delete
          @delete="
            withTrashed
              ? undefined
              : DeleteItemByID(product_variants, product_variant.id)
          "
          @restore="
            (_variant) => AddOrUpdateItemByID(product_variants, _variant)
          "
          @select="showEdit(product_variant)"
        />
      </v-fade-transition>

      <div
        v-if="!modern && !product_variants.length"
        class="text-h4 font-weight-light py-5 text-muted text-center fadeIn"
      >
        This product doesn't have any variants currently. Please select
        <b>Add Variant</b> or use the <b>⋮ Menu > Bulk Add</b> option to create
        new variants.
      </div>

      <p v-if="modern && !product_variants.length" class="b-product-inventory-refined__empty">{{ $t('b_product_inventory.empty') }}</p>
      <footer v-if="modern" class="sd-modern-table-footer b-product-inventory-refined__footer">
        <span>{{ $t('b_product_inventory.variant_count', { count: product_variants.length }) }}</span>
        <div class="b-product-inventory-refined__pagination">
          <v-select v-model="page_size" :items="[10, 20, 50]" :label="$t('b_product_dashboard.identity.per_page')" density="compact" variant="outlined" hide-details />
          <v-pagination v-model="page" :length="Math.max(1, pages_count)" :total-visible="3" class="sd-modern-pagination" density="comfortable" variant="text" />
        </div>
      </footer>
      <v-pagination
        v-if="!modern && pages_count > 1"
        v-model="page"
        :length="pages_count"
        rounded
        variant="text"
      ></v-pagination>
    </div>
    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ No variant Mode ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <div v-if="!hasVariants" :class="modern ? 'sd-modern-widget b-product-inventory-refined__quantity' : 'widget-box -large my-5'">
      <header v-if="modern && productWorkspace" class="sd-modern-header b-product-inventory-refined__section-header"><div><h2><v-icon aria-hidden="true">inventory_2</v-icon>{{ $t('add_product.inventory_modern.product_stock') }}</h2></div></header>
      <u-widget-header
        v-else
        :title="$t('global.commons.inventory')"
        icon="shelves"
      ></u-widget-header>

      <component :is="modern && productWorkspace ? 'p' : 'VListSubheader'" :class="{ 'b-product-inventory-refined__help b-product-inventory-refined__stock-help': modern && productWorkspace }">
        {{
          add_by_dropShipping
            ? $t("product_inventory_management_physical.subtitle.dropshipping")
            : is_marketplace
              ? $t("product_inventory_management_physical.subtitle.marketplace")
              : $t(modern && productWorkspace ? 'add_product.inventory_modern.stock_hint' : "product_inventory_management_physical.subtitle.default")
        }}
      </component>

      <div :class="modern && productWorkspace ? 'b-product-inventory-refined__stock-input' : 'max-widget-width mx-auto'">
        <u-number-input
          v-model="quantity"
          :disabled="add_by_dropShipping || is_marketplace"
          :label="$t('product_admin.inventory.variants.count_input')"
          :min="0"
          :decimal="unit_float?3:0"
          :class="modern && productWorkspace ? 'sd-modern-underlined-field' : 'strong-field mt-5'"
          show-buttons
        >
        </u-number-input>
      </div>

      <div v-if="is_marketplace" class="pa-2">
        <v-icon class="me-1">info_outline</v-icon>
        Change inventory in the
        <b>
          <router-link
            :to="{
              name: IS_VENDOR_PANEL
                ? 'Vendor_ProductPage_Vendors'
                : 'BPageProductVendors',
              params: product ? { product_id: product.id } : undefined,
            }"
            >Vendors
          </router-link>
        </b>
        tab.
      </div>

      <div
        v-if="!(add_by_dropShipping || is_marketplace)"
        class="widget-buttons"
      >
        <v-btn
          :class="{ 'sd-modern-button sd-modern-button--primary': modern && productWorkspace }"
          :loading="busy_count"
          :variant="modern && productWorkspace ? 'elevated' : quantity === old_quantity ? 'text' : 'elevated'"
          color="primary"
          :size="modern && productWorkspace ? undefined : 'x-large'"
          @click.stop="setDefaultQuantity"
        >
          <v-icon start>save</v-icon>
          {{ $t("product_admin.inventory.variants.count_input_action") }}
        </v-btn>
      </div>
    </div>
  </div>

  <!-- ███████████████████████ Dialog > Add/Edit ███████████████████████ -->

  <v-dialog
    v-model="dialog"
    fullscreen
    scrollable
    transition="dialog-bottom-transition"
  >
    <b-product-variant-add
      v-if="dialog_pre"
      :for-studio="forStudio"
      :modern="modern"
      :has-color="has_color"
      :has-pack="has_pack"
      :has-style="has_style"
      :has-type="has_type"
      :has-volume="has_volume"
      :has-weight="has_weight"
      :loading="busy_save"
      :product="product"
      :product-variant="current_item"
      :shop="shop"
      :vendor="vendor"
      @add="addOrUpdateProductVariant"
      @close="
        dialog = false;
        $route.query.variant_id && (!productWorkspace || $route.params.product_id)
          ? $router.replace({
              query: null,
              ...(productWorkspace ? { hash: $route.hash } : {}),
            })
          : undefined;
      "
      @update="addOrUpdateProductVariant"
    />
  </v-dialog>

  <!-- ███████████████████████ Dialog > Add Bulk ███████████████████████ -->

  <b-product-variants-bulk-add
    v-model="dialog_bulk"
    :modern="modern"
    :initial-variant-types="validate_variants"
    :product="product"
    :shop="shop"
    :vendor="vendor"
    @add="(items) => onUpdateVariants(...items)"
  ></b-product-variants-bulk-add>

  <!-- ███████████████████████ Dialog > Set Property Set ███████████████████████ -->

  <b-property-set-product-dialog
    v-model="edit_property_set_dialog"
    :modern="modern"
  ></b-property-set-product-dialog>
</template>

<script lang="ts">
import BProductVariantItem from "../../../variants/item/BProductVariantItem.vue";
import BProductVariantAdd from "../../../variants/add/BProductVariantAdd.vue";
import UNumberInput from "../../../../../ui/number/input/UNumberInput.vue";
import { BusinessModel } from "@selldone/core-js/enums/shop/BusinessModel";

import USmartMenu from "../../../../../ui/smart/menu/USmartMenu.vue";
import {
  GetVariantIconByCode,
  GetVariantNameByCode,
  ProductVariants,
} from "@selldone/core-js/enums/product/ProductVariants";
import BProductVariantsBulkAdd from "../../../../product/variants/bulk-add/BProductVariantsBulkAdd.vue";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import BProductVariantsOptionButton from "@selldone/components-vue/backoffice/product/variants/option-button/BProductVariantsOptionButton.vue";
import BPropertySetProductDialog from "@selldone/components-vue/backoffice/property-set/product/BPropertySetProductDialog.vue";

export default {
  name: "BProductInventoryManagementPhysical",
  mixins: [],
  components: {
    BPropertySetProductDialog,
    BProductVariantsOptionButton,
    BProductVariantsBulkAdd,

    USmartMenu,

    UNumberInput,
    BProductVariantAdd,
    BProductVariantItem,
  },
  props: {
    modern: { type: Boolean, default: false },
    productWorkspace: { type: Boolean, default: false },
    shop: {
      required: true,
      type: Object,
    },
    vendor: {
      /*🟢 Vendor Panel 🟢*/ required: false,
    },
    product: {
      required: true,
      type: Object,
    },
    forStudio: {
      default: false,
      type: Boolean,
    },

    withTrashed: {
      default: false,
      type: Boolean,
    },

    variantsCountPerPage: {
      type: Number,
      default: 10,
    },
  },
  data() {
    return {
      ProductVariants: ProductVariants,
      GetVariantNameByCode: GetVariantNameByCode,
      GetVariantIconByCode: GetVariantIconByCode,

      page: 1,
      page_size: this.variantsCountPerPage,
      product_variants: [],

      // Enable variants:
      has_color: false,
      has_style: false,
      has_volume: false,
      has_weight: false,
      has_pack: false,
      has_type: false,

      rowsPerPageItems: [4, 8, 12],
      pagination: {
        rowsPerPage: 4,
        sortBy: "",
      },

      current_item: null,

      quantity: 0,
      old_quantity: 0,

      dialog: false,
      dialog_pre: false,

      busy_count: false,
      busy_save: false,

      dialog_bulk: false,

      //--------------------------
      edit_property_set_dialog: false,
    };
  },

  computed: {
    workspaceBusy() {
      return this.busy_count || this.busy_save;
    },
    saveBlocked() {
      return this.dialog || this.dialog_bulk || this.edit_property_set_dialog;
    },
    property_set_title() {
      return this.product.property_set?.title || this.$t('b_product_inventory.default_property_set');
    },
    options_digest() {
      const names = this.validate_variants.map((key) => this.$t(GetVariantNameByCode(key, this.product)));
      return [names.length ? names.join(' · ') : this.$t('add_product.inventory_modern.no_options'), this.property_set_title].join(' · ');
    },
    inventory_menu() {
      return [
        {
          title: this.$t('product_inventory_management_physical.menu.add_bulk.title'),
          subtitle: this.$t('product_inventory_management_physical.menu.add_bulk.subtitle'),
          icon: 'auto_fix_high',
          disabled: this.add_by_dropShipping,
          click: () => this.showBulkAdd(),
        },
        {
          title: this.$t('product_inventory_management_physical.menu.edit_property_set.title'),
          subtitle: this.$t('product_inventory_management_physical.menu.edit_property_set.subtitle'),
          icon: 'app_registration',
          click: () => { this.edit_property_set_dialog = true; },
        },
      ];
    },
    page_limit() {
      return this.modern ? this.page_size : this.variantsCountPerPage;
    },
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    hasVariants() {
      return (
        this.has_color ||
        this.has_style ||
        this.has_volume ||
        this.has_weight ||
        this.has_pack ||
        this.has_type ||
        (this.product_variants && this.product_variants.length)
      );
    },

    add_by_dropShipping() {
      return !!this.product.parent_id;
    },
    is_marketplace() {
      return this.shop.model === BusinessModel.MARKETPLACE.code;
    },

    validate_variants() {
      const out = [];
      if (this.has_color) out.push("color");
      if (this.has_style) out.push("style");
      if (this.has_volume) out.push("volume");
      if (this.has_weight) out.push("weight");
      if (this.has_pack) out.push("pack");
      if (this.has_type) out.push("type");
      return out;
    },

    pages_count() {
      return Math.ceil(this.product_variants.length / this.page_limit);
    },
    paged_variants() {
      return this.product_variants.slice((this.page - 1) * this.page_limit, this.page * this.page_limit);
    },
    unit_float(){
      return this.product.unit_float
    },
  },

  watch: {
    page_size() {
      if (this.modern) this.page = 1;
    },
    variantsCountPerPage(value) {
      this.page_size = value;
      this.clampPage();
    },
    'product_variants.length'() {
      this.clampPage();
    },
    // Update route to keep variant (Can open variant directly by the url)
    current_item(current_item) {
      if (this.productWorkspace && !this.$route.params.product_id) return;
      if (!current_item && !this.$route.query.variant_id) return;

      if (
        current_item &&
        this.getId(this.$route.query.variant_id) === current_item.id
      )
        return;
      this.$router.replace({
        query: current_item ? { variant_id: current_item.id } : null,
        ...(this.productWorkspace ? { hash: this.$route.hash } : {}),
      });
    },
  },
  created() {
    this.quantity = this.product.quantity;
    this.old_quantity = this.quantity;

    this.product_variants = this.product.product_variants;
    if (!this.product_variants) this.product_variants = [];

    if (this.product_variants.length > 0) {
      this.has_color = this.product_variants.some((v) => v.color);
      this.has_style = this.product_variants.some((v) => v.style);
      this.has_volume = this.product_variants.some((v) => v.volume);
      this.has_weight = this.product_variants.some((v) => v.weight);
      this.has_pack = this.product_variants.some((v) => v.pack);
      this.has_type = this.product_variants.some((v) => v.type);
    }

    // Auto open variant by query parameter:
    if (this.$route.query.variant_id && (!this.productWorkspace || this.$route.params.product_id)) {
      this.current_item = this.product_variants.find(
        (item) => item.id === Number(this.$route.query.variant_id),
      );
      if (this.current_item) {
        this.dialog_pre = true;
        this.dialog = true;
      }
    }
  },
  methods: {
    clampPage() {
      if (this.modern) this.page = Math.max(1, Math.min(this.page, this.pages_count || 1));
    },
    reassign() {
      let list = [];
      this.product_variants.forEach((item) => {
        // Color
        if (this.has_color && !item.color) item.color = "#000";
        if (!this.has_color && item.color) delete item["color"];

        // Style
        if (this.has_style && !item.style) item.style = "-";
        if (!this.has_style && item.style) delete item["style"];

        // Volume
        if (this.has_volume && !item.volume) item.volume = "0 ml";
        if (!this.has_volume && item.volume) delete item["volume"];

        // Weight
        if (this.has_weight && !item.weight) item.weight = "0 gr";
        if (!this.has_weight && item.weight) delete item["weight"];

        // Color
        if (this.has_pack && !item.pack) item.pack = "1";
        if (!this.has_pack && item.pack) delete item["pack"];

        // Type
        if (this.has_type && !item.type) item.type = "-";
        if (!this.has_type && item.type) delete item["type"];

        list.push(item);
      });
      //console.log("------------");

      //this.product_variants =list;

      this.product_variants = [];
      this.$nextTick(() => {
        this.product_variants = list;
      });

      /*if (this.$refs.variant_items_list)
        this.$refs.variant_items_list.forEach((item) => {
          item.$forceUpdate();
          console.log("ok");
        });*/
    },

    //――――――――――――――――――――――― Variant ▶ Add ―――――――――――――――――――――――

    addOrUpdateProductVariant(variant) {
      this.busy_save = true;

      let url = null;

      if (this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/) {
        url = variant.id
          ? window.VAPI.POST_MY_VENDOR_EDIT_VARIANT(
              this.product.vendor_id,
              this.product.id,
              variant.id,
            )
          : window.VAPI.POST_MY_VENDOR_ADD_VARIANT(
              this.product.vendor_id,
              this.product.id,
            );
      } else {
        url = variant.id
          ? window.API.POST_EDIT_VARIANT(
              this.product.shop_id,
              this.product.id,
              variant.id,
            )
          : window.API.POST_ADD_VARIANT(this.product.shop_id, this.product.id);
      }

      axios
        .post(url, variant)
        .then(async ({ data }) => {
          if (!data.error) {
            this.product.variants = data.variants;
            this.product.quantity = data.quantity;

            // Update:
            this.onUpdateVariants(data.product_variant);

            await this.uploadVariantImage(
              data.product_variant,
              variant._ATTACHED_IMAGE_FILE,
            );

            this.dialog = false;

            NotificationService.showSuccessAlert(
              null,
              this.$t(
                "product_admin.inventory.variants.notifications.add_success",
              ),
            );

            this.$forceUpdate(); // Update vue component!
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_save = false;
        });
    },

    onUpdateVariants(...product_variants) {
      // Fix main product variants:
      if (
        !this.product.product_variants ||
        !Array.isArray(this.product.product_variants)
      ) {
        this.product.product_variants = [];
      }

      // Update in local list:
      product_variants.forEach((product_variant) => {
        this.AddOrUpdateItemByID(this.product_variants, product_variant);
        // Update in main product:
        this.AddOrUpdateItemByID(
          this.product.product_variants,
          product_variant,
        );
      });

      this.product_variants = this.product.product_variants;
    },

    uploadVariantImage(variant, attached_image_file) {
      if (!variant.id || !attached_image_file) return;

      let formData = new FormData();

      formData.append("photo", attached_image_file);

      let url;
      if (this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/) {
        url = window.VAPI.POST_MY_VENDOR_UPLOAD_PRODUCT_COVER(
          this.vendor.id,
          this.product.id,
          variant.id,
        );
      } else {
        url = window.API.POST_UPLOAD_PRODUCT_COVER(
          this.shop.id,
          this.product.id,
          variant.id,
        );
      }

      return axios
        .post(url, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then(({ data }) => {
          if (data.files?.path) variant.image = data.files.path;
          this.onUpdateVariants(Object.assign({}, variant)); // Force update!
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        });
    },

    //――――――――――――――――――――――― Simple Quantity ―――――――――――――――――――――――

    setDefaultQuantity() {
      this.busy_count = true;

      (this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
        ? window.$vendor.product.setQuantity(
            this.product.vendor_id,
            this.product.id,
            this.quantity,
          )
        : window.$backoffice.product.setQuantity(
            this.product.shop_id,
            this.product.id,
            this.quantity,
          )
      )

        .then(({ quantity }) => {
          NotificationService.showSuccessAlert(
            null,
            this.$t(
              "product_admin.inventory.variants.notifications.save_product_inventory_success",
            ),
          );
          this.product.quantity = quantity;
          this.old_quantity = this.quantity;

          this.$forceUpdate(); // Update vue component!
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_count = false;
        });
    },

    showEdit(product_variant) {
      this.current_item = product_variant;
      this.dialog_pre = false;
      this.$nextTick(() => {
        this.dialog_pre = true;
        this.$nextTick(() => {
          this.dialog = true;
        });
      });
    },

    showBulkAdd() {
      this.dialog_bulk = true;
    },
  },
};
</script>

<style lang="scss" scoped>
.b-product-inventory-refined {
  display: grid;
  gap: 16px;
  font-size: 13px;
  line-height: 20px;
  font-weight: 400;
  --inventory-columns: minmax(150px, 1.35fr) minmax(125px, 1fr) minmax(175px, 1.5fr) minmax(75px, .65fr) minmax(95px, .8fr) 76px;

  &__header { margin: 0 0 2px; align-items: center; }
  &__header h1 { margin: 0; font-size: 23px; font-weight: 500; line-height: 30px; }
  &__header .sd-modern-subtitle { margin-block-start: 5px; }
  .sd-modern-widget { padding: 18px; border-radius: 14px; }
  &__section-header { gap: 12px; align-items: center; margin-block-end: 15px; }
  &__section-header h2 { margin: 0; font-size: 16px; font-weight: 500; line-height: 22px; }
  &__section-header .sd-modern-subtitle { margin-block-start: 3px; font-size: 12px; line-height: 18px; }
  &__count { font-size: 12px; color: var(--sd-modern-muted); font-weight: 400; margin-inline-start: 5px; }
  &__attributes { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 8px; }
  &__columns { display: grid; grid-template-columns: var(--inventory-columns); gap: 12px; padding: 0 12px 9px; border-block-end: 1px solid var(--sd-modern-border); }
  &__empty { margin: 0; padding: 30px 12px; text-align: center; color: var(--sd-modern-muted); }
  &__footer { margin-block-start: 10px; padding-block-start: 12px; font-size: 12px; gap: 12px; }
  &__pagination { display: flex; align-items: center; gap: 12px; }
  &__pagination .v-select { width: 90px; flex: 0 0 90px; }
  &__quantity { margin: 0; }
  &__quantity .v-list-subheader { min-height: 0; padding-inline: 0; }
  &__quantity .widget-buttons { margin-block-end: 0; }

  @media (max-width: 1100px) {
    --inventory-columns: minmax(135px, 1.2fr) minmax(110px, 1fr) minmax(150px, 1.4fr) 65px 85px 64px;
  }
  @media (max-width: 959px) {
    &__attributes { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    &__columns { display: none; }
  }
  @media (max-width: 599px) {
    .sd-modern-widget { padding: 12px; }
    &__header, &__section-header { align-items: flex-start; flex-wrap: wrap; }
    &__header .sd-modern-actions { width: 100%; }
    &__attributes { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    &__footer { align-items: flex-start; flex-direction: column; }
    &__pagination { width: 100%; justify-content: space-between; gap: 4px; }
    &__pagination :deep(.v-pagination__item), &__pagination :deep(.v-pagination__prev), &__pagination :deep(.v-pagination__next) { margin-inline: 0; }
    &__header :deep(.v-btn), &__section-header :deep(.v-btn) { min-height: 44px; }
  }
}

.b-product-inventory-refined--workspace {
  --sd-modern-icon-button-size: 32px;
  container: product-inventory / inline-size;
  min-width: 0;
  gap: 18px;
  --inventory-action-width: 72px;
  --inventory-columns: minmax(125px, 1.45fr) minmax(96px, 1.05fr) minmax(80px, .95fr) minmax(48px, .55fr) minmax(62px, .7fr) var(--inventory-action-width);

  .sd-modern-widget { padding: 23px; border-radius: 16px; }
  .b-product-inventory-refined__options { padding: 0; }
  .b-product-inventory-refined__summary {
    display: flex;
    align-items: center;
    gap: 13px;
    min-height: 84px;
    padding: 18px 23px;
    box-sizing: border-box;
    list-style: none;
    cursor: pointer;
  }
  .b-product-inventory-refined__summary::-webkit-details-marker { display: none; }
  .b-product-inventory-refined__summary > .v-icon { font-size: 18px; color: var(--sd-modern-muted); }
  .b-product-inventory-refined__summary-copy { display: flex; flex: 1; min-width: 0; flex-direction: column; gap: 3px; }
  .b-product-inventory-refined__summary-title { font-size: 14px; font-weight: 500; line-height: 21px; }
  .b-product-inventory-refined__digest { font-size: 12px; line-height: 18px; color: var(--sd-modern-muted); overflow-wrap: anywhere; }
  .b-product-inventory-refined__chevron { font-size: 16px !important; }
  .b-product-inventory-refined__options[open] > .b-product-inventory-refined__summary { min-height: 69px; padding-block-end: 14px; }
  .b-product-inventory-refined__options[open] .b-product-inventory-refined__summary-title { font-size: 16px; line-height: 24px; }
  .b-product-inventory-refined__options[open] .b-product-inventory-refined__digest { display: none; }
  .b-product-inventory-refined__options[open] .b-product-inventory-refined__chevron { transform: rotate(180deg); }
  .b-product-inventory-refined__options-body { padding: 0 23px 23px; box-sizing: border-box; }
  .b-product-inventory-refined__help { margin: 0; font-size: 12px; line-height: 20px; color: var(--sd-modern-muted); }
  .b-product-inventory-refined__attributes { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px 18px; margin-block-start: 17px; }
  .b-product-inventory-refined__property { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-block-start: 19px; }
  .b-product-inventory-refined__property > div { display: grid; gap: 3px; min-width: 0; font-size: 13px; line-height: 20px; overflow-wrap: anywhere; }
  .b-product-inventory-refined__options-scope { margin-block-start: 18px; }
  .b-product-inventory-refined__section-header { gap: 15px; align-items: flex-start; margin-block-end: 23px; }
  .b-product-inventory-refined__section-header h2 { font-size: 16px; line-height: 24px; font-weight: 500; display: flex; align-items: center; gap: 9px; }
  .b-product-inventory-refined__section-header h2 > .v-icon { font-size: 18px; color: var(--sd-modern-muted); }
  .b-product-inventory-refined__section-header .sd-modern-subtitle { margin-block-start: 5px; font-size: 12px; line-height: 20px; }
  .b-product-inventory-refined__list-actions { flex: 0 0 auto; flex-wrap: nowrap; gap: 9px; }
  .b-product-inventory-refined__list-actions :deep(.sd-modern-icon-button .v-icon) { font-size: 16px; }
  .b-product-inventory-refined__columns { display: grid; grid-template-columns: var(--inventory-columns); gap: 10px; padding: 0 12px 10px; }
  .b-product-inventory-refined__footer { margin-block-start: 4px; padding-block-start: 15px; font-size: 11px; line-height: 18px; }
  .b-product-inventory-refined__quantity { display: grid; grid-template-columns: minmax(0, 260px) max-content; gap: 20px; align-items: end; }
  .b-product-inventory-refined__quantity > header, .b-product-inventory-refined__stock-help { grid-column: 1 / -1; }
  .b-product-inventory-refined__quantity > header { margin: 0; }
  .b-product-inventory-refined__quantity > .widget-buttons { margin: 0; }
  .b-product-inventory-refined__stock-input { min-width: 0; }

  @media (pointer: coarse) { --inventory-action-width: 96px; }
}

@container product-inventory (max-width: 720px) {
  .b-product-inventory-refined--workspace .b-product-inventory-refined__columns {
    grid-template-columns: minmax(110px, 1.3fr) minmax(80px, 1fr) minmax(78px, .9fr) minmax(54px, .6fr) var(--inventory-action-width);
    > span:nth-child(5) { display: none; }
  }
  .b-product-inventory-refined--workspace .b-product-inventory-refined__section-header { flex-wrap: wrap; }
  .b-product-inventory-refined--workspace .b-product-inventory-refined__list-actions { margin-inline-start: auto; }
}

@container product-inventory (max-width: 650px) {
  .b-product-inventory-refined--workspace .b-product-inventory-refined__columns { display: none; }
  .b-product-inventory-refined--workspace .b-product-inventory-refined__attributes { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@container product-inventory (max-width: 520px) {
  .b-product-inventory-refined--workspace {
    .sd-modern-widget { padding-inline: 19px; }
    .b-product-inventory-refined__options { padding: 0; }
    .b-product-inventory-refined__summary { padding-inline: 19px; }
    .b-product-inventory-refined__options-body { padding-inline: 19px; }
    .b-product-inventory-refined__section-header { margin-block-end: 15px; }
    .b-product-inventory-refined__quantity { grid-template-columns: minmax(0, 1fr); }
    .b-product-inventory-refined__quantity > .widget-buttons { justify-self: end; }
    .b-product-inventory-refined__footer { align-items: flex-start; flex-wrap: wrap; }
    .b-product-inventory-refined__pagination { margin-inline-start: auto; flex-wrap: wrap; justify-content: flex-end; }
  }
}

@container product-inventory (max-width: 300px) {
  .b-product-inventory-refined--workspace {
    .sd-modern-widget { padding-inline: 15px; }
    .b-product-inventory-refined__options { padding: 0; }
    .b-product-inventory-refined__summary { padding-inline: 15px; gap: 9px; }
    .b-product-inventory-refined__options-body { padding-inline: 15px; }
  }
}
</style>
