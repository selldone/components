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
  <div>
    <v-toolbar
      v-if="!$store.getters.getIsNative"
      :color="
        color
          ? color
          : transparent_header || overlay
            ? 'transparent'
            : is_light_header
              ? 'var(--background)'
              : SaminColorDark
      "
      :theme="
        (overlay ? overlayDark : !transparent_header && !is_light_header)
          ? 'dark'
          : 'light'
      "
      :extended="!overlay"
      :style="{
        marginTop: overlay ? '64px' : 0 /*Cover -64px of main view of shop*/,
      }"
      class="s--storefront-primary-header border-bottom"
      extension-height="64px"
      flat
    >
      <template v-slot:extension>
        <div style="height: 64px"></div>
      </template>

      <template v-if="!isMobile || !searchMode">
        <!-- ―――――――――― Navigation drawer (Mobile & Instance app) : Action ―――――――――― -->
        <v-btn
          v-if="isMobile || is_standalone"
          :disabled="!shop"
          class="m-1"
          icon
          size="large"
          @click.stop="drawer = !drawer"
        >
          <v-icon> menu</v-icon>
        </v-btn>

        <s-header-section-logo
          v-if="shop"
          :shop="shop"
        ></s-header-section-logo>

        <s-loading v-else-if="!shop" css-mode></s-loading>

        <v-spacer />

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Lottery ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <s-storefront-lottery-wheel-of-fortune
          v-if="USER() && shop && shop.lottery && shop.lottery.enable"
          class="fadeIn delay_200"
        ></s-storefront-lottery-wheel-of-fortune>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Orders history ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <s-circle-button
          v-if="show_top_cart && !isMobile"
          :color="is_light_header ? '#333' : '#fff'"
          :to="{ name: window.$storefront.routes.HISTORY_ORDERS_PHYSICAL }"
          :tooltip="$t('global.commons.orders')"
          class="mx-3 fadeIn delay_300"
          dense
          exact
          icon="local_mall"
        >
        </s-circle-button>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Basket Top Menu ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <s-circle-button
          v-if="show_top_cart && !isMobile"
          :badge-number="itemsCount"
          :color="is_light_header ? '#333' : '#fff'"
          :has-badge="itemsCount > 0"
          :tooltip="$t('basket_top_menu.basket')"
          badge-color="teal"
          class="mx-3 fadeIn delay_300"
          dense
          icon="shopping_cart"
          persist-badge
          @click="show_basket = true"
        >
        </s-circle-button>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ User Badges ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <img
          v-if="getClub() && !isMobile"
          :src="getCustomerClubLevel(getClub().level).icon"
          class="absolute-top-end fadeIn"
          height="20px"
          width="20px"
        />

        <!--- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Select  Language (in mobile mode) ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ --->
        <s-language-selector
          v-if="shop"
          :iconColor="is_light_header ? '#333' : '#fff'"
          :shop="shop"
          class="mx-3"
          icon-only
        ></s-language-selector>

        <!--- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Select  Currency (in mobile mode) ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ --->
        <s-currency-selector
          v-if="
            /* isMobile &&*/ shop &&
            shop.currencies &&
            shop.currencies.length > 1
          "
          :iconColor="is_light_header ? '#333' : '#fff'"
          :shop="shop"
          class="rounded-18px"
          dense
          hideDetails
          icon
          icon-only
          max-width="80px"
          outlined
          singleLine
          small
          @change="
            () => {
              onChangeUserSelectedCurrency();
            }
          "
        />

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ User ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <template v-if="!isMobile">
          <v-slide-y-reverse-transition group leave-absolute>
            <v-btn
              v-if="!busy_user && USER()"
              :color="is_light_header ? '#ddd' : SaminColorDarkDeep"
              :loading="busy_logout"
              class="me-1 mt-1 hover-shadow"
              height="42"
              rounded
              variant="outlined"
              key="kav1"
            >
              <v-icon :color="is_light_header ? '#222' : '#fff'" start
                >menu
              </v-icon>
              <v-avatar
                :color="is_light_header ? '#fff' : SaminColorDarkDeep"
                class="me-n3"
                size="32"
              >
                <img :src="getUserAvatar(USER_ID())" />
              </v-avatar>
              <v-menu

                v-model="menu"
                :close-on-content-click="true"
                :min-width="280"
                width="80vw"
                :max-width="460"
                open-on-click
                z-index="99999999"
                activator="parent"
              >
                <v-card flat rounded="xl" color="#f8f8f8">
                  <v-card-text>
                    <div class="d-flex text-start align-center">
                      <v-avatar
                        :size="64"
                        class="avatar-gradient -thin me-2 flex-grow-0"
                        color="#946f90"
                      >
                        <v-img :src="getUserAvatar(USER_ID())" />
                      </v-avatar>

                      <div class="flex-grow-1">
                        <div class="my-1 text-subtitle-2 font-weight-black">
                          {{ USER().name }}

                          <v-icon
                            v-if="USER().personal_information_verified"
                            color="green"
                            size="small"
                          >
                            check_circle
                          </v-icon>

                          <v-icon
                            v-if="profile && profile.verified"
                            class="ms-1"
                            color="blue"
                            size="small"
                            >verified
                          </v-icon>
                        </div>

                        <p class="text-muted m-0">
                          {{ USER().email }}
                        </p>

                        <div
                          v-if="shop && shop.lottery && shop.lottery.enable"
                          class="d-flex align-center pt-2"
                        >
                          <img
                            class="m-1"
                            height="24"
                            src="../../../assets/icons/chips.svg"
                            width="24"
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


                  <!-- ―――――――――― Shop User Menu List ―――――――――― -->

                  <s-shop-user-menu-list
                    v-if="shop"
                    :shop="shop"
                    @click:logout="logout()"
                  ></s-shop-user-menu-list>

                  <!-- ―――――――――― Extra links ―――――――――― -->

                  <template v-if="has_avocado || has_hyper || has_insta">
                    <v-row
                      v-if="shop"
                      class="m-0 pb-4"
                      dense
                      justify="space-around"
                    >
                      <v-col v-if="has_avocado" cols="4" class="d-flex flex-column align-center">
                        <v-btn
                          :to="{ name: 'AvocadoPage' }"
                          icon variant="text"
                          size="large"
                        >
                          <img
                            height="24"
                            src="../../../assets/icons/avocado.svg"
                            width="24"
                          />
                        </v-btn>
                        <small>{{$t('global.commons.avocado')}}</small>
                      </v-col>
                      <v-col v-if="has_hyper" cols="4" class="d-flex flex-column align-center">
                        <v-btn
                          :to="{ name: window.$storefront.routes.HYPER_PAGE }"
                          icon variant="text"
                          size="large"
                        >
                          <img
                            height="24"
                            src="../../../assets/icons/hyper.svg"
                            width="24"
                          />
                        </v-btn>
                        <small>
                          {{$t('global.commons.hyper')}}
                        </small>
                      </v-col>
                      <v-col v-if="has_insta" cols="4" class="d-flex flex-column align-center">
                        <v-btn
                          :to="{ name: 'InstagramPage' }"
                          icon variant="text"
                          size="large"
                        >
                          <img
                            height="24"
                            src="../../../assets/trademark/instagram.svg"
                            width="24"
                          />
                        </v-btn>
                        <small >{{$t('global.commons.instashop')}}</small>
                      </v-col>
                    </v-row>
                  </template>

                  <!-- ―――――――――― Terms / Privacy ―――――――――― -->

                  <div
                    class="d-flex align-center small text-center justify-content-around text-muted px-1 py-3"
                  >
                    <div class="p-1">
                      <a class="text-muted" href="/privacy" target="_blank"
                        >Privacy Policy</a
                      >
                    </div>
                    •
                    <div class="p-1">
                      <a class="text-muted" href="/terms" target="_blank"
                        >Terms of Service</a
                      >
                    </div>
                  </div>
                </v-card>
              </v-menu>
            </v-btn>

            <v-btn
              v-else-if="!busy_user"
              key="kav2"
              :color="SaminInfoColor"
              :icon="!shop"
              :loading="!shop"
              class="s--storefront-primary-header-login-button"
              roundedripple
              @click.stop="NeedLogin()" variant="elevated"
            >
              <v-icon class="me-2" size="small"> login</v-icon>
              <div v-if="!!shop">
                <span class="hide-on-small-600"
                  >{{ $t("layout_shop.login_to_shop") }}
                </span>
                <span class="show-on-small-600">{{
                  $t("layout_shop.login_to_shop_short")
                }}</span>
              </div>
            </v-btn>
            <div key="pls" style="min-width: 52px">
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
      :location="!$vuetify.rtl ? 'right' : undefined"
      :width="$vuetify.display.mdAndUp ? 640 : 360"
      class="s--storefront-primary-header-basket-navigation"
      color="#fff"
      temporary
    >
      <div class="d-flex flex-column" style="min-height: 100%">
        <v-btn
          block
          class="tnt flex-grow-0 mb-2"
          size="x-large"
          variant="text"
          @click="show_basket = false"
          >{{ $t("global.actions.close") }}
          <v-icon class="ms-2">{{ $t("icons.long_end") }}</v-icon>
        </v-btn>

        <basket-top-menu
          ref="basket_menu"
          class="flex-grow-1"
          @close="show_basket = false"
        />
      </div>
    </v-navigation-drawer>
  </div>
</template>

<script>
import BasketTopMenu from "../../order/basket/BasketTopMenu.vue";
import SLoading from "@components/ui/loading/SLoading.vue";

import SStorefrontLotteryWheelOfFortune from "@components/storefront/lottery/wheel-of-fortune/SStorefrontLotteryWheelOfFortune.vue";
import SCurrencySelector from "@components/ui/currency/selector/SCurrencySelector.vue";
import SShopNavigationDrawer from "@components/storefront/menu/side/SShopNavigationDrawer.vue";
import SShopUserMenuList from "@components/storefront/menu/user/SShopUserMenuList.vue";
import { ShopOptionsHelper } from "@core/helper/shop/ShopOptionsHelper";
import SLanguageSelector from "@components/storefront/language/selector/SLanguageSelector.vue";
import { ProductType } from "@core/enums/product/ProductType";
import SHeaderSectionLogo from "@components/storefront/header/section/logo/SHeaderSectionLogo.vue";

const BOTTOM_PADDING_CONTAINER = "82px";
export default {
  name: "SHeaderSection",
  components: {
    SHeaderSectionLogo,
    SLanguageSelector,
    SShopUserMenuList,
    SShopNavigationDrawer,
    SCurrencySelector,

    SStorefrontLotteryWheelOfFortune,
    SLoading,

    BasketTopMenu,
  },
  props: {
    shop: {},
    searchMode: {},
    overlay: { type: Boolean, default: false },
    overlayDark: {
      default: false,
      type: Boolean,
    },
    color: {},
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
        (record) => record.meta.transparent_header,
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
        this.$route.name !== window.$storefront.routes.PRODUCT_PAGE ||
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
          this.$route.name === window.$storefront.routes.PAGE_RENDER ||
          this.$route.name === "CustomHomePage" ||
          this.$route.name === window.$storefront?.routes.INCLUDE_PAGE_RENDER
        ) {
          return 0;
        } else {
          return BOTTOM_PADDING_CONTAINER;
        }
      }
    },

    top_menu() {
      return (
        this.$vuetify.display.mdAndUp &&
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
        this.$route.name !== window.$storefront.routes.PAGE_RENDER &&
        this.$route.name !== "CustomHomePage" &&
        this.$route.name !== window.$storefront?.routes.INCLUDE_PAGE_RENDER
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
  beforeUnmount() {
    this.EventBus.$off("side-cart-menu-open");
  },

  methods: {
    logout() {
      this.busy_logout = true;
      this.Logout(() => {
        this.busy_logout = false;
      });
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

.s--storefront-primary-header {
  overflow-x: auto;
  overflow-y: hidden;
}

.s--storefront-primary-header-basket-navigation {
  padding: 8px;
  margin: 8px;
  height: calc(100vh - 16px) !important;
  border-radius: 16px;
  border: solid thin #ddd !important;

  .v-navigation-drawer__border {
    display: none;
  }
}

.s--storefront-primary-header-login-button {
  //  background-color: var(--theme-dark);
  //  color: #fff;

  top: -14px !important;
  padding-top: 42px !important;
  max-height: 84px !important;
  height: auto !important;
  padding-bottom: 22px !important;
}
</style>
