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
    <template v-if="product?.id">
      <v-row align="center" no-gutters>
        <div style="min-width: 48px">
          <u-chart-radial-bar
            id="radial_bar"
            :colors="['#3F51B5']"
            :height="48"
            :labels="[$t('add_product.completed')]"
            :series="series"
            :to-colors="['#1976D2']"
            class="ms-2"
            small
          >
          </u-chart-radial-bar>
        </div>

        <span class="body-title"
          >%{{ series[0] }} {{ $t("add_product.completed") }}</span
        >

        <b-product-breadcrumbs
          v-if="$vuetify.display.smAndUp"
          :image-size="20"
          :product="product"
          :shop="shop"
          class="flex-grow-0 ma-2 w-auto body-title"
        >
        </b-product-breadcrumbs>

        <v-spacer />

        <v-btn
          class="tnt ma-2"
          color="#D32F2F"
          rounded="xl"
          variant="text"
          @click="dialogDeleteProduct = true"
        >
          <v-icon start>delete</v-icon>
          {{ $t("global.actions.delete") }}
        </v-btn>
      </v-row>
    </template>

    <template v-if="product_new?.id">
      <v-container class="pt-0 fadeIn" fluid>
        <v-row class="tab-container">
          <u-tabs-rounded
            v-model="step"
            :src="type.image"
            :tabs="tabs"
            class="mt-4 mb-5 mx-auto"
            scrollable
            small
          >
            <!-- TAB_IMAGES -->
            <template v-slot:[`item.${TAB_SPEC}`]>
              <div
                v-if="product?.id"
                style="position: absolute; bottom: 2px; z-index: -1"
              >
                <v-chip
                  v-if="product_new?.spec_order?.length"
                  size="x-small"
                  density="comfortable"
                  color="#CDDC39"
                  variant="flat"
                  prepend-icon="check_circle"
                  >
                  {{$t('add_product.menu_extra.has_spec')}}
                </v-chip>
                <v-chip
                  v-else
                  size="x-small"
                  density="comfortable"
                  color="#FFEB3B"
                  variant="flat"
                  > {{$t('add_product.menu_extra.no_spec')}}</v-chip
                >
              </div>
            </template>

            <!-- TAB_IMAGES -->
            <template v-slot:[`item.${TAB_IMAGES}`]>
              <div
                v-if="product?.id"
                style="position: absolute; bottom: 2px; z-index: -1"
              >
                <img
                  v-for="x in product_new?.images?.limit(3)"
                  :key="x.id"
                  :src="getShopImagePath(x.path, 64)"
                  width="16"
                  height="16"
                  class="border rounded"
                  style="margin-inline-start: 2px"
                />
                {{ product_new?.images?.length > 3 ? "..." : "" }}
              </div>
            </template>

            <!-- TAB_INPUTS -->
            <template v-slot:[`item.${TAB_INPUTS}`]>
              <div
                v-if="product?.id"
                style="position: absolute; bottom: 2px; z-index: -1"
              >
                <v-chip
                  v-if="product_new?.inputs?.length"
                  size="x-small"
                  density="comfortable"
                  color="#CDDC39"
                  variant="flat"
                  prepend-icon="checklist"
                  >
                  {{$t('add_product.menu_extra.form')}}
                </v-chip>
              </div>
            </template>

            <!-- TAB_PRICE -->
            <template v-slot:[`item.${TAB_PRICE}`]>
              <div
                v-if="product?.id"
                style="position: absolute; bottom: 2px; z-index: -1"
              >
                <u-price
                  :amount="product_new.price"
                  :currency="product_new.currency"
                ></u-price>
              </div>
            </template>

            <!-- TAB_PHYSICAL_EXTRA_INFO -->
            <template v-slot:[`item.${TAB_PHYSICAL_EXTRA_INFO}`]>
              <div
                v-if="product?.id && product_new.extra"
                style="position: absolute; bottom: 2px; z-index: -1"
                class="small"
              >
                <template v-if="product_new.extra?.width">
                  <v-icon>straighten</v-icon>
                  {{ product_new.extra.width }}x{{
                    product_new.extra.length
                  }}x{{ product_new.extra.height }}
                </template>
                <template v-if="product_new.extra.weight">
                  <v-icon class="ms-1">scale</v-icon>
                  {{ product_new.extra.weight }}
                </template>
              </div>
            </template>

            <!-- TAB_REVIEW_BLOG -->
            <template v-slot:[`item.${TAB_REVIEW_BLOG}`]>
              <div
                v-if="product?.id"
                style="position: absolute; bottom: 2px; z-index: -1"
              >
                <v-chip
                  v-if="SELECTED_ARTICLE_PACK?.article?.body?.length > 10"
                  size="x-small"
                  density="comfortable"
                  color="#CDDC39"
                  variant="flat"
                  prepend-icon="format_quote"
                  >{{$t('add_product.menu_extra.description')}}
                </v-chip>
              </div>
            </template>

            <!-- TAB_VARIANTS -->
            <template v-slot:[`item.${TAB_VARIANTS}`]>
              <div
                v-if="product?.id"
                style="position: absolute; bottom: 2px; z-index: -1"
              >
                <template v-if="product_new?.quantity > 0">
                  {{ numeralFormat(product_new?.quantity, "0.[0] a") }}
                </template>
                <v-chip
                  v-else
                  size="x-small"
                  density="comfortable"
                  color="#FFCDD2"
                  variant="flat"
                  prepend-icon="cancel"
                  >{{ $t("global.commons.out_of_stock") }}
                </v-chip>
              </div>
            </template>
          </u-tabs-rounded>
        </v-row>
      </v-container>
    </template>
    <!-- ███████████████████████ Product Type ███████████████████████ -->

    <div v-if="step === TAB_TYPE" class="max-width-container-1280px mx-auto">
      <s-widget-header
        :title="$t('global.commons.product_type')"
        icon="workspaces"
        icon-color="#333"
      ></s-widget-header>
      <v-list-subheader>
        {{ $t("add_product.select_type.title") }}
      </v-list-subheader>

      <b-product-edit-type
        :shop="shop"
        has-add-connect-os
        has-add-dropshipping
        has-add-sku
        @select="(item) => setType(item)"
      ></b-product-edit-type>
    </div>

    <!-- ███████████████████████ Product Info ███████████████████████ -->

    <b-product-edit-info
      v-if="step === TAB_GENERAL_INFO"
      :busy="busy"
      :product="product_new"
      :shop="shop"
      :vendor="vendor"
      @next="nextStep()"
    />
    <!-- ███████████████████████ Product Rating ███████████████████████ -->

    <b-product-edit-features
      v-if="step === TAB_RATING"
      :product="product_new"
      @next="nextStep()"
    />
    <!-- ███████████████████████ Product Spec ███████████████████████ -->

    <b-product-edit-spec
      v-if="step === TAB_SPEC"
      :product="product_new"
      :shop="shop"
      @next="nextStep()"
      @update-spec="
        () => {
          if (product) {
            product.spec = product_new.spec;
            product.spec_order = product_new.spec_order;
          }
        }
      "
    />
    <!-- ███████████████████████ Product Images ███████████████████████ -->

    <b-product-edit-images
      v-if="step === TAB_IMAGES"
      :product="product_new"
      @next="nextStep()"
      @update:icon="(icon) => (product ? (product.icon = icon) : undefined)"
      @update:video="(video) => (product ? (product.video = video) : undefined)"
    />
    <!-- ███████████████████████ Product Price ███████████████████████ -->

    <b-product-edit-price
      v-if="step === TAB_PRICE"
      :busy="busy"
      :is-marketplace="is_marketplace"
      :product="product_new"
      :shop="shop"
      :vendor="vendor"
      class="mt-5"
      has-button-next
      @next="nextStep()"
    />

    <!-- ███████████████████████ Product Inputs ███████████████████████ -->

    <b-product-edit-inputs
      v-if="step === TAB_INPUTS"
      :busy="busy"
      :product="product_new"
      @next="nextStep()"
    />
    <!-- ███████████████████████ Product Outputs ███████████████████████ -->

    <b-product-edit-outputs
      v-if="step === TAB_OUTPUTS"
      :busy="busy"
      :product="product_new"
      @next="nextStep()"
    />
    <!-- ███████████████████████ Product Extra ███████████████████████ -->

    <b-product-edit-extra
      v-if="step === TAB_PHYSICAL_EXTRA_INFO"
      :product="product_new"
      :shop="shop"
      @next="
        () => {
          nextStep();
          if (product) {
            product.extra = product_new.extra;
            product.lead = product_new.lead;
            product.limit_min = product_new.limit_min;
            product.limit_max = product_new.limit_max;
          }
        }
      "
    />

    <!-- ███████████████████████ Product Article ███████████████████████ -->

    <div v-if="step === TAB_REVIEW_BLOG">
      <article-viewer
        v-if="show_article"
        ref="product_article"
        :article-type="article_type.code"
        :initial-article-pack="SELECTED_ARTICLE_PACK"
        :need-create-new="!SELECTED_ARTICLE_PACK"
        :owner="true"
        :product-id="product_new.id"
        :shop="shop"
        :shop-id="shop.id"
        :show-author-info="false"
        :show-share-buttons="false"
        :tags="`${slugify(
          product_new.category ? product_new.category.title : null,
        )},${slugify(product_new.title)},${slugify(product_new.title_en)}`"
        :target-id="SELECTED_ARTICLE_PACK ? product_new.id : 'new'"
        class="mt-5 min-height-60vh"
        initial-render-state="editing"
        no-return-back-on-delete
        @delete="
          () => {
            DeleteItemByID(articles, SELECTED_ARTICLE_PACK.article.id);
            SELECTED_ARTICLE_PACK = null;

            show_article = false; //  force refresh!
            $nextTick(() => {
              show_article = true;
            });
          }
        "
        @update-article="
          (_article) => {
            if (!SELECTED_ARTICLE_PACK) {
              SELECTED_ARTICLE_PACK = { article: _article };
            } else {
              SELECTED_ARTICLE_PACK.article = _article;
            }
            AddOrUpdateItemByID(articles, _article);
          }
        "
      />

      <s-widget-buttons auto-fixed-position class="mb-5 mt-12">
        <v-btn
          :loading="busy"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="nextStep()"
        >
          {{ $t("global.actions.save_continue") }}

          <v-icon end>
            {{ $t("icons.arrow_end") }}
          </v-icon>
        </v-btn>
      </s-widget-buttons>
    </div>

    <!-- ███████████████████████ Product Variants ███████████████████████ -->

    <div v-if="step === TAB_VARIANTS">
      <b-product-inventory-management
        :product="product_new"
        :shop="shop"
        :vendor="vendor"
        :withTrashed="withTrashed"
        class="mt-5"
        @update:withTrashed="(val) => $emit('update:withTrashed', val)"
      />

      <div class="widget-buttons mb-5 mt-12">
        <v-btn
          :loading="busy"
          class="my-5"
          color="primary"
          rounded
          size="x-large"
          variant="elevated"
          @click="nextStep()"
        >
          {{ $t("global.actions.finish") }}

          <v-icon class="ms-2" size="small">
            {{ $t("icons.arrow_end") }}
          </v-icon>
        </v-btn>
      </div>
    </div>

    <!-- ---------------------  Google search preview  ----------------------->

    <div v-if="canShowGooglePreview" class="py-5">
      <v-btn
        v-if="!force_show_preview"
        class="my-10 tnt"
        variant="text"
        @click="show_preview = !show_preview"
        ><img
          class="me-1"
          height="20"
          src="../../../../assets/trademark/google.svg"
          width="20"
        />

        {{
          show_preview
            ? $t("global.actions.hide_preview")
            : $t("global.actions.show_preview")
        }}
      </v-btn>

      <v-expand-transition>
        <div v-if="show_preview || force_show_preview">
          <div class="widget-box" style="--background: #fff">
            <s-widget-header
              :add-caption="$t('global.actions.update')"
              :add-loading="busy_render_google"
              add-icon="refresh"
              add-text
              icon="fa:fa-brands fa-google"
              title="SEO Preview"
              @click:add="getRenderedOnGoogle"
            ></s-widget-header>

            <div
              :class="{ blurred: busy_render_google }"
              class="seo-preview my-5"
              v-html="rendered_on_google"
            ></div>
          </div>
        </div>
      </v-expand-transition>
    </div>
  </div>

  <!-- --------------------- Dialog delete --------------------- -->
  <v-dialog v-if="product?.id" v-model="dialogDeleteProduct" max-width="460">
    <v-card class="text-start" rounded="xl">
      <v-card-title class="d-flex align-center">
        <v-avatar
          v-if="product.icon"
          class="me-2 avatar-gradient -thin -product"
          size="2.6em"
        >
          <img :src="getShopImagePath(product.icon, 64)" />
        </v-avatar>

        {{ $t("add_product.delete_product.title") }}
        <v-spacer></v-spacer>
        <v-icon class="m-2" color="#ddd" size="24">warning</v-icon>
      </v-card-title>

      <v-card-text>
        <div
          v-html="
            $t('add_product.delete_product.message', {
              product_title: product.title,
            })
          "
        ></div>

        <hr class="my-5" />
        {{ $t("add_product.delete_product.tips") }}
      </v-card-text>

      <v-card-actions>
        <s-widget-buttons>
          <v-btn
            color="default"
            prepend-icon="close"
            size="x-large"
            variant="text"
            @click="dialogDeleteProduct = false"
          >
            {{ $t("global.actions.cancel") }}
          </v-btn>

          <v-btn
            :loading="busy_delete"
            color="red-darken-1"
            size="x-large"
            variant="flat"
            @click="deleteProduct()"
          >
            <v-icon start>delete</v-icon>
            {{ $t("global.actions.delete") }}
          </v-btn>
        </s-widget-buttons>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import BProductEditInfo from "../../../product/edit/info/BProductEditInfo.vue";
import BProductEditFeatures from "../../../product/edit/features/BProductEditFeatures.vue";
import BProductEditPrice from "../../../product/edit/price/BProductEditPrice.vue";
import BProductEditOutputs from "../../../product/edit/outputs/BProductEditOutputs.vue";
import BProductEditImages from "../../../product/edit/images/BProductEditImages.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import BProductEditExtra from "../../../product/edit/extra/BProductEditExtra.vue";

import ArticleViewer from "../../../../article/ArticleViewer.vue";
import BProductEditSpec from "../../../product/edit/spec/BProductEditSpec.vue";
import BProductInventoryManagement from "../../inventory/management/BProductInventoryManagement.vue";
import UTabsRounded from "../../../../ui/tab/rounded/UTabsRounded.vue";
import { ProductCondition } from "@selldone/core-js/enums/product/ProductCondition";
import UChartRadialBar from "../../../../ui/chart/radial/bar/UChartRadialBar.vue";
import { PricingTypes } from "@selldone/core-js/enums/product/PricingTypes";
import { BusinessModel } from "@selldone/core-js/enums/shop/BusinessModel";
import { ShopOptionsHelper } from "@selldone/core-js/helper/shop/ShopOptionsHelper";
import BProductBreadcrumbs from "../../../product/breadcrumbs/BProductBreadcrumbs.vue";
import BProductEditType from "../../../product/edit/type/BProductEditType.vue";
import { TrackSeller } from "@selldone/core-js/enums/gtag/TrackSeller";
import ScrollHelper from "@selldone/core-js/utils/scroll/ScrollHelper";
import BProductEditInputs from "../../../product/edit/inputs/BProductEditInputs.vue";
import SWidgetButtons from "../../../../ui/widget/buttons/SWidgetButtons.vue";
import { Article } from "@selldone/core-js";
import UPrice from "@selldone/components-vue/ui/price/UPrice.vue";

const TAB_TYPE = 1;
const TAB_GENERAL_INFO = 2;
const TAB_RATING = 3;
const TAB_SPEC = 4;
const TAB_IMAGES = 5;

const TAB_INPUTS = 6;

const TAB_PRICE = 7;

const TAB_OUTPUTS = 8;

const TAB_PHYSICAL_EXTRA_INFO = 9;
const TAB_REVIEW_BLOG = 10;
const TAB_VARIANTS = 11;

/**
 * <b-product-add-full>
 */
export default {
  name: "BProductAddFull",
  components: {
    UPrice,
    SWidgetButtons,
    BProductEditType,
    BProductBreadcrumbs,
    UChartRadialBar,
    UTabsRounded,
    BProductInventoryManagement,
    BProductEditInputs,
    BProductEditExtra,
    BProductEditImages,
    BProductEditOutputs,
    BProductEditSpec,
    BProductEditPrice,
    BProductEditFeatures,
    BProductEditInfo,
    ArticleViewer,
  },
  emits: ["update:withTrashed", "update:product", "edit", "add"],
  props: {
    product: {
      // Edit mode
      required: false,
      type: Object,
    },
    shop: {
      required: true,
      type: Object,
    },

    vendor: {
      /*🟢 Vendor Panel 🟢*/ required: false,
    },

    withTrashed: {
      default: false,
      type: Boolean,
    },
  },

  data: function () {
    return {
      show_article: true, // For refresh article!

      article_type: Article.Types.Product,

      TAB_TYPE: TAB_TYPE,
      TAB_GENERAL_INFO: TAB_GENERAL_INFO,
      TAB_RATING: TAB_RATING,
      TAB_SPEC: TAB_SPEC,
      TAB_IMAGES: TAB_IMAGES,
      TAB_PRICE: TAB_PRICE,
      TAB_INPUTS: TAB_INPUTS,
      TAB_OUTPUTS: TAB_OUTPUTS,
      TAB_PHYSICAL_EXTRA_INFO: TAB_PHYSICAL_EXTRA_INFO,
      TAB_REVIEW_BLOG: TAB_REVIEW_BLOG,

      TAB_VARIANTS: TAB_VARIANTS,

      tabs_name: {
        // use for hash url
        type: TAB_TYPE,
        general: TAB_GENERAL_INFO,
        rating: TAB_RATING,
        spec: TAB_SPEC,
        images: TAB_IMAGES,
        price: TAB_PRICE,
        inputs: TAB_INPUTS,
        outputs: TAB_OUTPUTS,
        extra: TAB_PHYSICAL_EXTRA_INFO,
        blog: TAB_REVIEW_BLOG,
        variants: TAB_VARIANTS,
      },

      busy: false, // Add or Edit button busy

      dialogDeleteProduct: false,

      step: 1,

      product_new: {
        status: "Open",
        condition: ProductCondition.NEW.code,
        original: true,
      },
      type: null,

      ProductType: ProductType,

      //-------- Google Preview ----------
      busy_render_google: false,
      rendered_on_google: "",

      tab_mode: TAB_TYPE,
      // -------------------------------
      busy_delete: false,

      // -------------------------------
      show_preview: false,

      SELECTED_ARTICLE_PACK: null,

      // -------------------------------
      expanded_type: null,
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

    is_marketplace() {
      return this.shop.model === BusinessModel.MARKETPLACE.code;
    },

    option_types() {
      return ShopOptionsHelper.GetActiveTypes(this.shop);
    },

    available_types() {
      return Object.values(ProductType).filter((t) =>
        this.option_types.includes(t.code),
      );
    },

    tabs() {
      return [
        !this.product
          ? {
              title: this.$t("add_product.menu.type"),
              value: TAB_TYPE,
              color: "#512DA8",
              icon: "fa:fas fa-shapes",
            }
          : null,
        {
          title: this.$t("add_product.menu.general_info"),
          value: TAB_GENERAL_INFO,
          color: this.type.color,
          icon: "fa:fas fa-pencil-ruler",
        },
        {
          title: this.$t("add_product.menu.rating"),
          value: TAB_RATING,
          color: this.type.color,
          icon: "fa:fas fa-poll-h",
        },
        {
          title: this.$t("add_product.menu.spec"),
          value: TAB_SPEC,
          color: this.type.color,
          icon: "fa:fas fa-sliders-h",
        },
        {
          title: this.$t("add_product.menu.images"),
          value: TAB_IMAGES,
          color: this.type.color,
          icon: "fa:fas fa-image",
        },

        this.hasStep__Inputs
          ? {
              title: this.$t("add_product.menu.inputs"),
              value: TAB_INPUTS,
              color: this.type.color,
              icon: "fa:fas fa-code-branch",
            }
          : null,

        {
          title: this.$t("add_product.menu.price"),
          value: TAB_PRICE,
          color: this.type.color,
          icon: "fa:fas fa-cash-register",
        },

        this.hasStep__Outputs
          ? {
              title: this.$t("add_product.menu.outputs"),
              value: TAB_OUTPUTS,
              color: this.type.color,
              icon: "fa:fas fa-code-branch",
            }
          : null,
        this.hasStep__physicalExtra
          ? {
              title: this.$t("add_product.menu.extra"),
              value: TAB_PHYSICAL_EXTRA_INFO,
              color: this.type.color,
              icon: "fa:fas fa-dolly-flatbed",
            }
          : null,
        {
          title: this.$t("add_product.menu.review"),
          value: TAB_REVIEW_BLOG,
          color: this.type.color,
          icon: "fa:fas fa-feather-alt",
        },
        this.hasStep__inventory
          ? {
              title: this.$t("add_product.menu.inventory"),
              value: TAB_VARIANTS,
              color: this.type.color,
              icon: "fa:fas fa-boxes",
            }
          : null,
      ];
    },

    canShowGooglePreview() {
      return (
        this.shop &&
        this.shop.id &&
        ((this.product && this.product.id) ||
          (this.product_new && this.product_new.id))
      );
    },
    force_show_preview() {
      return [
        TAB_GENERAL_INFO,
        TAB_RATING,
        TAB_PRICE,
        TAB_REVIEW_BLOG,
      ].includes(this.step);
    },

    isPhysical() {
      if (this.product_new)
        return this.product_new.type === ProductType.PHYSICAL.code;
      return this.product && this.product.type === ProductType.PHYSICAL.code;
    },
    isVirtual() {
      if (this.product_new)
        return this.product_new.type === ProductType.VIRTUAL.code;
      return this.product && this.product.type === ProductType.VIRTUAL.code;
    },
    isFile() {
      if (this.product_new)
        return this.product_new.type === ProductType.FILE.code;
      return this.product && this.product.type === ProductType.FILE.code;
    },
    isService() {
      if (this.product_new)
        return this.product_new.type === ProductType.SERVICE.code;
      return this.product && this.product.type === ProductType.SERVICE.code;
    },

    hasStep__Inputs() {
      // Inputs
      return (
        this.type.code === ProductType.VIRTUAL.code ||
        this.type.code === ProductType.PHYSICAL.code ||
        this.type.code === ProductType.SERVICE.code
      );
    },
    hasStep__Outputs() {
      // Outputs
      return (
        this.type.code === ProductType.VIRTUAL.code ||
        this.type.code === ProductType.SERVICE.code
      );
    },
    hasStep__physicalExtra() {
      // Extra
      return this.type.code === ProductType.PHYSICAL.code;
    },

    hasStep__inventory() {
      return true;
    },

    series() {
      // console.log('series');
      this.step;
      let out = 0;
      out = 0;
      let product = this.product_new;

      // Type: +10
      if (product.type) out += 10;

      // General info: +30
      if (product.title) out += 4;
      if (product.title_en) out += 4;
      if (product.icon) out += 5;
      if (product.blog) out += 1;
      if (product.category_id) out += 3;
      if (product.lead) out += 2;
      if (product.brand) out += 1;
      if (product.sku) out += 2;
      if (product.mpn) out += 2;
      if (product.gpc) out += 3;
      if (product.condition) out += 3;

      // Price: +10
      if (product.price) out += 5;
      if (product.currency) out += 5;

      // Spec: +15
      if (product.spec) out += 5;
      if (product.pros) out += 5;
      if (product.cons) out += 5;

      // Ratings: +10
      if (product.ratings) out += 10;

      // Inventory: +5

      if (product.quantity) out += 5;

      // Optional +6
      if (product.type === ProductType.PHYSICAL.code) {
        if (product.extra) out += 6;
      } else if (product.type === ProductType.VIRTUAL.code) {
        if (product.inputs) out += 3;
        if (product.outputs) out += 3;
      } else {
        out += 6;
      }

      // Article : +14
      if (this.SELECTED_ARTICLE_PACK?.article?.title?.length > 10) out += 3;
      if (this.SELECTED_ARTICLE_PACK?.article?.body?.length > 100) out += 11;
      //console.log("---calc---", out);
      if (out > 100) out = 100;
      return [out];
    },

    // ―――― Multi Language ――――

    articles() {
      return this.product && this.product.articles;
    },
  },
  watch: {
    /*product_new:{
      product: function(newValue) {

        console.log(this.product_new)
      },deep: true
    },*/
    step(step) {
      this.applyDeepChangesToProduct();

      this.$nextTick(() => {
        try {
          if (this.product?.id) {
            ScrollHelper.scrollToElement("#radial_bar", 0, "smooth");
          } else {
            ScrollHelper.scrollToTop(0, "smooth");
          }
        } catch (e) {}
      });

      if (!this.product) {
        return; // Only on product edit mode we have hash path!
      }
      const tab_hash =
        "#" +
        Object.keys(this.tabs_name).find((key) => this.tabs_name[key] === step);

      if (this.$route.hash !== tab_hash)
        this.$router.replace({
          hash: tab_hash,
        });
    },
  },
  created() {
    if (this.product) {
      Object.assign(this.product_new, this.product);
      this.step = 2;

      // console.log("this.$route.hash", this.$route.hash);
      if (this.$route.hash) {
        const hash = this.$route.hash.replace("#", "");
        if (hash && this.tabs_name[hash]) this.step = this.tabs_name[hash];
      }
    } else {
      // New product mode:
      /*
not need!
      // set category:
      if(this.$route.query.dir){
        console.log('Current category:',this.$route.query.dir)
        this.product_new.category_id=this.$route.query.dir
      }*/
    }

    this.type =
      !this.product || !this.product.type
        ? null
        : ProductType[this.product.type];

    this.product_new.inputs = this.product_new.inputs
      ? this.product_new.inputs
      : [];
    this.product_new.outputs = this.product_new.outputs
      ? this.product_new.outputs
      : [];

    this.getRenderedOnGoogle();

    // Initial article pack:
    //console.log('---articles---',this.articles)
    if (this.articles?.length) {
      // 1. Select default language:
      let article = this.articles.find(
        (a) => a.lang.toLowerCase() === this.shop.language.toLowerCase(),
      );
      // 2. Select first:
      if (!article) article = this.articles[0];

      this.SELECTED_ARTICLE_PACK = this.generatePack(article);
    }
    // console.log('---SELECTED_ARTICLE_PACK---',this.SELECTED_ARTICLE_PACK)
  },

  beforeUnmount() {
    this.applyDeepChangesToProduct();
  },

  methods: {
    generatePack(article) {
      if (!article) return null;
      return {
        article: article,
        can_edit: article.can_edit,
      };
    },

    getRenderedOnGoogle() {
      if (!this.canShowGooglePreview) return;

      let t = this;
      this.busy_render_google = true;

      let product_id = this.product ? this.product.id : this.product_new.id;

      axios
        .get(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.GET_MY_VENDOR_SEO_PREVIEW_PRODUCT(
                this.vendor.id,
                product_id,
              )
            : window.API.GET_SEO_PREVIEW_PRODUCT(this.shop.id, product_id),
        )
        .then(({ data }) => {
          if (data.error) {
            t.showErrorAlert(null, data.error_msg);
          } else {
            this.rendered_on_google = data.html;
          }
        })
        .catch((error) => {
          t.showLaravelError(error);
        })
        .finally(() => {
          this.busy_render_google = false;
        });
    },

    goTo(step) {
      this.step = step;
    },

    /**
     * Deep changes which auto save without calling update product
     * Only parameters which updated without pressing main save button!
     */
    applyDeepChangesToProduct() {
      // We should update product here
      if (!this.product || !this.product_new) return;
      // console.log("Change", "product_new.pros", this.product_new);

      this.product.tags = this.product_new.tags;
      this.product.pros = this.product_new.pros;
      this.product.cons = this.product_new.cons;
      this.product.spec = this.product_new.spec;
      this.product.spec_order = this.product_new.spec_order;
      this.product.rating = this.product_new.rating;
      this.product.includes = this.product_new.includes;
      this.product.badges = this.product_new.badges;
    },

    setType(type) {
      this.product_new.type = type.code;
      this.type = type;

      this.nextStep();
    },
    addProduct(callback = null) {
      this.busy = true;
      axios
        .post(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.POST_MY_VENDOR_ADD_PRODUCT(this.vendor.id)
            : window.API.POST_ADD_PRODUCT(this.shop.id),

          {
            // For marketplace: Vendor owner
            vendor_id: this.product_new.vendor_id,

            type: this.product_new.type,

            unit: this.product_new.unit,
            unit_float: this.product_new.unit_float,
            price_input: this.product_new.price_input, // default, area, volume
            action: this.product_new.action,

            title: this.product_new.title,
            title_en: this.product_new.title_en,

            sku: this.product_new.sku,
            mpn: this.product_new.mpn,
            gtin: this.product_new.gtin,
            gpc: this.product_new.gpc,
            hsn: this.product_new.hsn,

            condition: this.product_new.condition,

            pricing: this.product_new.pricing
              ? this.product_new.pricing
              : PricingTypes.FIX.code,

            price: this.product_new.price ? this.product_new.price : 0,
            currency: this.product_new.currency
              ? this.product_new.currency
              : this.$t("global.currency_default"),

            commission: this.product_new.commission,
            discount: this.product_new.discount,

            price_label: this.product_new.price_label,

            icon: this.product_new.icon,

            message: this.product_new.message,

            inputs: this.product_new.inputs ? this.product_new.inputs : null,
            outputs: this.product_new.outputs ? this.product_new.outputs : null,

            blog: this.product_new.blog,
            status: this.product_new.status,

            category_id: this.product_new.category_id,

            lead: this.product_new.lead,

            style: this.product_new.style,

            brand: this.product_new.brand,
            warranty: this.product_new.warranty,
            original: this.product_new.original,
            return_warranty: this.product_new.return_warranty,

            video: this.product_new.video,

            // Logistic Profiles:
            warranty_id: this.product_new.warranty_id,
            return_policy_id: this.product_new.return_policy_id,
            guide_id: this.product_new.guide_id,
            shipping_id: this.product_new.shipping_id,

            // Tax profile:
            tax_id: this.product_new.tax_id,

            // Map profile:
            map_id: this.product_new.map_id,

            // Extra:
            extra: this.product_new.extra,

            // Wholesaler:
            limit_min: this.product_new.limit_min,
            limit_max: this.product_new.limit_max,

            // External
            external: this.product_new.external,
          },
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.showSuccessAlert(null, "The product added to the list.");
            this.$emit("add", data.product);
            //Object.assign(this.product_new, data.product);
            this.product_new = data.product;

            this.getRenderedOnGoogle();

            const article = data.product.articles?.length
              ? data.product.articles[0]
              : null;
            if (article)
              this.SELECTED_ARTICLE_PACK = this.generatePack(article); // Load article pack.

            this.step = 3;
            this.$forceUpdate(); // Update vue component!

            if (callback) callback();

            //┌─────────────── 🫐 Analytics 🫐 ───────────────┐
            TrackSeller.onAddProduct(data.product);
            //└───────────────────────────────────────────────┘
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },
    editProduct(callback = null) {
      this.busy = true;
      axios
        .put(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.PUT_MY_VENDOR_EDIT_PRODUCT(
                this.vendor.id,
                this.product_new.id,
              )
            : window.API.PUT_EDIT_PRODUCT(this.shop.id, this.product_new.id),

          {
            type: this.product_new.type,

            unit: this.product_new.unit,
            unit_float: this.product_new.unit_float,
            price_input: this.product_new.price_input,
            action: this.product_new.action,

            title: this.product_new.title,
            title_en: this.product_new.title_en,

            sku: this.product_new.sku,
            mpn: this.product_new.mpn,
            gtin: this.product_new.gtin,
            gpc: this.product_new.gpc,
            hsn: this.product_new.hsn,
            condition: this.product_new.condition,

            pricing: this.product_new.pricing,
            price: this.product_new.price,
            currency: this.product_new.currency
              ? this.product_new.currency
              : this.$t("global.currency_default"),
            commission: this.product_new.commission,
            discount: this.product_new.discount,

            dis_start: this.product_new.dis_start,
            dis_end: this.product_new.dis_end,

            price_label: this.product_new.price_label,

            icon: this.product_new.icon,

            message: this.product_new.message,

            inputs: this.product_new.inputs ? this.product_new.inputs : null,
            outputs: this.product_new.outputs ? this.product_new.outputs : null,

            blog: this.product_new.blog,
            status: this.product_new.status,

            category_id: this.product_new.category_id,

            lead: this.product_new.lead,

            style: this.product_new.style,

            brand: this.product_new.brand,
            warranty: this.product_new.warranty,
            original: this.product_new.original,

            return_warranty: this.product_new.return_warranty,

            video: this.product_new.video,

            // Logistic Profiles:
            warranty_id: this.product_new.warranty_id,
            return_policy_id: this.product_new.return_policy_id,
            guide_id: this.product_new.guide_id,
            shipping_id: this.product_new.shipping_id,

            // Tax profile:
            tax_id: this.product_new.tax_id,

            // Map profile:
            map_id: this.product_new.map_id,

            // Extra:
            extra: this.product_new.extra,

            // Wholesaler:
            limit_min: this.product_new.limit_min,
            limit_max: this.product_new.limit_max,

            // External
            external: this.product_new.external,
          },
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.showSuccessAlert(null, "The product edited.");

            Object.assign(this.product_new, data.product); // Copy product data (refresh)
            if (this.product) {
              Object.assign(this.product, data.product); // Copy product data (refresh)
            }

            this.$emit("update:product", data.product);

            this.$emit("edit", data.product);

            this.getRenderedOnGoogle();

            if (callback) callback();

            // Goto to:
            if (!this.product)
              // We have no route change => Move to up by code here!
              ScrollHelper.scrollToTop(0, "smooth");
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },

    deleteProduct() {
      this.busy_delete = true;
      axios
        .delete(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.DELETE_MY_VENDOR_PRODUCT(
                this.vendor.id,
                this.product_new.id,
              )
            : window.API.DELETE_PRODUCT(this.shop.id, this.product_new.id),
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.showSuccessAlert(null, "The product removed.");
            //this.$emit("delete", product);

            // Go to shop page > products
            this.$router.push({
              name: "BPageShopProductsList",
              params: { shop_id: this.shop.id },
              query: { dir: this.product_new.category_id },
            });
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_delete = false;
        });
    },

    nextStep() {
      if (this.step === TAB_TYPE) {
        this.step = TAB_GENERAL_INFO;
      } else if (this.step === TAB_GENERAL_INFO) {
        if (this.product || this.product_new.id)
          this.editProduct(() => {
            this.step = TAB_RATING;
          });
        // this.product_new.id: prevent re add in create product if go back in tabs!
        else
          this.addProduct(() => {
            this.step = TAB_RATING;
          }); // Pooling , Pros , Cons
      } else if (this.step === TAB_RATING) {
        this.step = TAB_SPEC; // Spec
      } else if (this.step === TAB_SPEC) {
        this.editProduct();
        this.step = TAB_IMAGES; // Pictures
      } else if (this.step === TAB_IMAGES) {
        this.editProduct();

        this.step = this.step = this.hasStep__Inputs ? TAB_INPUTS : TAB_PRICE;
      } else if (this.step === TAB_INPUTS) {
        this.editProduct();

        this.step = TAB_PRICE;
      } else if (this.step === TAB_PRICE) {
        // Price
        this.editProduct();

        this.step =
          /* this.hasStep__Inputs
                                        ? TAB_INPUTS
                                        :*/
          this.hasStep__Outputs
            ? TAB_OUTPUTS
            : this.hasStep__physicalExtra
              ? TAB_PHYSICAL_EXTRA_INFO
              : TAB_REVIEW_BLOG;
      } else if (this.step === TAB_INPUTS) {
        // Inputs
        this.editProduct();

        this.step = this.hasStep__Outputs
          ? TAB_OUTPUTS
          : this.hasStep__physicalExtra
            ? TAB_PHYSICAL_EXTRA_INFO
            : TAB_REVIEW_BLOG;
      } else if (this.step === TAB_OUTPUTS) {
        this.editProduct(); // Outputs

        if (this.type.code === ProductType.VIRTUAL.code)
          this.step = TAB_REVIEW_BLOG;
        else if (this.type.code === ProductType.PHYSICAL.code)
          this.step = TAB_PHYSICAL_EXTRA_INFO;
        else if (this.type.code === ProductType.SERVICE.code)
          this.step = TAB_REVIEW_BLOG;
      } else if (this.step === TAB_PHYSICAL_EXTRA_INFO) {
        ////  this.editProduct(); // Outputs

        this.step = TAB_REVIEW_BLOG;
      } else if (this.step === TAB_REVIEW_BLOG) {
        this.$refs.product_article.saveChange(() => {
          if (this.hasStep__inventory) {
            this.step = TAB_VARIANTS;
          } else {
            this.finish();
          }
        });
      } else if (this.step === TAB_VARIANTS) {
        this.editProduct();
        this.finish();
      }
    },

    finish() {
      this.$router.push({
        name: this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
          ? "Vendor_ProductDashboard"
          : "BPageProductDashboard",
        params: {
          product_id: this.product_new.id,
        },
        hash: "#dashboard",
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.seo-preview {
  //animation: blur 1s ease;
  transition: all 1s;

  &.blurred {
    filter: blur(6px);
  }
}

.tab-container {
  overflow-x: auto;
  min-height: 72px;
  -webkit-overflow-scrolling: touch;
}
</style>
