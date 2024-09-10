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
  <v-data-table
    :items="all_variants_items"
    class="rounded-lg overflow-hidden text-start"
    density="compact"
  >
    <template v-slot:headers>
      <tr>
        <th
          v-for="(val, key) in available_variants"
          :key="key"
          class="text-center min-width-100"
        >
          <v-icon size="small">{{ val.icon }}</v-icon>
          {{ $t(val.name) }}
        </th>
        <th class="min-width-100">
          {{ $t("global.commons.Price") }}
        </th>
        <th class="min-width-100">
          {{ $t("global.commons.commission") }}
        </th>
        <th class="min-width-100">
          {{ $t("global.commons.Discount") }}
        </th>
        <th class="min-width-100">
          {{ $t("global.commons.customer_price") }}
        </th>
        <th v-if="profit" class="text-center min-width-100">Profit</th>

        <th class="min-width-100">
          {{ $t("global.commons.In_Stock") }}
        </th>
        <th class="text-left min-width-100">SKU / MPN</th>
        <th class="min-width-100"></th>

        <th v-if="add_by_dropShipping" class="min-width-100">
          {{ $t("global.commons.status") }}
        </th>
      </tr>
    </template>

    <template v-slot:item="{ item }">
      <tr
        :class="{
          'row-hover': !viewOnly,
          'inactive-overlay': !item.quantity || !item.enable || item.missed,
          '-red': item.missed,
          '-amber': !item.enable,
        }"
        @click="
          item.missed ? showAddVariantDialog(item) : $emit('select', item)
        "
      >
        <td
          v-for="(val, key) in available_variants"
          :key="key"
          :class="{ 'text-center': key === 'color' }"
        >
          <u-color-circle v-if="key === 'color'" :color="item[key]">
          </u-color-circle>
          <span v-else>
            <u-variant-asset-image
              :shop-id="shop.id"
              :size="24"
              :value="item[key]"
            ></u-variant-asset-image>
            {{ item[key]?.removeVariantAsset() }}</span
          >
        </td>
        <td>
          <div class="d-flex align-center">
            <u-price
              :amount="item.pricing ? item.price : product.price"
              :currency="item.pricing ? item.currency : product.currency"
            ></u-price>
            <v-spacer></v-spacer>
            <!-- custom variant pricing or same as product pricing? -->
            <v-icon v-if="item.pricing" class="ms-1">price_change </v-icon>

            <v-tooltip activator="parent" content-class="bg-black">
              <template v-if="item.pricing">
                Variant has independent pricing.
              </template>
              <template v-else> Same as main product. </template>
            </v-tooltip>
          </div>
        </td>
        <td>
          <u-price
            :amount="item.pricing ? item.commission : product.commission"
            :currency="item.pricing ? item.currency : product.currency"
          ></u-price>
        </td>

        <td class="min-width-200">
          <div class="d-flex align-center">
            <u-price
              :amount="item.pricing ? item.discount : product.discount"
              :currency="item.pricing ? item.currency : product.currency"
            ></u-price>

            <u-chip-discount
              :percent="
                item.pricing
                  ? (100 * item.discount) / (item.price + item.commission)
                  : (100 * product.discount) /
                    (product.price + product.commission)
              "
              class="ms-2"
              size="small"
              :start="item.dis_start"
              :end="item.dis_end"
            ></u-chip-discount>
          </div>

          <u-time-progress-bar
            v-if="item.pricing"
            :created-time="item.created_at"
            :end-time="item.dis_end"
            :start-time="item.dis_start"
            class="max-width-field mx-auto"
            small
          />
          <u-time-progress-bar
            v-else
            :created-time="product.created_at"
            :end-time="product.dis_end"
            :start-time="product.dis_start"
            class="max-width-field mx-auto"
            small
          />
        </td>

        <td>
          <u-price
            :amount="
              priceProductByCurrency(shop, product, item, product.currency)
            "
            :currency="product.currency"
          ></u-price>

          <v-icon v-if="shippingCost" class="mx-1" size="small">add</v-icon>
          <u-price
            v-if="shippingCost"
            :amount="shippingCost"
            :currency="product.currency"
            :title="$t('global.commons.shipping_cost')"
            class="text-blue"
          ></u-price>
        </td>

        <td v-if="profit">
          <u-price
            v-if="profitFunction(product, item) !== null"
            :amount="profitFunction(product, item)"
            :class="
              profitFunction(product, item) > 0 ? 'text-success' : 'text-danger'
            "
            :currency="product.currency"
          ></u-price>
          <small v-else>Variant not found!</small>
        </td>
        <td class="text-start">
          <b
            v-if="!item.quantity"
            class="text-red x-small"
            title="Out of stock"
          >
            <v-icon class="me-1" color="red" size="small"
              >notification_important
            </v-icon>
            {{ $t("global.commons.out_of_stock") }}
          </b>
          <span v-else class="body-title">{{
            numeralFormat(item.quantity, "0.[0] a")
          }}</span>

          <div
            :title="`Average fulfillment time : ${item.lead} h`"
            class="d-block my-1 text-center d-flex align-center op-0-8"
          >
            <template v-if="item.lead === -1">
              <v-icon class="me-1" size="small">history_toggle_off</v-icon>
              {{ $t("global.commons.unset") }}
            </template>

            <span v-else>
              <v-icon class="me-1" size="small">timelapse</v-icon>
              {{ `${item.lead} ${$t("global.commons.hours")}` }}</span
            >
          </div>

          <div v-if="!item.enable" class="my-1" title="Inactive">
            <v-icon class="me-1" size="small">folder_off</v-icon>
            {{ $t("global.commons.inactive") }}
          </div>
        </td>

        <td class="text-left min-width-150">
          <div v-if="item.sku" :title="`Copy SKU: ${item.sku}`">
            <small>SKU:</small>
            <b v-copy class="mx-1" @click.stop>{{ item.sku }}</b>
          </div>

          <div v-if="item.mpn" :title="`Copy MPN: ${item.mpn}`">
            <small>MPN:</small>
            <b v-copy class="mx-1" @click.stop>{{ item.mpn }}</b>
          </div>
        </td>

        <td class="text-center">
          <template v-if="item.sku">
            <v-btn
              class="mx-1 hover-scale-small"
              min-width="32"
              variant="text"
              width="36"
              @click.stop="showBarcode(item, false)"
            >
              <v-icon size="24">fa:fas fa-barcode</v-icon>

              <v-tooltip activator="parent" location="top">
                {{ "Show printable barcode | SKU:" + item.sku }}
              </v-tooltip>
            </v-btn>
            <v-btn
              class="mx-1 hover-scale-small"
              min-width="32"
              variant="text"
              width="36"
              @click.stop="showBarcode(item, true)"
            >
              <v-icon size="24">fa:fas fa-qrcode</v-icon>
              <v-tooltip activator="parent" location="top">
                {{ "Show printable QR code | SKU:" + item.sku }}
              </v-tooltip>
            </v-btn>
          </template>
          <v-icon v-else title="The SKU is not set for variant!"
            >warning_amber
          </v-icon>
        </td>

        <td v-if="add_by_dropShipping" class="text-center">
          <v-icon v-if="item.missed" color="blue">add_box</v-icon>
          <v-icon v-else-if="item.enable" color="green">check</v-icon>
          <v-icon v-else color="red">close</v-icon>
        </td>
      </tr>
    </template>

    <template v-slot:body.append>
      <tr>
        <td colspan="6">
          <v-row no-gutters>
            <div class="d-flex align-center pa-1">
              <v-card
                class="me-2 inactive-overlay d-inline-block"
                height="24"
                variant="outlined"
                width="24"
              ></v-card>
              Not in stock.
            </div>
            <div class="d-flex align-center pa-1">
              <v-card
                class="me-2 inactive-overlay -red d-inline-block"
                height="24"
                variant="outlined"
                width="24"
              ></v-card>
              Missing variant parameter.
            </div>

            <div class="d-flex align-center pa-1">
              <v-card
                class="me-2 inactive-overlay -amber d-inline-block"
                height="24"
                variant="outlined"
                width="24"
              ></v-card>
              Variant is disabled.
            </div>
          </v-row>
        </td>
      </tr>
    </template>
  </v-data-table>

  <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Dialog > QR Code ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
  <b-product-barcode
    v-model="show_barcode"
    :barcode2d="barcode2d"
    :product="product"
    :shop="shop"
    :variant="barcode_variant"
  ></b-product-barcode>
</template>

<script>
import { ProductVariants } from "@selldone/core-js/enums/product/ProductVariants";
import UTimeProgressBar from "../../../../ui/time/progress-bar/UTimeProgressBar.vue";
import BProductBarcode from "../../../product/barcode/BProductBarcode.vue";
import UVariantAssetImage from "../../../../ui/variant/asset/image/UVariantAssetImage.vue";
import UColorCircle from "../../../../ui/color/circle/UColorCircle.vue";
import UChipDiscount from "../../../../ui/chip/discount/UChipDiscount.vue";

export default {
  name: "BProductVariantsTable",
  components: {
    UChipDiscount,
    UColorCircle,
    UVariantAssetImage,
    BProductBarcode,
    UTimeProgressBar,
  },
  props: {
    shop: {
      required: true,
      type: Object,
    },
    product: {
      required: true,
      type: Object,
    },
    viewOnly: {
      default: false,
      type: Boolean,
    },
    shippingCost: {
      default: null,
    },
    profit: {
      default: false,
      type: Boolean,
    },
    profitFunction: {
      type: Function,
    },
    missedVariants: {
      type: Array,
    },
  },
  data: () => ({
    barcode_variant: null,
    barcode2d: false,
    show_barcode: false,

    busy_add_variant: false,
  }),

  computed: {
    available_variants() {
      let out = {};

      Object.keys(ProductVariants).forEach((key) => {
        if (this.all_variants_items.find((variant) => !!variant[key]))
          out[key] = ProductVariants[key];
      });

      return out;
    },

    all_variants_items() {
      if (!this.missedVariants) return this.product.product_variants;

      const missed_array = [];
      this.missedVariants.forEach((variant) => {
        const _variant = Object.assign({}, variant);
        _variant.missed = true;
        missed_array.push(_variant);
      });
      return [...this.product.product_variants, ...missed_array];
    },

    add_by_dropShipping() {
      return !!this.product.parent_id;
    },
    parent() {
      return this.product.parent;
    },
  },

  methods: {
    showBarcode(product_variant, barcode2d) {
      this.barcode_variant = product_variant;
      this.barcode2d = barcode2d;
      this.show_barcode = true;
    },

    showAddVariantDialog(parent_variant) {
      this.openConfirmationAlert(
        "Add variant",
        "Are you sure to add this variant to your product?",
        "Yes, Add now",
        () => {
          this.addMissedVariant(parent_variant);
        },
      );
    },
    addMissedVariant(parent_variant) {
      this.busy_add_variant = true;
      axios
        .post(
          window.API.POST_ADD_DROP_SHIPPING_VARIANT(
            this.product.shop_id,
            this.product.id,
          ),
          {
            variant_id: parent_variant.id,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.AddOrUpdateItemByID(
              this.product.product_variants,
              data.product_variant,
            );

            this.showSuccessAlert(null, "Variant added successfully.");
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_add_variant = false;
        });
    },
  },
};
</script>

<style scoped></style>
