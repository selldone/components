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

<template>
  <div>
    <!-- ███████████████████████ Dialog ███████████████████████ -->
    <v-dialog
      v-model="show"
      fullscreen
      scrollable
      transition="dialog-bottom-transition"
    >
      <v-card class="text-start">
        <v-card-title>
          <v-avatar class="me-2" size="36">
            <img :src="getShopImagePath(shop.icon, 64)" />
          </v-avatar>

          {{ $t("share_order.retrieve_dialog_title") }}
        </v-card-title>
        <v-card-text>
          <v-container>
            <div v-if="user" class="d-flex align-center mb-2">
              <v-avatar class="me-2 avatar-gradient -thin -user">
                <img :src="getUserAvatar(user.id, 64)" />
              </v-avatar>
              <div class="flex-grow-1">
                <b class="d-block">{{ user.name }}</b>
                {{ user.email }}
              </div>
            </div>

            <v-list class="border-between-vertical">
              <v-list-item v-for="item in items" :key="item.id">
                <template v-slot:prepend>
                  <v-avatar tile>
                    <v-img
                      v-if="item.product.icon"
                      :src="getShopImagePath(item.product.icon, 64)"
                    ></v-img>
                    <v-icon v-else color="#ddd">inventory</v-icon>
                  </v-avatar>
                </template>

                <v-list-item-title>
                  <router-link
                    :to="{
                      name: window.$storefront.routes.PRODUCT_PAGE,
                      params: { product_id: item.product_id },
                      query: { variant_id: item.variant_id },
                    }"
                    target="_blank"
                  >
                    <b>{{ item.product.title }}</b>
                  </router-link>
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ item.product.title_en }}
                </v-list-item-subtitle>
                <v-list-item-subtitle>
                  <variant-item-view-micro
                    v-if="item.variant"
                    :product-variant="item.variant"
                  ></variant-item-view-micro>
                </v-list-item-subtitle>

                <v-list-item-action>
                  <b>{{ item.count }}</b>
                </v-list-item-action>

                <v-list-item-action>
                  <price-view
                    :amount="item.price"
                    :currency="item.currency"
                  ></price-view>
                </v-list-item-action>
              </v-list-item>
            </v-list>

            <s-shop-customer-receiver-info-widget
              v-if="receiver_info"
              :receiver-info="receiver_info"
              class="mt-5"
            ></s-shop-customer-receiver-info-widget>

            <div class="widget-buttons my-5">
              <v-btn
                :loading="busy_import"
                color="primary"
                size="x-large"
                @click="importOrder"
              >
                <v-icon class="me-1">shopping_cart_checkout</v-icon>
                {{ $t("share_order.import_order_action") }}
              </v-btn>
            </div>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <div class="widget-buttons">
            <v-btn size="x-large" variant="text" @click="show = false">
              <v-icon start>close </v-icon>
              {{ $t("global.actions.close") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import VariantItemViewMicro from "@components/storefront/product/variant/VariantItemViewMicro.vue";
import SShopCustomerReceiverInfoWidget from "@components/storefront/order/delivery/SShopCustomerReceiverInfoWidget.vue";
import { ShopOptionsHelper } from "@core/helper/shop/ShopOptionsHelper";

export default {
  name: "SStorefrontRetrieveShareOrder",
  components: { SShopCustomerReceiverInfoWidget, VariantItemViewMicro },
  props: {
    shop: {
      require: true,
      type: Object,
    },
  },
  data: () => ({
    retrieve_link: null,
    busy: false,
    show: false,

    type: null,
    items: null,
    receiver_info: null,
    user: null,

    busy_import: false,
  }),

  created() {
    this.retrieve_link = this.$route.query.retrieve
      ?.replace(/[_]/g, "/")
      .replace(/[~]/g, "?")
      .replace(/[|]/g, "&");

    if (this.retrieve_link) this.fetch();
  },
  methods: {
    fetch() {
      this.busy = true;

      axios
        .get(this.retrieve_link)
        .then(({ data }) => {
          if (!data.error) {
            this.type = data.type;
            this.items = data.items;
            this.receiver_info = data.receiver_info;
            this.user = data.user;
            this.show = true;
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },
    importOrder() {
      if (
        !this.USER() &&
        !ShopOptionsHelper.HasGuestCheckout(this.shop) /*🥶 Guest*/
      ) {
        this.NeedLogin();
        return;
      }

      this.busy_import = true;

      axios
        .post(window.XAPI.POST_BASKET_IMPORT(this.shop_name, this.type), {
          currency: this.GetUserSelectedCurrency().code,
          items: this.items,
          receiver_info: this.receiver_info,
        })
        .then(({ data }) => {
          if (!data.error) {
            this.showSuccessAlert(
              "Import completed",
              "Items in your cart has been replaced by new items.",
            );
            this.show = false;
            this.$router.push({
              name: window.$storefront.routes.BASKET_PAGE,
              params: { type: data.basket.type },
            });

            this.fetchBasketAndShop();
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_import = false;
        });
    },
  },
};
</script>

<style scoped></style>
