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
  <div>
    <div class="widget-box -large mb-5">
      <u-widget-header
        add-caption="Add new pricing "
        icon="fa:fas fa-cubes-stacked"
        title="Subscription Pricings"
        @click:add="showEdit()"
      >
      </u-widget-header>

      <v-list-subheader>
        Selldone Ribbon is the fastest way for your business to bill customers
        with subscriptions or invoices. Earn more, support new products or
        business models, and accept recurring payments globally in a few clicks.
      </v-list-subheader>

      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Pricing List ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <v-row no-gutters>
        <v-spacer></v-spacer>
        <u-smart-menu
          :with-trashed="withTrashed"
          has-with-trashed
          @update:withTrashed="(val) => $emit('update:withTrashed', val)"
        >
        </u-smart-menu>
      </v-row>

      <u-loading-progress v-if="busy_restore"></u-loading-progress>

      <b-product-subscription-pricing-item
        v-for="(subscription_price, index) in subscription_prices"
        :key="index"
        :product="product"
        :shop="shop"
        :subscription-price="subscription_price"
        class="widget-hover mx-2"
        has-delete
        @delete="deletePrice(subscription_price.id)"
        @restore="restorePrice(subscription_price.id)"
        @select="showEdit(subscription_price)"
      />
    </div>

    <!-- ███████████████████████ Dialog > Add/Edit Pricing ███████████████████████ -->

    <v-dialog
      v-model="dialog"
      fullscreen
      scrollable
      transition="dialog-bottom-transition"
    >
      <b-product-subscription-pricing-add
        v-if="dialog_pre"
        :for-studio="forStudio"
        :product="product"
        :shop="shop"
        :subscription-price="current_item"
        @close="
          dialog = false;
          $route.query.price_id
            ? $router.replace({
                query: null,
              })
            : undefined;
        "
      />
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { BusinessModel } from "@selldone/core-js/enums/shop/BusinessModel";
import USmartMenu from "../../../../../ui/smart/menu/USmartMenu.vue";
import BProductSubscriptionPricingAdd from "../../../../product/subscription/pricing/add/BProductSubscriptionPricingAdd.vue";
import BProductSubscriptionPricingItem from "../../../../product/subscription/pricing/item/BProductSubscriptionPricingItem.vue";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BProductInventoryManagementSubscription",
  mixins: [],
  components: {
    BProductSubscriptionPricingItem,
    BProductSubscriptionPricingAdd,
    USmartMenu,
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
      subscription_prices: [],

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
      busy_delete: false,

      busy_restore: null,
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
  },

  watch: {
    // Update route to keep variant (Can open variant directly by the url)
    current_item(current_item) {
      if (!current_item && !this.$route.query.price_id) return;
      if (
        current_item &&
        this.getId(this.$route.query.price_id) === current_item.id
      )
        return;
      this.$router.replace({
        query: current_item ? { price_id: current_item.id } : null,
      });
    },
  },
  created() {
    this.quantity = this.product.quantity;
    this.old_quantity = this.quantity;

    this.subscription_prices = this.product.subscription_prices;
    if (!this.subscription_prices) this.subscription_prices = [];

    // Auto open variant by query parameter:
    if (this.$route.query.price_id) {
      this.current_item = this.subscription_prices.find(
        (item) => item.id === Number(this.$route.query.price_id),
      );
      if (this.current_item) {
        this.dialog_pre = true;
        this.dialog = true;
      }
    }
  },
  methods: {
    //――――――――――――――――――――――― Variant ▶ Delete ―――――――――――――――――――――――

    deletePrice(price_id) {
      this.busy_delete = true;

      axios
        .delete(
          window.API.DELETE_PRODUCT_EDIT_SUBSCRIPTION_PRICE(
            this.product.shop_id,
            this.product.id,
            price_id,
          ),
        )
        .then(({ data }) => {
          if (!data.error) {
            NotificationService.showSuccessAlert(
              null,
              this.$t(
                "product_admin.inventory.variants.notifications.delete_success",
              ),
            );
            this.product.variants = data.variants;
            this.product.quantity = data.quantity;

            this.DeleteItemByID(this.subscription_prices, price_id);

            this.dialog = false;

            this.$forceUpdate(); // Update vue component!
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_delete = false;
        });
    },

    //――――――――――――――――――――――― Sho Edit ―――――――――――――――――――――――

    showEdit(subscription_price) {
      this.current_item = subscription_price;
      this.dialog_pre = false;
      this.$nextTick(() => {
        this.dialog_pre = true;
        this.$nextTick(() => {
          this.dialog = true;
        });
      });
    },

    //――――――――――――――――――――――― Variant ▶ Restore ―――――――――――――――――――――――

    restorePrice(price_id) {
      this.busy_restore = price_id;

      axios
        .post(
          window.API.POST_RESTORE_PRODUCT_EDIT_SUBSCRIPTION_PRICE(
            this.product.shop_id,
            this.product.id,
            price_id,
          ),
        )
        .then(({ data }) => {
          if (!data.error) {
            NotificationService.showSuccessAlert(
              null,
              "The product variant was restored successfully.",
            );
            this.product.variants = data.variants;
            this.product.quantity = data.quantity;

            this.AddOrUpdateItemByID(
              this.subscription_prices,
              data.subscription_price,
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
          this.busy_restore = null;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
