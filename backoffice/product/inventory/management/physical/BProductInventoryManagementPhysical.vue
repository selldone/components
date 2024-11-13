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
  <div v-bind="$attrs">
    <!-- ----------------------- Physical------------------------ -->

    <div class="widget-box -large mb-5">
      <u-widget-header
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
            :items="[
              {
                title: $t(
                  'product_inventory_management_physical.menu.add_bulk.title',
                ),
                subtitle: $t(
                  'product_inventory_management_physical.menu.add_bulk.subtitle',
                ),
                icon: 'auto_fix_high',
                disabled: add_by_dropShipping,
                click: () => showBulkAdd(),
              },
            ]"
            :with-trashed="withTrashed"
            class="mt-1 ms-2"
            has-with-trashed
            @update:withTrashed="(val) => $emit('update:withTrashed', val)"
          >
          </u-smart-menu>
        </template>
      </u-widget-header>

      <v-list-subheader
        >{{ $t("product_admin.inventory.variants.sub_title") }}

        <s-widget-help
          code="Product.Variants.AddBulkVariants"
          inline
        ></s-widget-help>
      </v-list-subheader>

      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Variants ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <div :class="{ disabled: add_by_dropShipping }">
        <v-btn
          :color="has_color ? '#222' : '#aaa'"
          class="m-1 tnt"
          @click="
            () => {
              has_color = !has_color;
              reassign();
            }
          "
        >
          <v-icon start>
            {{ ProductVariants.color.icon }}
          </v-icon>
          {{ $t(ProductVariants.color.name) }}
        </v-btn>

        <v-btn
          :color="has_style ? '#222' : '#aaa'"
          class="m-1 tnt"
          @click="
            () => {
              has_style = !has_style;
              reassign();
            }
          "
        >
          <v-icon start>
            {{ ProductVariants.style.icon }}
          </v-icon>

          {{ $t(ProductVariants.style.name) }}
        </v-btn>

        <v-btn
          :color="has_volume ? '#222' : '#aaa'"
          class="m-1 tnt"
          @click="
            () => {
              has_volume = !has_volume;
              reassign();
            }
          "
        >
          <v-icon start>
            {{ ProductVariants.volume.icon }}
          </v-icon>

          {{ $t(ProductVariants.volume.name) }}
        </v-btn>

        <v-btn
          :color="has_weight ? '#222' : '#aaa'"
          class="m-1 tnt"
          @click="
            () => {
              has_weight = !has_weight;
              reassign();
            }
          "
        >
          <v-icon start>
            {{ ProductVariants.weight.icon }}
          </v-icon>

          {{ $t(ProductVariants.weight.name) }}
        </v-btn>

        <v-btn
          :color="has_pack ? '#222' : '#aaa'"
          class="m-1 tnt"
          @click="
            () => {
              has_pack = !has_pack;
              reassign();
            }
          "
        >
          <v-icon start>
            {{ ProductVariants.pack.icon }}
          </v-icon>

          {{ $t(ProductVariants.pack.name) }}
        </v-btn>

        <v-btn
          :color="has_type ? '#222' : '#aaa'"
          class="m-1 tnt"
          @click="
            () => {
              has_type = !has_type;
              reassign();
            }
          "
        >
          <v-icon start>
            {{ ProductVariants.type.icon }}
          </v-icon>

          {{ $t(ProductVariants.type.name) }}
        </v-btn>
      </div>
    </div>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Variants List ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <div
      v-if="hasVariants || product_variants.length"
      class="widget-box -large"
    >
      <v-fade-transition group hide-on-leave>
        <b-product-variant-item
          v-for="product_variant in paged_variants"
          :key="product_variant.id"
          ref="variant_items_list"
          :product="product"
          :product-variant="product_variant"
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
        v-if="!product_variants.length"
        class="text-h4 font-weight-light py-5 text-muted text-center fadeIn"
      >
        This product doesn't have any variants currently. Please select
        <b>Add Variant</b> or use the <b>⋮ Menu > Bulk Add</b> option to create
        new variants.
      </div>

      <v-pagination
        v-if="pages_count > 1"
        v-model="page"
        :length="pages_count"
        rounded
        variant="text"
      ></v-pagination>
    </div>
    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ No variant Mode ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <div v-if="!hasVariants" class="widget-box -large my-5">
      <u-widget-header
        :title="$t('global.commons.inventory')"
        icon="shelves"
      ></u-widget-header>

      <v-list-subheader>
        {{
          add_by_dropShipping
            ? $t("product_inventory_management_physical.subtitle.dropshipping")
            : is_marketplace
              ? $t("product_inventory_management_physical.subtitle.marketplace")
              : $t("product_inventory_management_physical.subtitle.default")
        }}
      </v-list-subheader>

      <div class="max-widget-width mx-auto">
        <u-number-input
          v-model="quantity"
          :disabled="add_by_dropShipping || is_marketplace"
          :label="$t('product_admin.inventory.variants.count_input')"
          :min="0"
          class="strong-field mt-5"
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
          :loading="busy_count"
          :variant="quantity === old_quantity ? 'text' : 'elevated'"
          color="primary"
          size="x-large"
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
        $route.query.variant_id
          ? $router.replace({
              query: null,
            })
          : undefined;
      "
      @update="addOrUpdateProductVariant"
    />
  </v-dialog>

  <!-- ███████████████████████ Dialog > Add Bulk ███████████████████████ -->

  <b-product-variants-bulk-add
    v-model="dialog_bulk"
    :initial-variant-types="validate_variants"
    :product="product"
    :shop="shop"
    :vendor="vendor"
    @add="(items) => onUpdateVariants(...items)"
  ></b-product-variants-bulk-add>
</template>

<script lang="ts">
import BProductVariantItem from "../../../variants/item/BProductVariantItem.vue";
import BProductVariantAdd from "../../../variants/add/BProductVariantAdd.vue";
import UNumberInput from "../../../../../ui/number/input/UNumberInput.vue";
import { BusinessModel } from "@selldone/core-js/enums/shop/BusinessModel";

import USmartMenu from "../../../../../ui/smart/menu/USmartMenu.vue";
import { ProductVariants } from "@selldone/core-js/enums/product/ProductVariants";
import BProductVariantsBulkAdd from "../../../../product/variants/bulk-add/BProductVariantsBulkAdd.vue";
import SWidgetHelp from "@selldone/components-vue/ui/widget/help/SWidgetHelp.vue";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BProductInventoryManagementPhysical",
  mixins: [],
  components: {
    SWidgetHelp,
    BProductVariantsBulkAdd,

    USmartMenu,

    UNumberInput,
    BProductVariantAdd,
    BProductVariantItem,
  },
  props: {
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
  },
  data() {
    return {
      ProductVariants: ProductVariants,

      page: 1,
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
    excludes_count() {
      return Object.values(this.excludes).reduce(
        (sum, current) => sum + current.length,
        0,
      );
    },

    add_variants_count() {
      if (this.input_variant_2) {
        return (
          this.input_options_1.length * this.input_options_2.length -
          this.excludes_count
        );
      }
      return this.input_options_1.length - this.excludes_count;
    },

    pages_count() {
      return Math.ceil(this.product_variants.length / 5);
    },
    paged_variants() {
      return this.product_variants.slice((this.page - 1) * 5, this.page * 5);
    },
  },

  watch: {
    // Update route to keep variant (Can open variant directly by the url)
    current_item(current_item) {
      if (!current_item && !this.$route.query.variant_id) return;

      if (
        current_item &&
        this.getId(this.$route.query.variant_id) === current_item.id
      )
        return;
      this.$router.replace({
        query: current_item ? { variant_id: current_item.id } : null,
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
    if (this.$route.query.variant_id) {
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
        .post(url, {
          sku: variant.sku,
          mpn: variant.mpn,

          color: variant.color,
          style: variant.style,
          volume: variant.volume,
          weight: variant.weight,
          pack: variant.pack,
          type: variant.type,

          pricing: variant.pricing,

          price: variant.price,
          currency: variant.currency,
          commission: variant.commission,
          discount: variant.discount,

          dis_start: variant.dis_start,
          dis_end: variant.dis_end,

          price_label: variant.price_label,

          quantity: variant.quantity,
          image: variant.image,
          enable: variant.enable,

          lead: variant.lead,
          extra: variant.extra,
        })
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

<style lang="scss" scoped></style>
