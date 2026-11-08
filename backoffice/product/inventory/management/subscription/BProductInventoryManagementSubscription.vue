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
  <div :class="{ 'b-product-pricing-refined': modern }">
    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Refined (Backoffice Pricings tab) ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
    <template v-if="modern">
      <header class="sd-modern-header b-product-pricing-refined__header">
        <div>
          <h1>{{ t("title") }}</h1>
          <p class="sd-modern-subtitle">{{ t("subtitle") }}</p>
        </div>
        <div class="sd-modern-actions">
          <v-btn
            class="sd-modern-button"
            color="primary"
            variant="flat"
            prepend-icon="add"
            @click="showEdit()"
            >{{ t("add_plan") }}</v-btn
          >
          <u-smart-menu
            modern
            icon="more_vert"
            :title="t('more_tools')"
            :with-trashed="withTrashed"
            has-with-trashed
            @update:withTrashed="(val) => $emit('update:withTrashed', val)"
          />
        </div>
      </header>

      <section
        class="sd-modern-widget b-product-pricing-refined__overview"
        :aria-label="t('overview')"
      >
        <div>
          <span>{{ t("active_plans") }}</span>
          <strong
            >{{ $n(active_count) }}
            <small
              >{{ t("active_plans_of", { total: live_count })
              }}<template v-if="deleted_count">
                · {{ t("deleted_count", { count: deleted_count }) }}</template
              ></small
            ></strong
          >
          <small>{{ t("shown_now") }}</small>
        </div>
        <div>
          <span>{{ t("subscribers") }}</span>
          <strong>{{
            subscribers_count === null ? "—" : $n(subscribers_count)
          }}</strong>
          <router-link
            v-if="!IS_VENDOR_PANEL"
            :to="{ name: 'BPageProductSubscribers' }"
            class="b-product-pricing-refined__link"
            >{{ t("open_subscribers")
            }}<v-icon size="13" aria-hidden="true"
              >arrow_forward</v-icon
            ></router-link
          >
        </div>
        <div>
          <span>{{ t("providers") }}</span>
          <div
            v-if="providers.length"
            class="b-product-pricing-refined__providers"
          >
            <div
              v-for="sg in providers"
              :key="sg.id"
              class="b-product-pricing-refined__provider"
            >
              <img
                v-if="sg.gateway.icon"
                :src="getShopImagePath(sg.gateway.icon)"
                width="26"
                height="26"
                alt=""
              />
              <v-icon v-else size="26" aria-hidden="true">credit_card</v-icon>
              <div>
                <b>{{ sg.gateway.name }} · {{ sg.gateway.currency }}</b>
                <span class="sd-modern-status sd-modern-status--plain"
                  ><span
                    class="sd-modern-status__dot"
                    :class="`sd-modern-status__dot--${providerState(sg).tone}`"
                  ></span
                  >{{ providerState(sg).label }}</span
                >
              </div>
            </div>
          </div>
          <strong v-else>{{ t("no_providers") }}</strong>
          <small>{{ t("providers_help") }}</small>
        </div>
      </section>

      <div
        class="sd-modern-widget sd-modern-data-table b-product-pricing-refined__list"
        :aria-busy="busy_delete || !!busy_restore"
      >
        <header
          class="sd-modern-header b-product-pricing-refined__section-header"
        >
          <div>
            <h2>
              {{ t("plans_title") }}
              <span class="b-product-pricing-refined__count">{{
                subscription_prices.length
              }}</span>
            </h2>
            <p class="sd-modern-subtitle">{{ t("plans_hint") }}</p>
          </div>
        </header>
        <div
          v-if="subscription_prices.length"
          class="sd-modern-list-header b-product-pricing-refined__columns"
          aria-hidden="true"
        >
          <span>{{ t("col_plan") }}</span>
          <span>{{ t("col_identifiers") }}</span>
          <span>{{ t("col_price") }}</span>
          <span>{{ t("col_provider") }}</span>
          <span>{{ t("col_sync") }}</span>
          <span class="text-end">{{ $t("global.commons.actions") }}</span>
        </div>
        <u-loading-progress
          v-if="busy_delete || busy_restore"
        ></u-loading-progress>
        <b-product-subscription-pricing-item
          v-for="subscription_price in subscription_prices"
          :key="subscription_price.id"
          :product="product"
          :shop="shop"
          :subscription-price="subscription_price"
          :loading="busy_restore === subscription_price.id"
          modern
          has-delete
          @delete="deletePrice(subscription_price.id)"
          @restore="restorePrice(subscription_price.id)"
          @select="showEdit(subscription_price)"
        />
        <b-list-empty-state
          v-if="!subscription_prices.length"
          kind="product"
          :title="t('empty_title')"
          :description="t('empty_description')"
        />
        <footer
          v-if="subscription_prices.length"
          class="sd-modern-table-footer b-product-pricing-refined__footer"
        >
          <span
            >{{ t("plan_count", { count: subscription_prices.length })
            }}<template v-if="deleted_count">
              · {{ t("deleted_shown", { count: deleted_count }) }}</template
            ></span
          >
        </footer>
      </div>
    </template>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Legacy (Studio, Vendor) ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
    <div v-else class="widget-box -large mb-5">
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
        :modern="modern"
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
import BListEmptyState from "../../../../empty-state/BListEmptyState.vue";
import BProductSubscriptionPricingAdd from "../../../../product/subscription/pricing/add/BProductSubscriptionPricingAdd.vue";
import BProductSubscriptionPricingItem from "../../../../product/subscription/pricing/item/BProductSubscriptionPricingItem.vue";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BProductInventoryManagementSubscription",
  mixins: [],
  components: {
    BListEmptyState,
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
    // Refined Backoffice presentation (Pricings tab); Studio and Vendor keep the legacy layout.
    modern: {
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

    live_count() {
      return this.subscription_prices.filter((price) => !price.deleted_at)
        .length;
    },
    active_count() {
      return this.subscription_prices.filter(
        (price) => !price.deleted_at && price.enable,
      ).length;
    },
    deleted_count() {
      return this.subscription_prices.length - this.live_count;
    },
    subscribers_count() {
      return typeof this.product.subscribers_count === "number"
        ? this.product.subscribers_count
        : null;
    },
    providers() {
      // Store payment methods referenced by at least one plan, each listed once.
      const codes = [
        ...new Set(this.subscription_prices.map((price) => price.gateway_code)),
      ];
      return codes
        .map((code) =>
          (this.shop.shop_gateways || []).find(
            (sg) => sg.gateway?.code === code,
          ),
        )
        .filter(Boolean);
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
    t(key, values) {
      return this.$t(`b_product_pricing.${key}`, values);
    },
    providerState(sg) {
      if (!sg.enable || !sg.gateway?.enable)
        return { tone: "error", label: this.t("disabled") };
      if (!sg.livemode) return { tone: "warning", label: this.t("sandbox") };
      return { tone: "success", label: this.t("live") };
    },
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

<style lang="scss" scoped>
// Same frame as the refined Physical inventory (BProductInventoryManagementPhysical).
.b-product-pricing-refined {
  display: grid;
  gap: 16px;
  font-size: 13px;
  line-height: 20px;
  font-weight: 400;
  --pricing-columns: minmax(170px, 1.5fr) minmax(110px, 0.9fr)
    minmax(120px, 1fr) minmax(150px, 1.2fr) minmax(170px, 1.4fr) 76px;

  &__header {
    margin: 0 0 2px;
    align-items: center;
  }
  &__header h1 {
    margin: 0;
    font-size: 23px;
    font-weight: 500;
    line-height: 30px;
  }
  &__header .sd-modern-subtitle {
    margin-block-start: 5px;
  }
  .sd-modern-widget {
    padding: 18px;
    border-radius: 14px;
  }
  &__overview {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px 24px;
  }
  &__overview > div {
    min-width: 0;
  }
  &__overview > div > span:first-child {
    display: block;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 18px;
  }
  &__overview strong {
    display: block;
    margin-block-start: 4px;
    font-size: 22px;
    font-weight: 600;
    line-height: 28px;
    font-variant-numeric: tabular-nums;
  }
  &__overview strong > small {
    font-size: 13px;
    font-weight: 400;
    color: var(--sd-modern-muted);
  }
  &__overview > div > small {
    display: block;
    margin-block-start: 2px;
    color: rgba(var(--v-theme-on-surface), 0.45);
    font-size: 12px;
    line-height: 18px;
  }
  &__link {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-block-start: 2px;
    color: rgb(var(--v-theme-primary));
    font-size: 12px;
    line-height: 18px;
    text-decoration: none;
  }
  &__link:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 2px;
    border-radius: 4px;
  }
  &__providers {
    display: grid;
    gap: 8px;
    margin-block-start: 7px;
  }
  &__provider {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  &__provider > img {
    flex: none;
    border-radius: 6px;
    object-fit: contain;
  }
  &__provider b {
    display: block;
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
    overflow-wrap: anywhere;
  }
  &__provider .sd-modern-status {
    font-size: 11px;
    line-height: 16px;
  }
  &__section-header {
    gap: 12px;
    align-items: center;
    margin-block-end: 15px;
  }
  &__section-header h2 {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
    line-height: 22px;
  }
  &__section-header .sd-modern-subtitle {
    margin-block-start: 3px;
    font-size: 12px;
    line-height: 18px;
  }
  &__count {
    font-size: 12px;
    color: var(--sd-modern-muted);
    font-weight: 400;
    margin-inline-start: 5px;
  }
  &__columns {
    display: grid;
    grid-template-columns: var(--pricing-columns);
    gap: 12px;
    padding: 0 12px 9px;
    border-block-end: 1px solid var(--sd-modern-border);
  }
  &__list {
    position: relative;
  }
  &__footer {
    margin-block-start: 10px;
    padding-block-start: 12px;
    font-size: 12px;
    gap: 12px;
  }

  @media (max-width: 1100px) {
    --pricing-columns: minmax(150px, 1.4fr) minmax(95px, 0.9fr)
      minmax(100px, 0.9fr) minmax(130px, 1.1fr) minmax(150px, 1.3fr) 64px;
  }
  @media (max-width: 959px) {
    &__columns {
      display: none;
    }
    &__overview {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  @media (max-width: 599px) {
    .sd-modern-widget {
      padding: 12px;
    }
    &__header,
    &__section-header {
      align-items: flex-start;
      flex-wrap: wrap;
    }
    &__header .sd-modern-actions {
      width: 100%;
    }
    &__header :deep(.v-btn) {
      min-height: 44px;
    }
    &__overview {
      grid-template-columns: minmax(0, 1fr);
    }
  }
}
</style>
