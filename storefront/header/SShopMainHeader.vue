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
  <div>
    <v-toolbar
      v-if="!$store.getters.getIsNative"
      class="s--shop-main-header border-bottom"
      :extended="!overlay"
      :dark="overlay ? overlayDark : !transparent_header && !is_light_header"
      flat
      :color="
        transparent_header || overlay
          ? 'transparent'
          : is_light_header
          ? 'var(--background)'
          : SaminColorDark
      "
      extension-height="64px"
      :style="{
        marginTop: overlay ? '64px' : 0 /*Cover -64px of main view of shop*/,
      }"
    >
      <template v-if="!isMobile || !searchmode">
        <!-- ―――――――――― Navigation drawer (Mobile & Instance app) : Action ―――――――――― -->
        <v-btn
          v-if="isMobile || is_standalone"
          :disabled="!shop"
          icon
          large
          tile
          @click.stop="drawer = !drawer"
          class="m-1"
        >
          <v-icon> menu </v-icon>
        </v-btn>

        <s-shop-main-header-logo v-if="shop" :shop="shop"></s-shop-main-header-logo>

        <loading css-mode v-else-if="!shop"></loading>

        <v-spacer />

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Lottery ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <wheel-of-fortune
          v-if="USER() && shop && shop.lottery && shop.lottery.enable"
          class="fadeIn delay_200"
        ></wheel-of-fortune>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Orders history ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <circle-button
          v-if="show_top_cart && !isMobile"
          class="mx-3 fadeIn delay_300"
          :to="{ name: 'HistoryOrdersPhysical' }"
          icon="local_mall"
          :tooltip="$t('global.commons.orders')"
          exact
          dense
          :color="is_light_header ? '#333' : '#fff'"
        >
        </circle-button>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Basket Top Menu ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <circle-button
          v-if="show_top_cart && !isMobile"
          class="mx-3 fadeIn delay_300"
          @click="show_basket = true"
          icon="shopping_cart"
          :tooltip="$t('basket_top_menu.basket')"
          :has-badge="itemsCount > 0"
          :badge-number="itemsCount"
          persist-badge
          dense
          badge-color="teal"
          :color="is_light_header ? '#333' : '#fff'"
        >
        </circle-button>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ User Badges ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <img
          v-if="getClub() && !isMobile"
          class="absolute-top-end fadeIn"
          :src="getCustomerClubLevel(getClub().level).icon"
          width="20px"
          height="20px"
        />

        <!--- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Select  Language (in mobile mode) ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ --->
        <s-shop-language-selector
          v-if="shop"
          :shop="shop"
          icon-only
          class="mx-3"
          :iconColor="is_light_header ? '#333' : '#fff'"
        ></s-shop-language-selector>

        <!--- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Select  Currency (in mobile mode) ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ --->
        <s-currency-selector
          v-if="
            /* isMobile &&*/ shop &&
            shop.currencies &&
            shop.currencies.length > 1
          "
          class="rounded-18px"
          outlined
          hideDetails
          :shop="shop"
          dense
          icon
          singleLine
          max-width="80px"
          small
          @change="
            () => {
              onChangeUserSelectedCurrency();
            }
          "
          icon-only
          :iconColor="is_light_header ? '#333' : '#fff'"
        />

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ User ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <template v-if="!isMobile">
          <v-slide-y-reverse-transition group leave-absolute>
            <v-menu
              v-if="!busy_user && USER()"
              v-model="menu"
              :close-on-content-click="true"
              :nudge-width="240"
              rounded="xl"
              offset-y
              open-on-click
              z-index="99999999"
              key="kav1"
            >
              <template v-slot:activator="{ on }">
                <v-btn
                  rounded
                  outlined
                  v-on="on"
                  class="me-1 mt-1 hover-shadow"
                  :loading="busy_logout"
                  @click="menu = true"
                  :color="is_light_header ? '#ddd' : SaminColorDarkDeep"
                  height="42"
                >
                  <v-icon left :color="is_light_header ? '#222' : '#fff'"
                    >menu</v-icon
                  >
                  <v-avatar
                    :color="is_light_header ? '#fff' : SaminColorDarkDeep"
                    size="32"
                    class="me-n3"
                  >
                    <img :src="getUserAvatar(USER_ID())" />
                  </v-avatar>
                </v-btn>
              </template>

              <v-card flat>
                <v-card-text>
                  <div class="d-flex text-start align-center">
                    <v-avatar
                      :size="64"
                      color="#946f90"
                      class="avatar-gradient -thin me-2 flex-grow-0"
                    >
                      <v-img :src="getUserAvatar(USER_ID())" />
                    </v-avatar>

                    <div class="flex-grow-1">
                      <div class="my-1 subtitle-2 font-weight-black">
                        {{ USER().name }}

                        <v-icon
                          v-if="USER().personal_information_verified"
                          color="green"
                          small
                        >
                          check_circle
                        </v-icon>

                        <v-icon
                          v-if="profile && profile.verified"
                          small
                          color="blue"
                          class="ms-1"
                          >verified</v-icon
                        >
                      </div>

                      <p class="text-muted m-0">
                        {{ USER().email }}
                      </p>

                      <div
                        v-if="shop && shop.lottery && shop.lottery.enable"
                        class="d-flex align-center pt-2"
                      >
                        <img
                          src="../../assets/icons/chips.svg"
                          width="24"
                          height="24"
                          class="m-1"
                        />
                        <b>
                          {{
                            $t("layout_shop.user_menu.chips", {
                              chips: USER().chips,
                            })
                          }}
                        </b>
                      </div>
                    </div>
                  </div>
                </v-card-text>

                <v-divider />

                <!-- ―――――――――― Shop User Menu List ―――――――――― -->

                <s-shop-user-menu-list
                  v-if="shop"
                  :shop="shop"
                  @click:logout="logout()"
                ></s-shop-user-menu-list>

                <!-- ―――――――――― Extra links ―――――――――― -->

                <template v-if="has_avocado || has_hyper || has_insta">
                  <v-divider class="mt-0" />
                  <v-row
                    v-if="shop"
                    dense
                    justify="space-around"
                    class="m-0 pb-4"
                  >
                    <v-col cols="4" v-if="has_avocado">
                      <v-btn
                        icon
                        large
                        :to="{ name: 'AvocadoPage' }"
                        class="sub-caption"
                        :caption="$t('global.commons.avocado')"
                      >
                        <img
                          src="../../assets/icons/avocado.svg"
                          width="24"
                          height="24"
                        />
                      </v-btn>
                    </v-col>
                    <v-col cols="4" v-if="has_hyper">
                      <v-btn
                        icon
                        large
                        :to="{ name: 'HyperPage' }"
                        class="sub-caption"
                        :caption="$t('global.commons.hyper')"
                      >
                        <img
                          src="../../assets/icons/hyper.svg"
                          width="24"
                          height="24"
                        />
                      </v-btn>
                    </v-col>
                    <v-col cols="4" v-if="has_insta">
                      <v-btn
                        icon
                        large
                        :to="{ name: 'InstagramPage' }"
                        class="sub-caption"
                        :caption="$t('global.commons.instashop')"
                      >
                        <img
                          src="../../assets/tradmark/instagram.svg"
                          width="24"
                          height="24"
                        />
                      </v-btn>
                    </v-col>
                  </v-row>
                </template>

                <!-- ―――――――――― Terms / Privacy ―――――――――― -->

                <div
                  class="d-flex align-center small text-center justify-content-around text-muted px-1 py-3"
                >
                  <div class="p-1">
                    <a href="/privacy" target="_blank" class="text-muted"
                      >Privacy Policy</a
                    >
                  </div>
                  •
                  <div class="p-1">
                    <a href="/terms" target="_blank" class="text-muted"
                      >Terms of Service</a
                    >
                  </div>
                </div>
              </v-card>
            </v-menu>

            <v-btn
              v-else-if="!busy_user"
              :loading="!shop"
              :icon="!shop"
              roundedripple
              :color="SaminInfoColor"
              dark
              @click.stop="NeedLogin()"
              key="kav1"
              class="s--shop-main-header-login-button"
            >
              <v-icon small class="me-2"> fas fa-sign-in-alt </v-icon>
              <div v-if="!!shop">
                <span class="hide-on-small-600"
                  >{{ $t("layout_shop.login_to_shop") }}
                </span>
                <span class="show-on-small-600">{{
                  $t("layout_shop.login_to_shop_short")
                }}</span>
              </div>
            </v-btn>
            <div style="min-width: 52px" key="pls">
              <!-- place holder -->
            </div>
          </v-slide-y-reverse-transition>
        </template>
      </template>
    </v-toolbar>
    <!-- ―――――――――― Navigation drawer (Mobile & Instance app) : Menu ―――――――――― -->
    <s-shop-navigation-drawer
      v-if="(isMobile || is_standalone) && shop"
      v-model="drawer"
      :shop="shop"
    ></s-shop-navigation-drawer>

    <!-- ―――――――――― Shop Drawer ―――――――――― -->

    <v-navigation-drawer
      v-model="show_basket"
      fixed
      :right="!$vuetify.rtl"
      color="#fff"
      class="s--shop-main-header-basket-navigation"
      :width="$vuetify.breakpoint.mdAndUp ? 640 : 360"
      temporary

    >
      <div class="d-flex flex-column" style="min-height: 100%">
        <v-btn
          text
          @click="show_basket = false"
          block
          class="tnt flex-grow-0 mb-2"
          x-large
          >{{ $t("global.actions.close") }}
          <v-icon class="ms-2">{{ $t("icons.long_end") }}</v-icon></v-btn
        >

        <basket-top-menu
          class="flex-grow-1"
          ref="basket_menu"
          @close="show_basket = false"
        />
      </div>
    </v-navigation-drawer>
  </div>
</template>

<script>
import BasketTopMenu from "../order/basket/BasketTopMenu.vue";
import Loading from "@components/ui/loading/loading.vue";

import WheelOfFortune from "@components/storefront/incentives/lottery/WheelOfFortune.vue";
import SCurrencySelector from "@components/ui/currency/SCurrencySelector.vue";
import SShopNavigationDrawer from "@components/storefront/menu/SShopNavigationDrawer.vue";
import SShopUserMenuList from "@components/storefront/menu/SShopUserMenuList.vue";
import { ShopOptionsHelper } from "../../../../core/helper/shop/ShopOptionsHelper";
import SShopLanguageSelector from "@components/storefront/language/SShopLanguageSelector.vue";
import { ProductType } from "../../../../core/enums/product/ProductType";
import SShopMainHeaderLogo from "@components/storefront/header/SShopMainHeaderLogo.vue";

const BOTTOM_PADDING_CONTAINER = "82px";
export default {
  name: "ShopMainHeader",
  components: {
    SShopMainHeaderLogo,
    SShopLanguageSelector,
    SShopUserMenuList,
    SShopNavigationDrawer,
    SCurrencySelector,

    WheelOfFortune,
    Loading,

    BasketTopMenu,
  },
  props: {
    shop: {},
    searchmode: {},
    overlay: { type: Boolean, default: false },
    overlayDark: {
      default: false,
      type: Boolean,
    },
  },
  data: () => ({
    menu: false,

    busy_logout: false,

    show_basket: false,

    //----------------------
    drawer: false,

    // Dynamic header style:
    transparentHeader: null,
    darkHeader: null,
  }),

  computed: {
    user() {
      return this.$store.getters.getUser;
    },
    profile() {
      return this.user && this.user.profile;
    },

    transparent_header() {
      return this.$route.matched.some(
        (record) => record.meta.transparent_header
      );
    },
    card() {
      // show card shadow on main route view
      return this.$route.matched.some((record) => record.meta.card);
    },

    itemsCount() {
      return this.getTotalItemInBaskets();
      /*  return this.current_basket && this.current_basket.items
            ? this.current_basket.items.length
            : 0;*/
    },

    in_custom_home_page() {
      return this.$route.name === this.getCustomHomePage();
    },

    campaign() {
      return this.shop ? this.shop.campaign : null;
    },

    banner() {
      return this.campaign ? this.campaign.banner : null;
    },

    availableInBasketCount() {
      if (
        this.$route.name !== "ProductPage" ||
        !this.getId(this.$route.params.product_id)
      )
        return null;

      let count = 0;
      let baskets = this.getBaskets();
      baskets.forEach((basket) => {
        if (
          basket &&
          // 🎗️ Subscription
          (basket.type !==
            ProductType.SUBSCRIPTION
              .code /*Basket for subscription doe not supported!*/ ||
            this.shop.ribbon?.cart) /*Or support cart mode for subscription*/
        )
          basket.items.forEach((item) => {
            if (
              item.product_id ===
              Number(this.getId(this.$route.params.product_id))
            )
              count += item.count;
          });
      });

      return count;
    },

    /* badges() {
      if (!this.shop) return [];
      return this.shop.badges;
    },*/

    top_margin_content() {
      if (this.$store.getters.getIsNative) {
        return "0";
      } else {
        return "-64px";
      }
    },
    bottom_padding_container() {
      let is_native_mode = this.$store.getters.getIsNative;

      if (is_native_mode) {
        return "0";
      } else {
        if (
          this.$route.name === "PageRender" ||
          this.$route.name === "CustomHomePage" ||
          this.$route.name === "IncludePageRender"
        ) {
          return 0;
        } else {
          return BOTTOM_PADDING_CONTAINER;
        }
      }
    },

    top_menu() {
      return (
        this.$vuetify.breakpoint.mdAndUp &&
        this.shop &&
        this.shop.menus &&
        this.shop.menus.find((it) => it.type === "HEADER")
      );
    },
    header_disabled() {
      return this.top_menu && this.top_menu.enable === false;
    },

    theme() {
      if (!this.shop) return null;
      return this.shop.theme;
    },

    // --------------------------------------------------------------------------------

    is_light_header() {
      if (this.overlay) return !this.overlayDark;

      return (
        this.$route.matched.some((record) => record.meta.light_header) ||
        (this.theme && this.theme.light_header)
      );
    },

    // --------------------------------------------------------------------------------

    busy_user() {
      return this.$store.getters.getBusyUser;
    },

    /*go_up(){
      return this.offsetTop > 300
    }*/

    has_avocado() {
      return this.shop.avocado && this.shop.avocado.enable;
    },
    has_hyper() {
      return this.shop.hyper && this.shop.hyper.enable;
    },
    has_insta() {
      return this.shop.instagram;
    },

    show_top_cart() {
      return this.USER() || ShopOptionsHelper.HasGuestCheckout(this.getShop());
    },

    // --------------------------------------------------------------------------------

    logo() {
      if (this.theme && this.theme.logo)
        return this.getShopImagePath(this.theme.logo);

      return this.getShopImagePath(this.shop.icon, 128);
    },
    logo_custom_size() {
      return (
        this.theme &&
        this.logo &&
        ((this.theme.logo_w && this.theme.logo_w !== "unset") ||
          (this.theme.logo_h && this.theme.logo_h !== "unset"))
      );
    },

    title() {
      return this.theme &&
        this.theme.title !== null &&
        this.theme.title !== undefined
        ? this.theme.title
        : this.shop.title;
    },
  },

  watch: {
    $route(to, from) {
      if (
        this.$route.name !== "PageRender" &&
        this.$route.name !== "CustomHomePage" &&
        this.$route.name !== "IncludePageRender"
      ) {
        this.transparentHeader = null;
        this.darkHeader = null; // Default value is null!
      }
    },
  },

  created() {},

  mounted() {
    //▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Event Bus ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆

    this.EventBus.$on("side-cart-menu-open", ({ open, type }) => {
      this.show_basket = open;
      if (type)
        // Select corresponding type:
        this.$refs.basket_menu.setType(type);
    });
  },
  beforeDestroy() {
    this.EventBus.$off("side-cart-menu-open");
  },

  methods: {
    logout() {
      this.busy_logout = true;
      this.Logout(() => {
        this.busy_logout = false;
      });
    },

    goToShopInfoPage() {
      if (this.$route.name === "ShopInfoPageMobile")
        this.$router.push({ name: "ShopPage" });
      else this.$router.push({ name: "ShopInfoPageMobile" });
    },
  },
};
</script>

<style lang="scss">

/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */


/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */

.s--shop-main-header{
  overflow-x: auto;
  overflow-y: hidden;

}

.s--shop-main-header-basket-navigation {
  padding: 8px;
  margin: 8px;
  height: calc(100vh - 16px) !important;
  border-radius: 16px;
  border: solid thin #ddd !important;

  .v-navigation-drawer__border {
    display: none;
  }
}


.s--shop-main-header-login-button {
  //  background-color: var(--theme-dark);
  //  color: #fff;

  top: -14px !important;
  padding-top: 42px !important;
  max-height: 84px !important;
  height: auto !important;
  padding-bottom: 22px !important;
}
</style>
