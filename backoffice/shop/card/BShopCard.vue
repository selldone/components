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
  <router-link
    :class="{ 'a-white': dark, '-rtl': $vuetify.locale.isRtl }"
    :to="to"
    class="s--shop-card"
  >
    <v-sheet
      :color="dark ? SaminColorDarkDeep : '#fff'"
      :dark="dark"
      :style="{ '--background': dark ? SaminColorDarkDeep : '#fff' }"
      class="x--shop-card"
    >
      <v-list-item class="py-3">
        <template v-slot:prepend>
          <v-avatar class="avatar-gradient -thin -shop" size="42">
            <img v-if="shop.icon" :src="getShopImagePath(shop.icon, 128)" />
            <v-icon v-else color="#FFF">storefront</v-icon>
          </v-avatar>
        </template>

        <v-list-item-title
          :title="`Business UID: @${shop.name}`"
          class="d-flex align-center mb-1"
        >
          <v-icon :color="shop.active ? 'green' : 'red'" class="me-1" size="16"
            >circle
          </v-icon>
          {{ shop.title }}
          <v-chip
            v-if="business_model"
            class="ms-1"
            pill
            size="x-small"
            variant="plain"
            >{{ $t(business_model.name) }}
          </v-chip>
        </v-list-item-title>

        <u-fade-scroll drag-scroll>
          <v-icon
            v-if="shop.user_id === USER_ID()"
            class="me-2"
            color="amber"
            size="x-small"
            title="Owner"
            >fa:fas fa-crown
          </v-icon>

          <v-chip
            v-for="item in shop.shop_permissions"
            :key="item.level"
            :theme="dark ? 'dark' : 'light'"
            :title="$t(getShopPermissionObject(item.level).description)"
            class="m-1 px-1"
            pill
            ripple
            size="small"
            variant="outlined"
          >
            <img
              :src="getShopPermissionObject(item.level).src"
              :title="$t(getShopPermissionObject(item.level).description)"
              class="me-1"
              height="12"
              width="12"
            />
            {{ $t(getShopPermissionObject(item.level).text) }}
          </v-chip>
          <div style="min-width: 100px; display: inline-block"></div>
        </u-fade-scroll>

        <template v-slot:append>
          <v-list-item-action end style="z-index: 10">
            <v-menu
              v-if="total_sell"
              :close-on-content-click="false"
              open-on-hover
            >
              <template v-slot:activator="{ props }">
                <span class="badge-sell-products" v-bind="props">
                  {{ numeralFormat(total_sell, "0.[0]a") }} 🔔
                  <br />
                  <small
                    ><i class="fas fa-circle mx-1 blink-me"></i>
                    {{ $t("user_dashboard.shops.shop_card.orders") }}
                  </small>
                </span>
              </template>

              <v-card
                :theme="dark ? 'dark' : 'light'"
                class="text-start"
                rounded="xl"
              >
                <v-card-text>
                  <v-list
                    :dark="dark"
                    class="border-between-vertical rounded-xl overflow-hidden pa-0"
                  >
                    <v-list-item
                      v-if="sell_products_physical"
                      :class="[dark ? 'a-white' : '']"
                      :to="{
                        name: 'BPageShopOrdersPhysical',
                        params: { shop_id: shop.id },
                      }"
                    >
                      <template v-slot:prepend>
                        <img
                          :src="ProductType.PHYSICAL.image"
                          class="me-3"
                          height="16"
                          width="16"
                        />
                      </template>

                      <v-list-item-title>
                        {{
                          $t(
                            "user_dashboard.shops.shop_card.menu_orders.physical",
                          )
                        }}
                      </v-list-item-title>

                      <template v-slot:append>
                        <b class="ms-3">{{
                          numeralFormat(sell_products_physical, "0.[0]a")
                        }}</b>
                      </template>
                    </v-list-item>

                    <v-list-item
                      v-if="sell_products_virtual"
                      :class="[dark ? 'a-white' : '']"
                      :to="{
                        name: 'BPageShopOrdersVirtual',
                        params: { shop_id: shop.id },
                      }"
                    >
                      <template v-slot:prepend>
                        <img
                          :src="ProductType.VIRTUAL.image"
                          class="me-3"
                          height="16"
                          width="16"
                        />
                      </template>

                      <v-list-item-title>
                        {{
                          $t(
                            "user_dashboard.shops.shop_card.menu_orders.virtual",
                          )
                        }}
                      </v-list-item-title>

                      <template v-slot:append>
                        <b class="ms-3">{{
                          numeralFormat(sell_products_virtual, "0.[0]a")
                        }}</b>
                      </template>
                    </v-list-item>

                    <v-list-item
                      v-if="sell_products_file"
                      :class="[dark ? 'a-white' : '']"
                      :to="{
                        name: 'BPageShopOrdersFile',
                        params: { shop_id: shop.id },
                      }"
                    >
                      <template v-slot:prepend>
                        <img
                          :src="ProductType.FILE.image"
                          class="me-3"
                          height="16"
                          width="16"
                        />
                      </template>

                      <v-list-item-title>
                        {{
                          $t("user_dashboard.shops.shop_card.menu_orders.files")
                        }}
                      </v-list-item-title>

                      <template v-slot:append>
                        <b class="ms-3">{{
                          numeralFormat(sell_products_file, "0.[0]a")
                        }}</b>
                      </template>
                    </v-list-item>

                    <v-list-item
                      v-if="sell_products_service"
                      :class="[dark ? 'a-white' : '']"
                      :to="{
                        name: 'BPageShopOrdersService',
                        params: { shop_id: shop.id },
                      }"
                    >
                      <template v-slot:prepend>
                        <img
                          :src="ProductType.SERVICE.image"
                          class="me-3"
                          height="16"
                          width="16"
                        />
                      </template>

                      <v-list-item-title>
                        {{
                          $t(
                            "user_dashboard.shops.shop_card.menu_orders.services",
                          )
                        }}
                      </v-list-item-title>

                      <template v-slot:append>
                        <b class="ms-3">{{
                          numeralFormat(sell_products_service, "0.[0]a")
                        }}</b>
                      </template>
                    </v-list-item>

                    <v-list-item
                      v-if="sell_products_subscription"
                      :class="[dark ? 'a-white' : '']"
                      :to="{
                        name: 'BPageShopOrdersSubscription',
                        params: { shop_id: shop.id },
                      }"
                    >
                      <template v-slot:prepend>
                        <img
                          :src="ProductType.SUBSCRIPTION.image"
                          class="me-3"
                          height="16"
                          width="16"
                        />
                      </template>

                      <v-list-item-title>
                        {{
                          $t(
                            "user_dashboard.shops.shop_card.menu_orders.subscriptions",
                          )
                        }}
                      </v-list-item-title>
                      <template v-slot:append>
                        <b class="ms-3">{{
                          numeralFormat(sell_products_subscription, "0.[0]a")
                        }}</b>
                      </template>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-menu>
            <v-btn
              v-else
              :theme="dark ? 'dark' : 'light'"
              :to="{
                name: 'BPageShopSettingInfo',
                params: { shop_id: shop.id },
              }"
              icon
              size="20"
              title="Edit shop"
              variant="text"
            >
              <v-icon size="16"> fa:fas fa-edit</v-icon>
            </v-btn>
          </v-list-item-action>
        </template>
      </v-list-item>

      <v-container>
        <v-row class="text-center" dense>
          <v-col cols="4">
            <h6
              :class="{ 'text-success': shop.license !== 'FREE' }"
              :title="$t('user_dashboard.shops.shop_card.license')"
              class="m-0"
            >
              <img
                :src="getShopLicenseIcon(shop.license)"
                class="me-1"
                height="24"
                width="24"
              />
              {{ getShopLicenseName(shop.license) }}
            </h6>

            <small :title="$t('user_dashboard.shops.shop_card.expire')">
              <span v-if="shop.expire_at">{{
                getFromNowString(shop.expire_at)
              }}</span>
              <v-icon
                v-else
                :title="$t('global.commons.infinite')"
                size="20"
                >all_inclusive
              </v-icon>
            </small>
          </v-col>

          <v-col cols="4">
            <b-shop-card-products :last-data="shop_last_data">
            </b-shop-card-products>
          </v-col>
          <v-col cols="4">
            <b-shop-card-visitors
              :dark="dark"
              :last-data="shop_last_data"
            ></b-shop-card-visitors>
          </v-col>

          <v-col cols="12">
            <div class="text-start op-0-5 small m-1">
              ●
              <span v-if="shop_last_data.created_at">
                {{
                  $t("user_dashboard.shops.shop_card.time_span", {
                    time: getFromNowString(shop_last_data.created_at),
                  })
                }}
              </span>
            </div>
            <div
              :style="{
                backgroundColor: dark ? SaminColorDarkDeep : undefined,
              }"
              class="d-flex justify-content-between align-items-center px-3 mx-n2 mx-sm-n3 rounded py-2 mt-2"
            >
              <span
                :style="{ color: likes ? '#C2185B' : mute_color }"
                title="Article likes"
              >
                <i class="fas fa-heart" />
                {{ numeralFormat(likes, "0,0a") }}
              </span>
              <span
                :style="{ color: comments ? '#607D8B' : mute_color }"
                title="New comments"
              >
                <i class="fas fa-comments" />
                {{ numeralFormat(comments, "0,0a") }}
              </span>
              <span
                :style="{ color: ratings ? '#7856c7' : mute_color }"
                title="Product ratings"
              >
                <i class="fas fa-poll" />
                {{ numeralFormat(ratings, "0,0a") }}
              </span>
              <span
                :style="{ color: favorites ? '#FFA000' : mute_color }"
                title="Article favorites"
              >
                <i class="fas fa-star" />
                {{ numeralFormat(favorites, "0,0a") }}
              </span>
              <span
                :style="{ color: total_views ? '#2ea1e0' : mute_color }"
                title="Shop views"
              >
                <i class="fas fa-eye" />
                {{ numeralFormat(total_views, "0,0a") }}
              </span>

              <span
                :style="{ color: wishlist ? '#afe619' : mute_color }"
                title="Add to wishlist"
              >
                <i class="fas fa-plus-square" />
                {{ numeralFormat(wishlist, "0,0a") }}
              </span>
            </div>
          </v-col>

          <v-col cols="12">
            <v-row
              class="font-weight-bold text-center"
              style="min-height: 80px"
            >
              <v-col class="p-1" cols="6">
                <v-table
                  :theme="dark ? 'dark' : 'light'"
                  class="pen bg-transparent"
                  density="compact"
                >
                  <template v-slot:default>
                    <thead>
                      <tr>
                        <th class="text-start" colspan="2">
                          <span class="x-small">
                            <i class="fas fa-cash-register me-1" />
                            {{ $t("user_dashboard.shops.shop_card.buys") }}
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="finance in finances" :key="finance.currency">
                        <td class="text-center">
                          <u-currency-icon
                            :currency="finance.currency"
                            flag
                          ></u-currency-icon>
                        </td>

                        <td class="text-start p-0">
                          <u-price
                            :amount="finance.sell"
                            :currency="finance.currency"
                          ></u-price>
                        </td>
                      </tr>
                      <tr v-if="!finances?.length">
                        <td colspan="2" class="text-center op-0-5 font-weight-light">
                          <v-icon size="24" class="me-1">show_chart</v-icon>
                          {{ $t("user_dashboard.shops.shop_card.no_purchase") }}
                        </td>
                      </tr>
                    </tbody>
                  </template>
                </v-table>

                <small v-if="!finances" class="text-danger">{{
                  $t("global.not_exist")
                }}</small>
              </v-col>

              <v-col class="p-1" cols="6">
                <v-table
                  :theme="dark ? 'dark' : 'light'"
                  class="pen bg-transparent"
                  density="compact"
                >
                  <template v-slot:default>
                    <thead>
                      <tr>
                        <th class="text-start" colspan="2">
                          <span class="x-small">
                            <i class="fas fa-money-bill-wave-alt me-1" />
                            {{
                              $t("user_dashboard.shops.shop_card.payments")
                            }}</span
                          >
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="finance in finances" :key="finance.currency">
                        <td class="text-center">
                          <u-currency-icon
                            :currency="finance.currency"
                            flag
                          ></u-currency-icon>
                        </td>

                        <td class="text-start p-0">
                          <u-price
                            :amount="finance.pay"
                            :currency="finance.currency"
                          ></u-price>
                        </td>
                      </tr>
                      <tr v-if="!finances?.length">
                        <td colspan="2" class="text-center op-0-5 font-weight-light">
                          <v-icon size="24" class="me-1">show_chart</v-icon>
                          {{ $t("user_dashboard.shops.shop_card.no_payment") }}
                        </td>
                      </tr>
                    </tbody>
                  </template>
                </v-table>

                <small v-if="!finances" class="text-danger">{{
                  $t("global.not_exist")
                }}</small>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>

      <!-- Trend -->
      <u-ribbon v-if="isSample" green left="-4px">
        <v-icon size="small">science</v-icon>
        {{ $t("global.commons.demo") }}
      </u-ribbon>

      <!-- Penalty -->
      <u-ribbon v-if="shop.penalty" left="-4px" red>
        <v-icon class="blink-me-linear" size="small">report</v-icon>
        Penalty
      </u-ribbon>
    </v-sheet>
  </router-link>
</template>

<script>
import { ShopPermissions } from "@selldone/core-js/enums/permission/ShopPermissions";
import URibbon from "../../../ui/ribbon/URibbon.vue";
import BShopCardProducts from "../../shop/card/products/BShopCardProducts.vue";
import UFadeScroll from "../../../ui/fade-scroll/UFadeScroll.vue";
import UCurrencyIcon from "../../../ui/currency/icon/UCurrencyIcon.vue";
import BShopCardVisitors from "../../shop/card/visitors/BShopCardVisitors.vue";
import { BusinessModel } from "@selldone/core-js/enums/shop/BusinessModel";

export default {
  name: "BShopCard",
  components: {
    BShopCardVisitors,
    UCurrencyIcon,
    UFadeScroll,
    BShopCardProducts,
    URibbon,
  },
  props: {
    shop: {
      required: true,
      type: Object,
    },

    small: {
      required: false,
      default: false,
      type: Boolean,
    },
    extended: {
      required: false,
      default: true,
      type: Boolean,
    },
    to: {
      required: false,
      type: Object,
    },
    dark: {
      default: false,
      type: Boolean,
    },
    isSample: {
      default: false,
      type: Boolean,
    },
  },

  data() {
    return {
      options_visitors: {
        chart: {
          fontFamily: "var(--font)",
        },
        colors: ["#FFA000", "#C2185B"],
        labels: [
          this.$t("shop_visitors_widget.returning_visitors"),
          this.$t("shop_visitors_widget.new_visitors"),
        ],
        legend: {
          position: "bottom",
        },

        dataLabels: {
          enabled: true,
          formatter: function (value, timestamp, index) {
            return Math.round(value) + "%";
          },
        },

        plotOptions: {
          pie: {
            donut: {
              size: "30%",
            },
          },
        },
      },
    };
  },

  computed: {
    business_model() {
      if (!this.shop.model) return null;
      return Object.values(BusinessModel).find(
        (i) => i.code === this.shop.model,
      );
    },

    mute_color() {
      return this.dark ? "rgba(238,255,255,0.91)" : "gray";
    },

    shop_last_data() {
      if (!this.shop.lastdata || !this.shop.lastdata) return {};
      return this.shop.lastdata;
    },

    total_views() {
      return (
        this.views +
        this.view_products_virtual +
        this.view_products_physical +
        this.view_products_file +
        this.view_products_service +
        this.view_products_subscription
      );
    },

    total_sell() {
      return (
        this.sell_products_virtual +
        this.sell_products_physical +
        this.sell_products_file +
        this.sell_products_service +
        this.sell_products_subscription
      );
    },

    finances() {
      return this.shop_last_data.finances;
    },

    sell_products_virtual() {
      return this.shop_last_data.sell_products_virtual
        ? this.shop_last_data.sell_products_virtual
        : 0;
    },

    view_products_virtual() {
      return this.shop_last_data.view_products_virtual
        ? this.shop_last_data.view_products_virtual
        : 0;
    },

    sell_products_physical() {
      return this.shop_last_data.sell_products_physical
        ? this.shop_last_data.sell_products_physical
        : 0;
    },

    view_products_physical() {
      return this.shop_last_data.view_products_physical
        ? this.shop_last_data.view_products_physical
        : 0;
    },

    sell_products_file() {
      return this.shop_last_data.sell_products_file
        ? this.shop_last_data.sell_products_file
        : 0;
    },

    view_products_file() {
      return this.shop_last_data.view_products_file
        ? this.shop_last_data.view_products_file
        : 0;
    },

    sell_products_service() {
      return this.shop_last_data.sell_products_service
        ? this.shop_last_data.sell_products_service
        : 0;
    },

    view_products_service() {
      return this.shop_last_data.view_products_service
        ? this.shop_last_data.view_products_service
        : 0;
    },

    sell_products_subscription() {
      return this.shop_last_data.sell_products_subscription
        ? this.shop_last_data.sell_products_subscription
        : 0;
    },

    view_products_subscription() {
      return this.shop_last_data.view_products_subscription
        ? this.shop_last_data.view_products_subscription
        : 0;
    },

    views() {
      return this.shop_last_data.views ? this.shop_last_data.views : 0;
    },

    likes() {
      return this.shop_last_data.likes ? this.shop_last_data.likes : 0;
    },
    wishlist() {
      return this.shop_last_data.wishlist ? this.shop_last_data.wishlist : 0;
    },
    powers() {
      return this.shop_last_data.powers ? this.shop_last_data.powers : 0;
    },

    favorites() {
      return this.shop_last_data.favorites ? this.shop_last_data.favorites : 0;
    },

    comments() {
      return this.shop_last_data.comments ? this.shop_last_data.comments : 0;
    },

    ratings() {
      return this.shop_last_data.ratings ? this.shop_last_data.ratings : 0;
    },

    new_visitors() {
      return this.shop_last_data.new_visitors
        ? this.shop_last_data.new_visitors
        : 0;
    },

    returning_visitors() {
      return this.shop_last_data.returning_visitors
        ? this.shop_last_data.returning_visitors
        : 0;
    },
    total_visitors() {
      return this.new_visitors + this.returning_visitors;
    },

    page_views() {
      return this.shop_last_data.page_views
        ? this.shop_last_data.page_views
        : 0;
    },
  },
  mounted() {},

  methods: {
    getShopPermissionObject(level) {
      return ShopPermissions[level];
    },
  },
};
</script>

<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--shop-card {
  &.-rtl {
    .badge-sell-products {
      background: linear-gradient(
        to right,
        var(--background),
        var(--background),
        transparent
      );
      right: unset;
      left: 12px;
    }
  }

  ::v-deep(a) {
    color: #444;

    :hover {
      color: #444;
    }
  }

  ::v-deep(h6) {
    font-weight: 500;
    line-height: 1.2;
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }

  .badge-sell-products {
    background: linear-gradient(
      to left,
      var(--background),
      var(--background),
      transparent
    );
    position: absolute;
    top: 8px;
    right: 12px;

    min-width: 36px;
    border-radius: 4px;
    padding: 4px;
    color: #e64a19;
    font-weight: 500;
    font-size: 1.4rem;

    transition: all 0.65s;

    &:hover {
      color: #ad3715;
    }

    small {
      font-size: 0.8rem !important;
    }

    i {
      color: #e64a19;
    }
  }

  .x--shop-card {
    position: relative;
    border-radius: 12px;
    min-height: 100%;
  }
}
</style>
