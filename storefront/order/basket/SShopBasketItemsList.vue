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

    <v-subheader class="px-0"></v-subheader>

    <v-data-table
      v-model="selected"
      :headers="headers"
      :items="items"
      :items-per-page="10"
      :hide-default-footer="!items || items.length <= 10"
      :header-props="{ sortByText: $t('global.commons.sort_by') }"
      class="bg-transparent dense-padding"
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
              class="mx-auto my-2 rounded pointer-pointer"
              :max-height="isFile ? '42px' : '84px'"
              :max-width="isFile ? '42px' : '84px'"
              min-height="42px"
              min-width="42px"
              aspect-ratio="1"
              :src="
                item.product.icon
                  ? getShopImagePath(
                      item.variant?.image
                        ? item.variant?.image
                        : item.product.icon,
                      64
                    )
                  : getProductImage(item.product_id)
              "
            />
          </router-link>
          <v-btn
            v-if="isFile && isPayed"
            large
            depressed
            color="green"
            dark
            class="mx-2"
            @click="$emit('show-download-list', item)"
            ><v-icon class="me-2">cloud_download</v-icon>
            {{ $t("global.actions.download") }}</v-btn
          >
        </div>
      </template>

      <template v-slot:item.product.title="{ item }">
        <div class="min-width-200">
          <p class="m-0">
            <b>{{ item.product.title }}</b>

            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <i
                  v-if="item.product.original"
                  class="fas fa-certificate text-primary mx-2"
                  v-on="on"
                ></i>
              </template>
              <span
                >{{ $t("order_page.basket_items.original_warranty") }}
              </span>
            </v-tooltip>

            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <i
                  v-if="item.product.warranty"
                  class="fas fa-shield-alt text-success mx-2"
                  v-on="on"
                ></i>
              </template>
              <span> {{ item.product.warranty }}</span>
            </v-tooltip>
          </p>
          <small class="m-0"> {{ item.product.title_en }}</small>

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
            color="primary"
            class="tnt ma-1"
            small
            @click="showCustomizeDetail(item)"
            >Customized</v-btn
          >
        </div>
      </template>

      <template v-slot:item.count="{ item }">
        {{ item.count }}

        <i v-if="item.check" class="fas fa-check-circle text-success" />
        <i v-else class="fas fa-times-circle text-danger" />
        <div v-if="item.product.inputs && item.product.inputs.length">
          <v-btn
            color="success"
            dark
            small
            @click.stop="
              () => {
                selected_item = item;
                bottom_sheet_user_message = true;
              }
            "
            class="tnt my-1"
            ><v-icon class="me-1" small>add</v-icon>User data form
          </v-btn>
          <v-progress-linear
            :value="getFilledPercent(item)"
            rounded
            striped
            color="#AFB42B"
            style="max-width: 166px"
            class="mt-1"
          ></v-progress-linear>
        </div>
      </template>

      <template v-slot:item.price="{ item }">
        <price-view
          :amount="item.price + item.dis"
          :currency="item.currency"
        ></price-view>
      </template>

      <template v-slot:item.total_price="{ item }">
        <price-view
          :amount="item.count * (item.price + item.dis)"
          :currency="item.currency"
        ></price-view>
      </template>

      <template v-slot:item.dis="{ item }">
        <price-view
          v-if="item.dis"
          :amount="-item.count * item.dis"
          :currency="item.currency"
        ></price-view>

        <div v-if="item.offer_amount">
          <v-chip title="Offer" small color="blue" dark
            ><v-icon left small>add</v-icon>
            <price-view
              :amount="-item.offer_amount"
              :currency="item.currency"
            ></price-view>
          </v-chip>
        </div>
      </template>

      <template v-slot:item.final_price="{ item }">
        <price-view
          :amount="
            item.count * item.price -
            (item.offer_amount ? item.offer_amount : 0)
          "
          :currency="item.currency"
        ></price-view>
      </template>

      <template v-if="isPhysical" v-slot:item.return_request="{ item }">
        <p v-if="item.return_request">
          <v-icon
            class="me-2"
            small
            :color="getStateItemStateObject(item.return_request.state).color"
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
          rounded
          color="red"
          depressed
          dark
          :small="
            item.return_request && item.return_request.state === 'Pending'
          "
          @click.stop="
            () => {
              selected_item = item;
              bottom_sheet = true;
            }
          "
        >
          <v-icon class="mx-2">
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

    <v-bottom-sheet v-model="bottom_sheet" inset scrollable persistent>
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
            /></small>
          </div>
        </v-card-title>

        <v-card-text>
          <v-container>
            <basket-item-user-message-form
              :product="selected_item.product"
              :variant-id="selected_item.variant_id"
              :basket="basket"
              force-show
            />
          </v-container>
        </v-card-text>

        <v-card-actions>
          <div class="widget-buttons">
            <v-btn @click="bottom_sheet_user_message = false" text x-large>
              <v-icon class="me-1">close</v-icon>
              {{ $t("global.actions.close") }}</v-btn
            >
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
        <v-card-title> </v-card-title>
        <v-card-text v-if="selected_item">
          <product-section-box-valuation
            :shop="getShop()"
            :product="selected_item.product"
            :current-variant="selected_item.variant"
            :preferences="selected_item.preferences"
            readonly
          ></product-section-box-valuation>
        </v-card-text>
        <v-card-actions>
          <div class="widget-buttons">
            <v-btn @click="customize_detail_dialog = false" text x-large>
              <v-icon class="me-1">close</v-icon>
              {{ $t("global.actions.close") }}</v-btn
            >
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import VariantItemViewMicro from "@components/product/variant/VariantItemViewMicro.vue";
import { ReturnItemStates } from "@core/enums/basket/ReturnItemStates";
import SShopBasketItemReturnForm from "@components/storefront/order/return/SShopBasketItemReturnForm.vue";
import BasketItemUserMessageForm from "@components/order/product-input/BasketItemUserMessageForm.vue";
import { ProductType } from "@core/enums/product/ProductType";
import ProductSectionBoxValuation from "@components/product/sections/ProductSectionBoxValuation.vue";

export default {
  name: "SShopBasketItemsList",
  components: {
    ProductSectionBoxValuation,
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
        { text: "", align: "center", sortable: false, value: "product_id" },
        {
          text: this.$t("order_page.basket_items.table.product"),
          align: "start",
          value: "product.title",
        },
        {
          text: this.$t("order_page.basket_items.table.count"),
          align: "start",
          value: "count",
        },

        {
          text: this.$t("order_page.basket_items.table.unit_price"),
          align: "center",
          value: "price",
          sortable: true,
        },
        {
          text: this.$t("order_page.basket_items.table.total_price"),
          align: "center",
          sortable: false,
          value: "total_price",
        },
        {
          text: this.$t("order_page.basket_items.table.discount"),
          align: "center",
          value: "dis",
        },
        {
          text: this.$t("order_page.basket_items.table.final_price"),
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
      return ReturnItemStates[state] ? ReturnItemStates[state] : {};
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
<style scoped lang="scss">

/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */
.s--shop-basket-items-list{

}

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--shop-basket-items-list{

}

</style>
