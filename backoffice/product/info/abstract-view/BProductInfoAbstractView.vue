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
  <s-widget-box
    :title="`<h5 class='align-items-center pb-1' title='${
      product.title
    }'>    <span class='circle ${
      product.status === ProductStatus.Open.code
        ? 'bg-success'
        : product.status === ProductStatus.Close.code
          ? 'bg-primary'
          : product.status === ProductStatus.Pending.code
            ? 'bg-warning'
            : 'bg-danger'
    } mr-sm' style='font-size: 6px;'></span> ${product.title?.limitWords(
      8,
    )}  </h5>`"
  >
    <template v-slot:top-left>
      <!-- ⬬⬬⬬⬬ Embed ⬬⬬⬬⬬ -->
      <span
        caption="Embed"
        class="sub-caption inline-block -hover me-3"
        title="Embed iframe code"
      >
        <v-btn icon variant="text" @click="showEmbedCode">
          <v-icon color="#111">code</v-icon>
        </v-btn>
      </span>

      <!-- ⬬⬬⬬⬬ Download ⬬⬬⬬⬬ -->
      <span
        caption="Download"
        class="sub-caption inline-block -hover me-3"
        title="Create a report static page of product (beta)"
      >
        <v-btn icon variant="text" @click="downloadProduct()">
          <v-icon color="#111">html</v-icon>
        </v-btn>
      </span>

      <!-- ⬬⬬⬬⬬ QR CODE ⬬⬬⬬⬬ -->
      <span
        caption="Barcode"
        class="sub-caption inline-block -hover me-0"
        title="Product public link ⮕ QR Code"
      >
        <v-btn icon variant="text" @click="showBarcode(true, true)">
          <v-icon color="#111">fa:fas fa-qrcode</v-icon>
        </v-btn>
      </span>
    </template>

    <template v-slot:actions>
      <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Breadcrumbs ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

      <b-product-breadcrumbs
        v-if="product"
        :image-size="22"
        :product="product"
        :shop="shop"
      ></b-product-breadcrumbs>

      <p>
        <v-btn
          :href="product_link"
          :title="$t('product_admin.dashboard.info.link')"
          class="me-2"
          icon
          target="_blank"
          variant="text"
        >
          <v-icon>link</v-icon>
        </v-btn>

        <span
          class="font-weight-medium animate-underline"
          dir="ltr"
          @click.stop="copyToClipboard(product_link)"
          >{{ product_link }}</span
        >
      </p>

      <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Messages ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

      <div class="dashed-hr my-2 mx-n5"></div>

      <v-row align="center" class="small text-muted py-2" no-gutters>
        <i class="fas fa-angle-down me-2"></i>
        {{ $t("product_admin.dashboard.info.staff_messages") }}

        <v-spacer></v-spacer>
        <v-btn
          class="tnt"
          color="primary"
          size="small"
          @click="dialog_note = true"
        >
          <v-icon class="me-1" start>post_add</v-icon>
          {{ $t("product_admin.dashboard.info.add_note") }}
        </v-btn>
      </v-row>

      <div
        v-if="note && note.length"
        class="text-start pp"
        @click="dialog_note = true"
      >
        <div class="d-flex align-center">
          <v-avatar :size="32" class="avatar-gradient -thin -staff me-2">
            <v-img :src="getUserAvatar(note[note.length - 1].user_id)" />
          </v-avatar>
          <div class="flex-grow-1" title="Sender">
            <b>{{ note[note.length - 1].user_name }}</b>
            <span class="d-block small" title="Message send time"
              >{{ getFromNowString(note[note.length - 1].date) }}
              ●
              {{ getLocalDateString(note[note.length - 1].date) }}</span
            >
          </div>
        </div>
        <div class="typo-body my-2">
          {{ note[note.length - 1].body }}
        </div>
      </div>

      <div class="dashed-hr my-2 mx-n5"></div>

      <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Tags ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->
      <v-row align="center" class="small text-muted py-2" no-gutters>
        <i class="fas fa-angle-down me-2"></i>
        {{ $t("product_admin.dashboard.info.product_tags") }}

        <v-spacer></v-spacer>
        <v-btn
          class="tnt"
          color="primary"
          size="small"
          @click="dialog_tags = true"
        >
          <v-icon class="me-1" start>label</v-icon>

          {{ $t("product_admin.dashboard.info.edit_tags") }}
        </v-btn>
      </v-row>

      <div class="text-start">

        <v-chip v-if="product.map"   class="ma-1"      color="#fafafa"
                variant="flat" key="-map">
          <flag v-if="product.map.country" :iso="product.map.country" :squared="false" class="me-2" />  {{product.map.title}}

          <v-tooltip activator="parent" max-width="320" content-class="bg-black text-start">
            <b>Map Tag</b>
            <div>
              {{MapHelper.GenerateFullAddressFromMapInfo(product.map)}}
            </div>
          </v-tooltip>
        </v-chip>

        <v-chip
          v-for="item in product.tags"
          :key="item"
          :title="`Tag: ${item}`"
          class="ma-1"
          color="#fafafa"
          variant="flat"
        >
          <v-avatar
            :color="item ? item.toColor(true) : '#333'"
            class="text-white"
            start
            >{{ item?.slice(0, 1).toUpperCase() }}
          </v-avatar>
          {{ item }}
        </v-chip>
      </div>

      <div class="dashed-hr my-2 mx-n5"></div>

      <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ reselling ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->
      <v-row
        v-if="product.reselling"
        class="shadow-paper rounded-18px border-between -hide-sm mb-3 mt-5 text-center mx-2 bg-white"
        no-gutters
      >
        <div class="p-2 m-2 pe-4">
          <p class="my-2 small">{{ $t("global.commons.drop_shipping") }}</p>

          <img
            height="32"
            src="../../../../assets/icons/dropshipping.svg"
            width="32"
          />
        </div>

        <div v-if="product.shipping" class="p-2 m-2 flex-grow-1">
          <p class="my-2 small">{{ $t("global.commons.shipping_area") }}</p>
          <flag
            v-for="country in Object.keys(product.shipping)?.limit(10)"
            :key="country"
            :iso="country"
            :squared="false"
            :title="getCountryName(country)"
            class="me-2"
          />
          <span
            v-if="Object.values(product.shipping).length > 10"
            class="mx-1 text-subtitle-2"
          >
            {{ Object.values(product.shipping).length - 1 }}
            {{ $t("global.commons.more") }}
            <v-icon class="mx-1">more_horiz</v-icon>
          </span>
        </div>

        <div class="p-2 m-2 flex-grow-1">
          <p class="my-2 small">
            <v-icon class="me-1">storefront</v-icon>
            Reselling shops
          </p>
          <b>{{ product.reselling_shops }}</b>
        </div>

        <div class="p-2 m-2 flex-grow-1">
          <p class="my-2 small">
            <v-icon class="me-1">conveyor_belt</v-icon>
            Reselling count
          </p>
          <b>{{ product.reselling_count }}</b>
        </div>
      </v-row>
    </template>

    <v-row no-gutters>
      <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Start variants list ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

      <v-col
        v-if="product.product_variants && product.product_variants.length"
        class="pb-3"
        cols="12"
      >
        <v-row align="center" class="small text-muted py-2" no-gutters>
          <i class="fas fa-angle-down me-2"></i>
          {{ $t("global.commons.Variants") }}
        </v-row>

        <s-country-select
          v-if="add_by_dropShipping"
          v-model="selected_shipping_country"
          :filter="shipping_countries"
          class="max-width-field m-2"
          dense
          hide-details
          item-value="alpha2"
          solo
        ></s-country-select>

        <b-product-variants-table
          :missed-variants="missed_variants"
          :product="product"
          :profit="add_by_dropShipping"
          :profit-function="profitCalculate"
          :shipping-cost="
            add_by_dropShipping && parent && parent.shipping
              ? parent.shipping[selected_shipping_country]
              : 0
          "
          :shop="shop"
          @select="
            (product_variant) => {
              $router.push({
                name: 'BPageProductInventory',
                query: { variant_id: product_variant.id },
              });
            }
          "
        >
        </b-product-variants-table>
      </v-col>
      <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ End variants list ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

      <!-- ------------------- Start No variants list ------------------- -->

      <v-col v-else class="pb-3 mb-3" cols="12">
        <v-row
          v-if="isPhysical || isVirtual"
          align="center"
          class="small text-muted py-2"
          no-gutters
        >
          <i class="fas fa-angle-down me-2"></i>
          {{ $t("global.commons.No_variants") }}
        </v-row>
        <v-table class="rounded-lg overflow-hidden" density="compact">
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-center">{{ $t("global.commons.Price") }}</th>
                <th class="text-center">{{ $t("global.commons.VAT") }}</th>
                <th class="text-center">
                  {{ $t("global.commons.Discount") }}
                </th>
                <th class="text-center">
                  {{ $t("global.commons.In_Stock") }}
                </th>
                <th class="text-left">SKU / MPN</th>
                <th></th>
              </tr>
            </thead>
            <tbody class="text-center">
              <tr>
                <td>
                  <u-price
                    :amount="product.price"
                    :currency="product.currency"
                  ></u-price>
                </td>
                <td>
                  <u-price
                    :amount="product.commission"
                    :currency="product.currency"
                  ></u-price>
                </td>

                <td>
                  <u-price
                    :amount="product.discount"
                    :currency="product.currency"
                  ></u-price>

                  <v-chip class="mx-2" color="#C2185B" size="x-small">
                    <v-icon size="x-small" start>fa:fas fa-percentage</v-icon>
                    {{
                      numeralFormat(
                        (100 * product.discount) /
                          (product.price + product.commission),
                        "0.[0]",
                      )
                    }}
                  </v-chip>

                  <u-time-progress-bar
                    :created-time="product.created_at"
                    :end-time="product.dis_end"
                    :start-time="product.dis_start"
                    class="max-width-field mx-auto"
                    small
                  />
                </td>

                <td v-if="isPhysical || isVirtual || isService" dir="ltr">
                  {{ numeralFormat(product.quantity, "0.[0] a") }}
                </td>
                <td v-else-if="isFile" class="pt-2" dir="ltr">
                  <s-files-group :files="product.files"></s-files-group>
                </td>

                <td class="text-left">
                  <span v-if="product.sku"
                    ><small>SKU:</small> {{ product.sku }}<br
                  /></span>
                  <span v-if="product.mpn"
                    ><small>MPN:</small> {{ product.mpn }}</span
                  >
                </td>

                <td class="text-center">
                  <v-btn
                    :disabled="!product.sku"
                    :title="product.sku"
                    class="mx-1"
                    icon
                    variant="text"
                    @click.stop="showBarcode(false, false)"
                  >
                    <v-icon>fa:fas fa-barcode</v-icon>
                  </v-btn>
                  <v-btn
                    :disabled="!product.sku"
                    :title="product.sku"
                    class="mx-1"
                    icon
                    variant="text"
                    @click.stop="showBarcode(true, false)"
                  >
                    <v-icon>fa:fas fa-qrcode</v-icon>
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </template>
        </v-table>
      </v-col>

      <!-- ------------------- End No variants list ------------------- -->

      <v-col class="border-end-grater-xs pa-1 text-center" cols="12" sm="4">
        <div class="d-flex align-center text-start justify-center">
          <img
            :src="getProductTypeImage(product.type)"
            class="me-2 flex-grow-0"
            height="38"
          />
          <div class="flex-grow-0">
            <b>{{ getProductTypeName(product.type) }}</b>
            <small class="d-block"
              >{{ $t("product_admin.dashboard.info.type") }}
            </small>
          </div>
        </div>
      </v-col>

      <v-col class="border-end-grater-xs pa-1 text-center" cols="12" sm="4">
        <div class="d-flex align-center text-start justify-center">
          <u-avatar-folder
            :size="38"
            :border-size="4"
            class="me-2 flex-grow-0"
            is-amber
            :src="getShopImagePath(product.category.icon, 64)"
            hide-side-icon
            elevated
            placeholder-icon="home"
          >
          </u-avatar-folder>
          <div class="flex-grow-0">
            <b>
              {{
                product.category
                  ? product.category.title
                  : $t("global.commons.home")
              }}</b
            >
            <small class="d-block">{{
              $t("product_admin.dashboard.info.category")
            }}</small>
          </div>
        </div>
      </v-col>

      <v-col class="pa-1 text-center" cols="12" sm="4">
        <template v-if="product.inputs?.length || product.outputs?.length">
          <p v-if="product.inputs?.length">
            {{ $t("product_admin.dashboard.info.inputs") }}

            <i class="far fa-check-circle text-success" />
          </p>
          <p v-if="product.outputs?.length">
            {{ $t("product_admin.dashboard.info.outputs") }}

            <i class="far fa-check-circle text-success" />
          </p>

          <p class="text-muted mb-0 mt-2">
            <small>
              {{ $t("product_admin.dashboard.info.user_data_form") }}
            </small>
          </p>
        </template>
        <template v-if="product.includes?.length">
          <small class="d-block">
            {{ $t("global.commons.included_in_the_product") }}
          </small>

          <v-avatar
            v-for="include in product.includes"
            :key="include.id"
            :title="include.title"
            class="ma-1 hover-scale"
            color="transparent"
            rounded
            size="36"
          >
            <img :src="getShopImagePath(include.image)" />
          </v-avatar>
        </template>
      </v-col>
    </v-row>

    <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Dialog > QR Code ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
    <b-product-barcode
      v-model="show_barcode"
      :barcode2d="barcode2d"
      :link-mode="link_mode"
      :product="product"
      :shop="shop"
      :variant="null"
    >
    </b-product-barcode>

    <!-- █████████████████████ Dialog > Note Messages █████████████████████ -->

    <b-note-dialog
      v-model="dialog_note"
      :add-url="
        () =>
          IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.POST_MY_VENDOR_PRODUCT_ADD_NOTE(
                $route.params.vendor_id,
                product.id,
              )
            : window.API.POST_PRODUCT_ADD_NOTE(shop.id, product.id)
      "
      :delete-url="
        (index) =>
          IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.DELETE_MY_VENDOR_PRODUCT_NOTE(
                $route.params.vendor_id,
                product.id,
                index,
              )
            : window.API.DELETE_PRODUCT_NOTE(shop.id, product.id, index)
      "
      :icon="getShopImagePath(product.icon, 128)"
      :target="product"
      :title="product.title"
    ></b-note-dialog>

    <!-- █████████████████████ Dialog > Edit Tags █████████████████████ -->
    <v-bottom-sheet
      v-model="dialog_tags"
      content-class="rounded-t-xl overflow-hidden"
      max-width="820"
      scrollable
    >
      <v-card flat rounded="0">
        <v-card-title class="d-flex align-center">
          <v-avatar v-if="product.icon" class="me-2" rounded size="24">
            <img :src="getShopImagePath(product.icon, 128)" />
          </v-avatar>

          <span>Edit tags | {{ product.title }}</span>
        </v-card-title>
        <v-card-text>
          <div class="widget-box my-5">
            <b-product-tags-input :product="product"></b-product-tags-input>
          </div>
        </v-card-text>
        <v-card-actions>
          <div class="widget-buttons">
            <v-btn size="x-large" variant="text" @click="dialog_tags = false">
              <v-icon start>close</v-icon>
              {{ $t("global.actions.close") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-bottom-sheet>

    <!-- ██████████████████████ Dialog iframe ██████████████████████ -->

    <v-dialog
      v-model="show_iframe_code"
      fullscreen
      scrollable
      transition="dialog-bottom-transition"
    >
      <v-card class="text-start">
        <v-card-title class="d-flex align-center">
          <v-avatar v-if="product.icon" class="me-2" size="32">
            <v-img :src="getShopImagePath(product.icon, 128)"></v-img>
          </v-avatar>
          Product Embed Code
        </v-card-title>
        <v-card-text>
          <div
            class="mx-auto mb-5 overflow-auto"
            style="width: 1720px; max-width: 100%; max-height: 70vh"
            v-html="iframe_code"
          ></div>

          <v-container>
            <u-text-copy-box
              :value="iframe_code"
              messages="To embed the product, simply copy the provided code and paste it into your blog posts or any other HTML pages."
              small-width-mode
            >
            </u-text-copy-box>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <div class="widget-buttons">
            <v-btn
              size="x-large"
              variant="text"
              @click="show_iframe_code = false"
            >
              <v-icon start>close</v-icon>
              {{ $t("global.actions.close") }}
            </v-btn>

            <v-btn
              color="primary"
              size="x-large"
              @click="copyToClipboard(iframe_code)"
            >
              <v-icon class="me-1">file_copy</v-icon>
              {{ $t("global.actions.copy") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </s-widget-box>
</template>

<script lang="ts">
import SWidgetBox from "../../../../ui/widget/box/SWidgetBox.vue";
import CircleImage from "../../../../ui/image/CircleImage.vue";
import UTimeProgressBar from "../../../../ui/time/progress-bar/UTimeProgressBar.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import BProductVariantsTable from "../../variants/table/BProductVariantsTable.vue";
import SCountrySelect from "../../../../ui/country/select/SCountrySelect.vue";
import BProductBarcode from "../../../product/barcode/BProductBarcode.vue";
import BNoteDialog from "../../../note/dialog/BNoteDialog.vue";
import BProductTagsInput from "../../../product/tags/input/BProductTagsInput.vue";
import SFilesGroup from "../../../../ui/file/group/SFilesGroup.vue";

import { saveAs } from "file-saver";
import HTML_TEMPLATE from "./assets/product-export-template.html?raw";
import BProductBreadcrumbs from "../../../product/breadcrumbs/BProductBreadcrumbs.vue";
import { ProductStatus } from "@selldone/core-js/enums/product/ProductStatus";
import { ProductEmbedHelper } from "@selldone/core-js/helper/embed/ProductEmbedHelper";
import UTextCopyBox from "../../../../ui/text/copy-box/UTextCopyBox.vue";
import UAvatarFolder from "@selldone/components-vue/ui/avatar/folder/UAvatarFolder.vue";
import {MapHelper} from "@selldone/core-js";

export default {
  name: "BProductInfoAbstractView",
  components: {
    UAvatarFolder,
    UTextCopyBox,
    BProductBreadcrumbs,
    SFilesGroup,
    BProductTagsInput,
    BNoteDialog,
    BProductBarcode,
    SCountrySelect,
    BProductVariantsTable,
    UTimeProgressBar,
    SWidgetBox,
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
    productData: {
      required: true,
      type: Array,
    },
  },

  data: () => ({
    MapHelper:MapHelper,
    ProductStatus: ProductStatus,
    selected_shipping_country: null,

    show_barcode: false,
    barcode2d: false,
    link_mode: false,

    //---------------------------
    dialog_note: false,

    dialog_tags: false,

    //---------------------------
    iframe_code: null,
    show_iframe_code: false,
  }),
  computed: {

    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    add_by_dropShipping() {
      return !!this.product.parent_id;
    },
    parent() {
      return this.product.parent;
    },

    product_link() {
      let domain = this.getShopMainUrl(this.shop);
      return `${domain}/product/${this.product.id}`;
    },

    isVirtual() {
      return this.product && this.product.type === ProductType.VIRTUAL.code;
    },
    isPhysical() {
      return this.product && this.product.type === ProductType.PHYSICAL.code;
    },

    isFile() {
      return this.product && this.product.type === ProductType.FILE.code;
    },
    isService() {
      return this.product && this.product.type === ProductType.SERVICE.code;
    },

    shipping_countries() {
      if (!this.parent || !this.parent.shipping) return [];
      return Object.keys(this.parent.shipping);
    },
    missed_variants() {
      if (!this.add_by_dropShipping) return null;
      return this.parent.product_variants.filter(
        (variant) =>
          !this.product.product_variants.some(
            (it) => it.parent_id === variant.id,
          ),
      );
    },

    note() {
      return this.product.note;
    },
  },

  created() {
    this.selected_shipping_country = this.shipping_countries.length
      ? this.shipping_countries[0]
      : null;
  },
  methods: {
    showBarcode(barcode2d, link_mode) {
      this.barcode2d = barcode2d;
      this.show_barcode = true;
      this.link_mode = link_mode;
    },

    profitCalculate(product, variant) {
      const parent_variant = this.parent.product_variants.find(
        (it) => it.id === variant.parent_id,
      );
      if (!parent_variant) return null;

      const current_product_cost = this.priceProductByCurrency(
        this.shop,
        this.product,
        variant,
        this.product.currency,
      );
      const main_product_cost =
        this.priceProductByCurrency(
          this.parent.shop,
          this.parent,
          parent_variant,
          this.parent.currency,
        ) - this.parent.commission; // Commission is for middle seller!

      return current_product_cost - main_product_cost;
    },

    downloadProduct() {
      let html = HTML_TEMPLATE;

      function REPLACE(key, value) {
        html = html.replace(new RegExp("{{" + key + "}}", "g"), value);
        //console.log(key,value)
      }

      // Shop:
      REPLACE("lang", this.shop.language);
      REPLACE("shop.name", this.shop.name);
      REPLACE("shop.name", this.shop.name);
      REPLACE("shop.domain", this.shop.domain);
      REPLACE("shop_logo", this.getShopImagePath(this.shop.icon, 128));

      // Product:
      REPLACE("product.title", this.product.title);
      REPLACE("product.title_en", this.product.title_en);
      REPLACE("product_link", this.product_link);

      // Product images:
      let i = 1;
      this.product.images.limit(5).forEach((image) => {
        REPLACE("img" + i++, this.getShopImagePath(image.path));
      });
      for (let i = this.product.images.length; i <= 6; i++) {
        REPLACE("img" + i, this.getShopImagePath(this.product.icon));
      }

      // Articles:
      let body_articles = "";
      // Add articles:
      this.product.articles?.forEach((article) => {
        body_articles += `<div class="article">
<div class="article-bar mb-3"><b>${article.lang.toUpperCase()} - ${this.getLanguageName(
          article.lang,
        )}</b> ● Create date: <b>${this.getLocalTimeString(
          article.created_at,
        )}</b>  ● Last update: <b>${this.getLocalTimeString(
          article.updated_at,
        )}</b> </div>
<h2>${article.title}</h2>
            <div>${article.body}</div>
<div class="article-bar mt-3">Total views: <b>${article.views}</b></div>
<div class="article-bar">Tags: <b>${article.tags.join(", ")}</b></div>
</div>
`;
      });

      REPLACE("articles", body_articles);

      //  body+='<pre>'+JSON.stringify(this.productData, null, 2)+'</pre>';

      const blob = new Blob([html], {
        type: "text/html;charset=utf-8",
      });

      saveAs(blob, this.product.id + "_" + this.product.title + ".html");
    },

    showEmbedCode() {
      this.iframe_code = ProductEmbedHelper.ProductIframe(
        this.shop,
        this.product,
      );
      this.show_iframe_code = true;
    },
  },
};
</script>

<style lang="scss" scoped></style>
