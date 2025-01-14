<!--
  - Copyright (c) 2023. Selldone® Business OS™
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
  <div class="s--shop-basket-items-list widget shadow my-3 mx-0 mx-md-3">
    <h2 class="d-flex align-center">
      <v-icon class="me-1" color="#111">shopping_bag</v-icon>
      {{ $t("global.commons.cart") }}
      <v-spacer></v-spacer>
    </h2>

    <v-list-subheader class="px-0"></v-list-subheader>

    <v-data-table
      v-model="selected"
      :header-props="{ sortByText: $t('global.commons.sort_by') }"
      :headers="headers"
      :hide-default-footer="!items || items.length <= 10"
      :items="items"
      :items-per-page="10"
      class="bg-transparent"
      density="compact"
    >
      <template v-slot:item.product_id="{ item }">
        <div class="d-flex align-center">
          <router-link
            :to="{
              name: window.$storefront.routes.PRODUCT_PAGE,
              params: {
                product_id: item.product_id,
              },
            }"
          >
            <v-img
              :max-height="isFile ? '42px' : '84px'"
              :max-width="isFile ? '42px' : '84px'"
              :src="
                item.product.icon
                  ? getShopImagePath(
                      item.variant?.image
                        ? item.variant?.image
                        : item.product.icon,
                      64,
                    )
                  : getProductImage(item.product_id)
              "
              aspect-ratio="1"
              class="mx-auto my-2 rounded pointer-pointer border"
              min-height="62"
              min-width="62"
              color="#fff"
            />
          </router-link>
          <v-btn
            v-if="isFile && isPayed"
            class="mx-2"
            color="green"
            size="large"
            variant="flat"
            @click="$emit('show-download-list', item)"
          >
            <v-icon class="me-2">cloud_download</v-icon>
            {{ $t("global.actions.download") }}
          </v-btn>
        </div>
      </template>

      <template v-slot:item.product.title="{ item }">
        <div class="min-width-200 text-start">
          <p class="m-0">
            <b>{{ item.product.title }}</b>

            <v-tooltip location="bottom">
              <template v-slot:activator="{ props }">
                <i
                  v-if="item.product.original"
                  class="fas fa-certificate text-primary mx-2"
                  v-bind="props"
                ></i>
              </template>
              <span
                >{{ $t("order_page.basket_items.original_warranty") }}
              </span>
            </v-tooltip>

            <v-tooltip location="bottom">
              <template v-slot:activator="{ props }">
                <i
                  v-if="item.product.warranty"
                  class="fas fa-shield-alt text-success mx-2"
                  v-bind="props"
                ></i>
              </template>
              <span> {{ item.product.warranty }}</span>
            </v-tooltip>
          </p>
          <small class="m-0">
            {{ item.product.title_en?.limitWords(32) }}</small
          >

          <variant-item-view-micro
            v-if="item.variant"
            :product-variant="item.variant"
          />
        </div>

        <div
          v-if="
            item.preferences &&
            item.preferences.valuation &&
            item.product.price_input === 'custom'
          "
        >
          <v-btn
            class="tnt ma-1"
            color="primary"
            size="small"
            @click="showCustomizeDetail(item)"
            >Customized
          </v-btn>
        </div>
      </template>

      <template v-slot:item.count="{ item }">
        <u-text-decimal
          class="font-weight-black me-2"
          :value="
            item.count + (item.count_adjustment ? item.count_adjustment : 0)
          "
          :decimals="item.product?.unit_float ? 3 : 0"
          compact
        ></u-text-decimal>

        <i
          v-if="
            !item.check &&
            basket.delivery_state === Basket.PhysicalOrderStates.CheckQueue.code
          "
          class="fa fa-spinner fa-pulse fa-fw"
          title="Waiting to confirm by seller..."
        />
        <i v-else-if="item.check" class="fas fa-check-circle text-success" />
        <i v-else class="fas fa-times-circle text-danger" />

        <v-chip v-if="item.count_adjustment" size="x-small" color="#333" variant="flat" class="ma-1">
          {{$t('global.commons.adjusted')}}:  {{item.count_adjustment}}

          <v-tooltip activator="parent" location="bottom" content-class="bg-black text-start">
            {{$t('global.commons.original_amount')}}: <b>{{item.count}}  {{ item.product?.unit ? item.product.unit : "🞪" }}</b><br>
            {{$t('global.commons.adjustment_amount')}}: <b>{{item.count_adjustment}}  {{ item.product?.unit ? item.product.unit : "🞪" }}</b>

            <div class="border-top border-white mt-1 pt-1">
              {{$t('global.commons.final_amount')}}: <b>{{item.count + item.count_adjustment}}  {{ item.product?.unit ? item.product.unit : "🞪" }}</b>
            </div>
          </v-tooltip>
        </v-chip>

        <div v-if="item.product.inputs && item.product.inputs.length">
          <v-btn
            class="tnt my-1"
            color="success"
            size="small"
            @click.stop="
              () => {
                selected_item = item;
                bottom_sheet_user_message = true;
              }
            "
          >
            <v-icon start>add</v-icon>
            User data form
          </v-btn>
          <v-progress-linear
            :model-value="getFilledPercent(item)"
            class="mt-1"
            color="#AFB42B"
            rounded
            striped
            style="max-width: 166px"
          ></v-progress-linear>
        </div>

        <!-- ▃▃▃▃▃▃▃▃▃ Price input mode for physical products ▃▃▃▃▃▃▃▃▃ -->
        <div
          v-if="
            item.preferences && item.preferences.dim_1 && item.preferences.dim_2
          "
          class="mt-2 d-flex align-stretch align-center"
        >
          <div
            :title="$t('global.commons.width')"
            class="pa-1 m-1 rounded border flex-grow-1"
          >
            {{ item.preferences.dim_1 }}
          </div>
          <v-icon size="x-small" class="my-auto">close</v-icon>
          <div
            :title="$t('global.commons.length')"
            class="pa-1 m-1 rounded border flex-grow-1"
          >
            {{ item.preferences.dim_2 }}
          </div>
          <template
            v-if="
              item.preferences.dim_3 && item.product?.price_input === 'volume'
            "
          >
            <v-icon size="x-small" class="my-auto">close</v-icon>
            <div
              :title="$t('global.commons.height')"
              class="pa-1 m-1 rounded border flex-grow-1"
            >
              {{ item.preferences.dim_3 }}
            </div>
          </template>
        </div>
      </template>

      <template v-slot:item.price="{ item }">
        <u-price
          :amount="item.price + item.dis"
          :currency="item.currency"
        ></u-price>
      </template>

      <template v-slot:item.total_price="{ item }">
        <u-price
          :amount="item.count * (item.price + item.dis)"
          :currency="item.currency"
        ></u-price>
      </template>

      <template v-slot:item.dis="{ item }">
        <u-price
          v-if="item.dis"
          :amount="-item.count * item.dis"
          :currency="item.currency"
        ></u-price>

        <div v-if="item.offer_amount">
          <v-chip color="blue" variant="flat" size="small" title="Offer">
            <v-icon start>add</v-icon>
            <u-price
              :amount="-item.offer_amount"
              :currency="item.currency"
            ></u-price>
          </v-chip>
        </div>
      </template>

      <template v-slot:item.final_price="{ item }">
        <u-price
          :amount="
            item.count * item.price -
            (item.offer_amount ? item.offer_amount : 0)
          "
          :currency="item.currency"
        ></u-price>
      </template>

      <template v-if="isPhysical" v-slot:item.return_request="{ item }">
        <p v-if="item.return_request">
          <v-icon
            :color="getStateItemStateObject(item.return_request.state).color"
            class="me-2"
            size="small"
          >
            {{ getStateItemStateObject(item.return_request.state).icon }}
          </v-icon>

          {{ $t(getStateItemStateObject(item.return_request.state).name) }}
        </p>

        <v-btn
          v-if="
            item.product.return_warranty &&
            inDayRange(basket.delivery_at, item.product.return_warranty) &&
            (!item.return_request || item.return_request.state === 'Pending')
          "
          :size="
            item.return_request && item.return_request.state === 'Pending'
              ? 'small'
              : undefined
          "
          color="red"
          rounded
          variant="flat"
          @click.stop="
            () => {
              selected_item = item;
              bottom_sheet = true;
            }
          "
        >
          <v-icon start>
            {{
              item.return_request && item.return_request.state === "Pending"
                ? "edit"
                : "keyboard_return"
            }}
          </v-icon>
          {{ $t("order_page.basket_items.return") }}
        </v-btn>
      </template>
    </v-data-table>

    <!-- -------------------------- Return request-------------------------- -->

    <v-bottom-sheet
      v-model="bottom_sheet"
      width="98vw"
      max-width="840"
      persistent
      scrollable
      content-class="rounded-t-xl"
    >
      <s-shop-basket-item-return-form
        v-if="selected_item"
        :basket-item="selected_item"
        @onClose="bottom_sheet = false"
      />
    </v-bottom-sheet>

    <!-- ██████████████████████ Dialog >  User form ██████████████████████ -->

    <v-bottom-sheet
      v-model="bottom_sheet_user_message"
      fullscreen
      scrollable
      transition="dialog-bottom-transition"
    >
      <v-card v-if="selected_item" class="text-start">
        <v-card-title class="d-flex align-center">
          <v-avatar
            v-if="selected_item.product.icon"
            class="me-2"
            rounded
            size="42"
          >
            <v-img :src="getShopImagePath(selected_item.product.icon, 128)" />
          </v-avatar>
          <div>
            {{ selected_item.product.title }}
            <small class="d-block">
              {{ selected_item.product.title_en }}
              <variant-item-view-micro
                v-if="selected_item.variant"
                :product-variant="selected_item.variant"
                class="mx-2 inline-block p-0"
              />
            </small>
          </div>
        </v-card-title>

        <v-card-text>
          <v-container>
            <basket-item-user-message-form
              :basket="basket"
              :product="selected_item.product"
              :variant-id="selected_item.variant_id"
              force-show
            />
          </v-container>
        </v-card-text>

        <v-card-actions>
          <div class="widget-buttons">
            <v-btn
              size="x-large"
              variant="text"
              @click="bottom_sheet_user_message = false"
            >
              <v-icon start>close</v-icon>
              {{ $t("global.actions.close") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-bottom-sheet>

    <!-- ██████████████████████ Dialog > Valuation (Pricing form) ██████████████████████ -->

    <v-dialog
      v-model="customize_detail_dialog"
      fullscreen
      scrollable
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-card-title></v-card-title>
        <v-card-text v-if="selected_item">
          <s-product-section-valuation
            :current-variant="selected_item.variant"
            :preferences="selected_item.preferences"
            :product="selected_item.product"
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
  </div>
</template>

<script lang="ts">
import VariantItemViewMicro from "../../../storefront/product/variant/VariantItemViewMicro.vue";
import SShopBasketItemReturnForm from "../../../storefront/order/return/SShopBasketItemReturnForm.vue";
import BasketItemUserMessageForm from "../../../storefront/order/product-input/BasketItemUserMessageForm.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import SProductSectionValuation from "../../../storefront/product/section/valuation/SProductSectionValuation.vue";
import { Basket, BasketItemReturn } from "@selldone/core-js";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import UTextDecimal from "@selldone/components-vue/ui/text/decimal/UTextDecimal.vue";

export default {
  name: "SShopBasketItemsList",
  mixins: [DateMixin],
  components: {
    UTextDecimal,
    SProductSectionValuation,
    BasketItemUserMessageForm,
    SShopBasketItemReturnForm,
    VariantItemViewMicro,
  },
  props: {
    items: {
      required: true,
      type: Array,
    },
    selectable: {
      required: false,
      type: Boolean,
      default: false,
    },
    basket: {
      required: true,
      type: Object,
    },
  },

  data: function () {
    return {
      bottom_sheet_user_message: false,
      bottom_sheet: false,
      selected_item: null,

      selected: [],

      //-----------------------------------
      customize_detail_dialog: false,
    };
  },

  computed: {
    Basket() {
      return Basket;
    },
    type() {
      return this.basket.type;
    },
    isFile() {
      return this.type === ProductType.FILE.code;
    },
    isPhysical() {
      return this.type === ProductType.PHYSICAL.code;
    },
    isPayed() {
      return this.basket.status === "Payed";
    },

    headers() {
      const out = [
        {
          title: "",
          align: "start",
          value: "product_id",
        },
        {
          title: this.$t("order_page.basket_items.table.product"),
          align: "start",
          value: "product.title",
        },
        {
          title: this.$t("order_page.basket_items.table.count"),
          align: "start",
          value: "count",
        },

        {
          title: this.$t("order_page.basket_items.table.unit_price"),
          align: "center",
          value: "price",
          sortable: true,
        },
        {
          title: this.$t("order_page.basket_items.table.total_price"),
          align: "center",
          sortable: false,
          value: "total_price",
        },
        {
          title: this.$t("order_page.basket_items.table.discount"),
          align: "center",
          value: "dis",
        },
        {
          title: this.$t("order_page.basket_items.table.final_price"),
          align: "center",
          value: "final_price",
          sortable: false,
        },
      ];

      if (this.isPhysical) {
        out.push({
          text: this.$t("order_page.basket_items.table.returned"),
          align: "center",
          value: "return_request",
          sortable: true,
        });
      }

      return out;
    },
  },

  watch: {
    selected() {
      if (this.selectable) this.$emit("select", this.selected);
    },
    selectable(val) {
      this.selected = [];
    },
  },
  created() {},

  methods: {
    getStateItemStateObject(state) {
      return BasketItemReturn.States[state]
        ? BasketItemReturn.States[state]
        : {};
    },
    getFilledPercent(_basket_item) {
      if (!_basket_item.message) return 0;

      let out = 0;
      const x = 100 / _basket_item.product.inputs.length;
      _basket_item.product.inputs.forEach((item) => {
        out += _basket_item.message[item.name] ? x : 0;
      });

      return out;
    },

    showCustomizeDetail(item) {
      this.selected_item = item;
      this.customize_detail_dialog = true;
    },
  },
};
</script>
<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */
.s--shop-basket-items-list {
}

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--shop-basket-items-list {
}
</style>
