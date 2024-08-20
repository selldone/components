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
  <v-data-table
    v-model="selected"
    v-model:page="page"
    :header-props="{ sortByText: $t('global.commons.sort_by') }"
    :headers="headers"
    :items="items"
    :items-per-page="itemsPerPage"
    :row-props="
      (_data) => {
        return { class: 'row-hover -no-pointer' };
      }
    "
    :show-select="checkable"
    class="rounded-xl overflow-hidden"
    density="compact"
    hide-default-footer
    item-key="id"
    item-selectable
    return-object
    v-bind="$attrs"
  >
    <template v-slot:item.data-table-select="{ item }">
      <v-btn
        :key="item.id"
        :color="selected.some((i) => i.id === item.id) ? 'success' : '#999'"
        icon
        size="small"
        variant="text"
        @click="selected.toggle(item, 'id')"
      >
        <v-scale-transition leave-absolute>
          <v-icon v-if="selected.some((i) => i.id === item.id)" size="24">
            check_circle
          </v-icon>
          <v-icon v-else size="24"> radio_button_unchecked</v-icon>
        </v-scale-transition>
      </v-btn>
    </template>

    <template v-slot:item.row="{ index }">
      {{ index + 1 }}
    </template>

    <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ product_id ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

    <template v-slot:item.product_id="{ item }">
      <router-link
        :to="
          isRolePanel
            ? {}
            : {
                name: IS_VENDOR_PANEL
                  ? 'Vendor_ProductDashboard'
                  : 'BPageProductDashboard',
                params: {
                  product_id: getProduct(item).id,
                },
              }
        "
        class="d-block"
        style="display: contents"
        title="Go to product's admin page."
      >
        <v-img
          v-if="getProduct(item)?.icon"
          :src="getShopImagePath(getProduct(item).icon, IMAGE_SIZE_SMALL)"
          aspect-ratio="1"
          class="item-image rounded pointer-pointer border hover-scale-small force-top mx-auto mt-1"
          color="#fff"
          max-height="84px"
          max-width="84px"
          min-height="42px"
          min-width="42px"
        >
        </v-img>
        <v-icon v-else class="ma-2" size="36">shelves</v-icon>
      </router-link>
      <div v-if="type === ProductType.PHYSICAL.code" class="py-1">
        <v-chip
          class="px-1 me-1"
          label
          size="x-small"
          title="Item weight"
          variant="outlined"
        >
          <v-icon class="me-1" size="x-small">scale</v-icon>
          {{ getWeight(item) }} {{ mass_unit }}
        </v-chip>
        <v-chip
          class="px-1"
          label
          size="x-small"
          title="Item size"
          variant="outlined"
        >
          <v-icon class="me-1" size="x-small">crop_free</v-icon>
          {{ getSize(item).join("x") }} {{ size_unit }}
        </v-chip>
      </div>
      <div v-if="type === ProductType.SERVICE.code" class="py-1">
        <v-chip
          v-if="getProduct(item)?.outputs?.type"
          class="px-1 me-1"
          label
          size="x-small"
          title="Service type"
          variant="outlined"
        >
          <v-icon class="me-1" size="x-small">home_repair_service</v-icon>
          {{ getProduct(item)?.outputs?.type }}
        </v-chip>
      </div>
    </template>
    <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ product.title ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

    <template v-slot:item.product.title="{ item }">
      <p class="m-0 font-weight-bold min-width-150 text-start">
        <v-avatar
          v-if="getProduct(item).connect_id"
          class="me-1"
          rounded
          size="26"
          ><img
            :src="getConnectIcon(getProduct(item).connect_id)"
            title="Connect OS"
        /></v-avatar>
        {{ getProduct(item).title }}

        <v-chip v-if="isFulfillment" size="x-small">
          <v-avatar
            :image="getShopImagePath(item.product.icon, IMAGE_SIZE_SMALL)"
            start
          ></v-avatar>
          Reseller
          <v-tooltip
            activator="parent"
            content-class="text-start bg-black py-2 rounded-xl"
            max-width="360"
          >
            <v-avatar
              :image="getShopIcon(item.product.shop_id)"
              class="me-2 avatar-gradient -thin -shop"
              size="24"
            >
            </v-avatar>

            <b>Reseller Product</b>

            <v-row class="mt-2" no-gutters>
              <v-avatar
                :image="getShopImagePath(item.product.icon, IMAGE_SIZE_SMALL)"
                class="me-2"
                rounded="lg"
                size="64"
              ></v-avatar>
              <div>
                <div>
                  {{ item.product.title }}
                </div>
                <div class="small">
                  {{ item.product.title_en }}
                </div>

                <variant-item-view-micro
                  v-if="item.variant"
                  :product-variant="item.variant"
                />
              </div>
            </v-row>
          </v-tooltip>
        </v-chip>
      </p>
      <small class="d-block text-start"> {{ getProduct(item).title_en }}</small>
      <variant-item-view-micro
        v-if="getVariant(item)"
        :product-variant="getVariant(item)"
      />
    </template>
    <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ variant ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

    <template v-slot:item.variant="{ item }">
      <div class="small text-start">
        <!-- ▃▃▃▃▃▃▃▃▃ ID ▃▃▃▃▃▃▃▃▃ -->

        <p
          class="my-1 font-weight-bold text-center rounded text-white"
          style="background: #222"
        >
          P-{{ getProduct(item).id }}
          <span v-if="getVariant(item)"> / SVP-{{ getVariant(item).id }}</span>
        </p>
        <!-- ▃▃▃▃▃▃▃▃▃ SKU ▃▃▃▃▃▃▃▃▃ -->

        <p
          v-if="
            (getVariant(item) && getVariant(item).sku) || getProduct(item).sku
          "
          class="my-1"
        >
          <small class="me-1">SKU: </small>
          {{
            getVariant(item) && getVariant(item).sku
              ? getVariant(item).sku
              : getProduct(item).sku
          }}
        </p>
        <!-- ▃▃▃▃▃▃▃▃▃ MPN ▃▃▃▃▃▃▃▃▃ -->

        <p
          v-if="
            (getVariant(item) && getVariant(item).mpn) || getProduct(item).mpn
          "
          class="my-1"
        >
          <small class="me-1">MPN: </small>
          {{
            getVariant(item) && getVariant(item).mpn
              ? getVariant(item).mpn
              : getProduct(item).mpn
          }}
        </p>
      </div>
      <!-- ▃▃▃▃▃▃▃▃▃ Price input mode for physical products ▃▃▃▃▃▃▃▃▃ -->
      <div
        v-if="
          item.preferences && item.preferences.dim_1 && item.preferences.dim_2
        "
        class="mt-2 d-flex align-stretch"
      >
        <div
          :title="$t('global.commons.width')"
          class="pa-1 m-1 rounded border flex-grow-1"
        >
          {{ item.preferences.dim_1 }}
        </div>
        <v-icon size="x-small">close</v-icon>
        <div
          :title="$t('global.commons.length')"
          class="pa-1 m-1 rounded border flex-grow-1"
        >
          {{ item.preferences.dim_2 }}
        </div>
        <template
          v-if="
            item.preferences.dim_3 && getProduct(item)?.price_input === 'volume'
          "
        >
          <v-icon size="x-small">close</v-icon>
          <div
            :title="$t('global.commons.height')"
            class="pa-1 m-1 rounded border flex-grow-1"
          >
            {{ item.preferences.dim_3 }}
          </div>
        </template>
      </div>
      <!-- ▃▃▃▃▃▃▃▃▃ 🎗️ Subscription ▃▃▃▃▃▃▃▃▃ -->
      <div
        v-if="item.subscription_price"
        :title="item.subscription_price?.description"
        class="my-1 small text-start"
      >
        <b class="d-block"
          ><img
            class="me-1"
            height="16"
            src="@selldone/core-js/assets/product-types/subscription.svg"
            width="16"
          />
          {{ item.subscription_price.title }}</b
        >
        <u-price
          :amount="item.subscription_price.price"
          :currency="item.subscription_price.currency"
        ></u-price>
        /
        {{ $t(BillingPeriod[item.subscription_price.period]?.title) }}
      </div>
    </template>
    <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ product.original ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

    <template v-slot:item.product.original="{ item }">
      <div
        v-if="getProduct(item).original"
        :title="$t('global.original_warranty')"
        class="my-1 min-width-150"
      >
        <v-icon class="me-1" color="blue" size="small">verified</v-icon>
        <span class="small">{{
          $t("global.original_warranty")?.limitWords(2)
        }}</span>
      </div>

      <div
        v-if="getProduct(item).warranty"
        :title="getProduct(item).warranty"
        class="my-1"
      >
        <v-icon class="me-1" color="amber" size="small"
          >workspace_premium
        </v-icon>

        <span class="small">
          {{ getProduct(item).warranty?.limitWords(2) }}</span
        >
      </div>

      <div
        v-if="getProduct(item).return_warranty"
        :title="
          $t('global.return_warranty_days', {
            days: getProduct(item).return_warranty,
          })
        "
        class="text-green my-1"
      >
        <v-icon class="me-1" color="green" size="small"
          >assignment_return
        </v-icon>
        <span class="small">
          {{ getProduct(item).return_warranty }}🞫
          {{ $t("global.commons.days") }}
        </span>
      </div>

      <div v-else class="my-1 text-red">
        <v-icon class="me-1" color="red" size="small"
          >disabled_by_default
        </v-icon>

        <span class="small"> {{ $t("global.no_return_warranty") }}</span>
      </div>
    </template>
    <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ count ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

    <template v-slot:item.count="{ item }">
      <div class="min-width-150">
        <b class="text-h4 font-weight-black">{{ item.count }}</b>
        {{ getProduct(item)?.unit ? getProduct(item).unit : "🞪" }}
      </div>

      <v-chip
        v-if="readonly || item.check"
        color="green"
        pill
        size="x-small"
        variant="flat"
      >
        <v-icon start>check_circle</v-icon>
        Available
      </v-chip>
      <v-chip v-else color="red" pill size="x-small" variant="flat">
        <v-icon start>cancel</v-icon>
        Not available
      </v-chip>

      <v-btn
        v-if="item.return_request"
        :color="getReturnRequestStateObject(item.return_request.state).color"
        class="mx-1"
        rounded
        size="small"
        variant="flat"
      >
        <v-icon
          :color="getReturnRequestStateObject(item.return_request.state).color"
          class="circle-bg"
          size="12px"
          start
        >
          {{ getReturnRequestStateObject(item.return_request.state).icon }}
        </v-icon>
        {{
          $t("global.basket_list.return_count", {
            count: item.return_request.count,
          })
        }}
      </v-btn>
    </template>
    <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ price ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

    <template v-slot:item.price="{ item }">
      <div class="min-width-150">
        <u-price
          v-if="item.price !== undefined"
          :amount="
            item.count * item.price -
            (item.offer_amount ? item.offer_amount : 0)
          "
          :currency="item.currency"
          class="text-h4"
        ></u-price>

        <div v-if="item.offer_amount">
          <v-chip class="ms-2" color="blue" size="small" title="Offer">
            <v-icon size="small" start>confirmation_number</v-icon>
            <u-price
              :amount="item.offer_amount"
              :currency="item.currency"
            ></u-price>
          </v-chip>
        </div>

        <div v-if="item.tax" class="small border-between-vertical">
          <u-text-value-dashed title="Calculated tax by a dedicated rule.">
            <template v-slot:label>{{ $t("global.commons.tax") }}</template>
            <v-chip
              v-if="item.tax.included"
              class="mx-1"
              color="#CDDC39"
              label
              size="x-small"
              title="Included in product price"
              >included
            </v-chip>
            <u-price
              :amount="item.tax.amount"
              :currency="item.currency"
            ></u-price>
          </u-text-value-dashed>

          <u-text-value-dashed v-if="item.tax.shipping">
            <template v-slot:label>Shipping Tax</template>
            <u-price
              :amount="item.tax.shipping"
              :currency="item.currency"
            ></u-price>
          </u-text-value-dashed>
        </div>

        <div
          v-if="
            item.preferences &&
            item.preferences.valuation &&
            getProduct(item).price_input === 'custom'
          "
          class="small border-top"
        >
          <u-text-value-dashed
            v-for="(valuation_item, j) in getProduct(item).valuation.structure"
            :key="j"
            :title="valuation_item.placeholder"
          >
            <template v-slot:label>{{ valuation_item.title }}</template>
            <u-check
              v-if="isBoolean(item.preferences.valuation[valuation_item.name])"
              :value="item.preferences.valuation[valuation_item.name]"
            ></u-check>
            <span v-else>{{
              item.preferences.valuation[valuation_item.name]
            }}</span>
          </u-text-value-dashed>

          <v-btn
            class="tnt ma-1"
            color="primary"
            size="small"
            title="Custom valuation inputs."
            variant="text"
            @click="showCustomizeDetail(item)"
          >
            <img
              class="me-1"
              height="16"
              src="../../../assets/icons/valuation.svg"
              width="16"
            />
            Valuation Preferences
          </v-btn>
        </div>
      </div>
    </template>
    <template v-slot:bottom>
      <v-pagination v-model="page" :length="pageCount" class="my-5" rounded />
    </template>
  </v-data-table>

  <!-- ██████████████████████ Dialog ██████████████████████ -->

  <v-dialog
    v-model="customize_detail_dialog"
    fullscreen
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card>
      <v-card-title>
        <img
          class="me-2"
          height="24"
          src="../../../assets/icons/valuation.svg"
          width="24"
        />
        Custom valuation pricing
      </v-card-title>
      <v-card-text v-if="selected_item">
        <s-product-section-valuation
          :current-variant="selected_item.variant"
          :preferences="selected_item.preferences"
          :product="selected_item.product"
          :shop="shop"
          readonly
        ></s-product-section-valuation>
      </v-card-text>
      <v-card-actions>
        <div class="widget-buttons">
          <v-btn
            size="x-large"
            variant="text"
            @click="customize_detail_dialog = false"
          >
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import VariantItemViewMicro from "../../../storefront/product/variant/VariantItemViewMicro.vue";
import { BasketHelper } from "@selldone/core-js/helper/shop/BasketHelper";
import { ShopOptionsHelper } from "@selldone/core-js/helper/shop/ShopOptionsHelper";
import UTextValueDashed from "../../../ui/text/value-dashed/UTextValueDashed.vue";
import BillingPeriod from "@selldone/core-js/enums/subscription/BillingPeriod";
import { OrderTypeCode } from "@selldone/core-js/enums/order/OrderTypeCode";
import SProductSectionValuation from "../../../storefront/product/section/valuation/SProductSectionValuation.vue";
import { BasketItemReturn } from "@selldone/core-js";

export default {
  name: "BOrderCart",
  components: {
    UTextValueDashed,
    SProductSectionValuation,
    VariantItemViewMicro,
  },
  props: {
    shop: {
      required: true,
      type: Object,
    },
    type: {},
    items: {
      required: true,
      type: Array,
    },

    checkable: {
      required: false,
      type: Boolean,
      default: false,
    },

    selectAll: {
      required: false,
      type: Boolean,
      default: false,
    },
    readonly: {
      // For POS orders > Don't need to check items in the basket!
      default: false,
      type: Boolean,
    },
    isRolePanel: Boolean,
  },

  data: function () {
    return {
      BillingPeriod: BillingPeriod,
      selected: [],

      page: 1,
      itemsPerPage: 10,

      headers: [
        {
          title: "#",
          align: "center",
          sortable: false,
          value: "row",
        },
        {
          title: this.$t("global.basket_list.table.image"),
          align: "center",
          sortable: false,
          value: "product_id",
        },

        {
          title: this.$t("global.basket_list.table.product_name"),
          align: "start",
          sortable: true,
          value: "product.title",
        },

        {
          title: this.$t("global.basket_list.table.variant"),
          align: "center",
          sortable: true,
          value: "variant",
        },

        {
          title: this.$t("global.basket_list.table.warranty"),
          align: "start",
          sortable: true,
          value: "product.original",
        },

        {
          title: this.$t("global.basket_list.table.count"),
          align: "center",
          sortable: true,
          value: "count",
        },

        {
          title: this.$t("global.basket_list.table.price"),
          align: "center",
          sortable: true,
          value: "price",
        },
      ],

      //-----------------------------------
      selected_item: null,
      customize_detail_dialog: false,
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

    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },

    size_unit() {
      return ShopOptionsHelper.GetSizeUnit(this.shop);
    },

    mass_unit() {
      return ShopOptionsHelper.GetMassUnit(this.shop);
    },

    isFulfillment() {
      return this.type === OrderTypeCode.Fulfillment;
    },
  },

  watch: {
    items(){
      this.selected = this.items.filter((item) => item.check);
    }
  },

  mounted() {
    if (this.selectAll) this.selected = Object.assign([], this.items);
    else {
      this.selected = this.items.filter((item) => item.check);
    }
  },

  created() {},

  methods: {
    getProduct(item) {
      return this.isFulfillment ? item.product?.parent : item.product;
    },
    getVariant(item) {
      return this.isFulfillment ? item.variant?.parent : item.variant;
    },

    getReturnRequestStateObject(state) {
      let out = BasketItemReturn.States[state];
      return out ? out : {};
    },

    /**
     * IMPORTANT! External call
     * @return {*[]}
     */
    getCheckedItems() {
      return this.selected;
    },

    getWeight(item) {
      return BasketHelper.GetBasketItemWeight(item, false);
    },
    getSize(item) {
      return BasketHelper.GetBasketItemSize(item, false);
    },

    showCustomizeDetail(item) {
      this.selected_item = item;
      this.customize_detail_dialog = true;
    },
  },
};
</script>
<style lang="scss" scoped>
.data-table {
  cursor: pointer;
  font-size: 1.071rem;
  font-weight: 400;
  color: #555;
  height: 68px;
}

.circle-bg {
  border-radius: 50%;
  background-color: white;
  padding: 4px;
  width: 18px;
  height: 18px;
}
</style>
