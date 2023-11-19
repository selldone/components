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
  <v-navigation-drawer
    :value="value"
    @input="(val) => $emit('input', val)"
    app
    temporary
    :right="$vuetify.rtl"
    class="text-start pt-5"
    style="border-radius: 24px; margin: 8px; height: calc(100vh - 100px)"
    width="90vw"
  >
    <div class="s--shop-navigation-drawer">
      <div class="d-flex align-center pa-2">
        <div v-if="!USER()">
          <v-btn
            large
            color="#111"
            dark
            class="tnt"
            @click="NeedLogin()"
            min-width="200"
            max-width="80vw"
          >
            <v-icon class="me-1" small>login</v-icon>
            {{ $t("global.actions.login") }}
          </v-btn>
        </div>
        <template v-else>
          <!--- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Select  Language (in mobile mode) ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ --->
          <s-shop-language-selector
            v-if="shop"
            :shop="shop"
            class="mx-3"
            hide-details
            icon-only
            icon-color="#111"
          ></s-shop-language-selector>

          <!--- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Select  Currency (in mobile mode) ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ --->
          <s-currency-selector
            v-if="
              /* isMobile &&*/ shop &&
              shop.currencies &&
              shop.currencies.length > 1
            "
            icon-only
            icon-color="#111"
            hide-details
            :shop="shop"
            @change="
              () => {
                onChangeUserSelectedCurrency();
              }
            "
          />
        </template>

        <v-spacer> </v-spacer>

        <v-btn @click="$emit('input', false)" icon color="#000"
          ><v-icon>close</v-icon></v-btn
        >
      </div>
      <v-expansion-panels flat class="border-between-vertical">
        <!-- ――――――――――――――――――――― Shop User Menu List ――――――――――――――――――――― -->

        <v-expansion-panel v-if="USER()">
          <v-expansion-panel-header class="p-0 pe-3">
            <v-list-item>
              <v-list-item-avatar class="avatar-gradient -thin -user">
                <v-img :src="getUserAvatar(USER_ID())"></v-img>
              </v-list-item-avatar>

              <v-list-item-content>
                <v-list-item-title class="font-weight-bold">{{
                  USER().name
                }}</v-list-item-title>
                <v-list-item-subtitle class="mt-1">{{
                  USER().email
                }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <s-shop-user-menu-list :shop="shop" navigation></s-shop-user-menu-list>

            <!-- ――――――――――――――――――――― Logout Button ――――――――――――――――――――― -->

            <v-list-item>
              <v-list-item-content>
                <v-btn
                  outlined
                  large
                  color="#333"
                  class="tnt"
                  @click="
                    busy_logout = true;
                    Logout(() => (busy_logout = false));
                  "
                  :loading="busy_logout"
                >
                  <v-icon class="me-1" small>logout</v-icon>
                  {{ $t("global.actions.logout") }}
                </v-btn>
              </v-list-item-content>
            </v-list-item>
          </v-expansion-panel-content>
        </v-expansion-panel>

        <!-- ――――――――――――――――――――― Header Menu ――――――――――――――――――――― -->

        <template
          v-for="(tab, index) in tabs.filter((t) =>
            ['link', 'default', 'category'].includes(t.type)
          )"
        >
          <v-list-item
            v-if="tab.type === 'link'"
            :key="'l-' + index"
            :href="tab.link"
            :target="tab.link?.startsWith('http') ? '_blank' : undefined"
          >
            <v-list-item-title>
              {{ tab.title }}
            </v-list-item-title>
            <v-list-item-icon>
              <v-icon
                v-if="tab.icon"
                :small="tab.icon_size === 'small'"
                :large="tab.icon_size === 'large'"
                >{{ tab.icon }}</v-icon
              >
              <v-icon v-else-if="tab.link?.startsWith('http')" small
                >open_in_new</v-icon
              >
            </v-list-item-icon>
          </v-list-item>

          <v-expansion-panel v-else :key="'m-' + index">
            <v-expansion-panel-header class="p-0 pe-3">
              <v-list-item :href="tab.link" text>
                <v-list-item-title>
                  {{ tab.title }}
                </v-list-item-title>
                <v-list-item-icon v-if="tab.icon">
                  <v-icon
                    :small="tab.icon_size === 'small'"
                    :large="tab.icon_size === 'large'"
                    >{{ tab.icon }}</v-icon
                  >
                </v-list-item-icon>
              </v-list-item>
            </v-expansion-panel-header>

            <!-- Menu > default -->
            <v-expansion-panel-content>
              <div v-if="tab.type === 'default'">
                <div v-for="(col, i) in tab.cols" :key="i">
                  <v-list-item
                    v-for="(item, index) in col"
                    :key="index"
                    :to="item.to"
                    :href="item.href"
                    :target="item.target"
                    exact
                    class="list-menu-item"
                    active-class="bg-primary text-white"
                  >
                    <v-list-item-title>{{ item.name }}</v-list-item-title>
                  </v-list-item>
                </div>
              </div>

              <!-- Menu > category -->
              <menu-categories
                v-if="tab.type === 'category' && tab.categories"
                :categories="tab.categories"
                style="--item-heigh: 42px"
              ></menu-categories>


            </v-expansion-panel-content>
          </v-expansion-panel>
        </template>

        <!-- ――――――――――――――――――――― Footer Menu ――――――――――――――――――――― -->

        <v-list-item
          v-for="(item, i) in menu"
          :key="'f-' + i"
          link
          :to="item.to"
          exact
          active-class="bg-primary text-white"
        >
          <v-list-item-title>{{ item.name }}</v-list-item-title>
          <v-list-item-icon v-if="item.src"
            ><img :src="item.src" width="24" height="24"
          /></v-list-item-icon>
        </v-list-item>
      </v-expansion-panels>

      <!-- ――――――――――――――――――――― Social links ――――――――――――――――――――― -->
      <v-spacer></v-spacer>
      <v-sheet class="border-top mt-16" color="#fafafa">
        <div v-if="info" class="pa-2">
          <div v-if="info.phone" class="pa-1">
            <v-icon small class="me-1">phone</v-icon>
            <span v-copy>{{ info.phone }}</span>
          </div>
          <div v-if="info.email" class="pa-1">
            <v-icon small class="me-1">email</v-icon>
            <span v-copy>{{ info.email }}</span>
          </div>
          <div v-if="info.address" class="pa-1">
            <v-icon small class="me-1">place</v-icon>

            <flag
              v-if="info.country_code"
              :iso="info.country_code"
              :squared="false"
              class="me-1"
            />
            {{ info.address }}
          </div>
        </div>
        <s-shop-social-buttons
          :shop="shop"
          class="justify-center mt-5"
        ></s-shop-social-buttons>
        <div style="height: 15vh"></div>
      </v-sheet>
    </div>
  </v-navigation-drawer>
</template>

<script>
import SShopUserMenuList from "./SShopUserMenuList.vue";
import MenuCategories from "@app-backoffice/pages/shop/widgets/shop-header/MenuCategories.vue";
import SCurrencySelector from "@components/ui/currency/SCurrencySelector.vue";
import SShopLanguageSelector from "@components/storefront/language/SShopLanguageSelector.vue";
import SShopSocialButtons from "@components/storefront/social/SShopSocialButtons.vue";
export default {
  name: "SShopNavigationDrawer",
  components: {
    SShopLanguageSelector,
    SCurrencySelector,
    MenuCategories,
    SShopUserMenuList,
    SShopSocialButtons,
  },
  props: {
    value: {},
    shop: {
      require: true,
      type: Object,
    },
  },
  data: () => ({
    busy_logout: false,
  }),

  computed: {
    top_menu() {
      return this.shop.menus?.find((it) => it.type === "HEADER");
    },

    tabs() {
      return this.top_menu?.menu;
    },

    info() {
      return this.shop.info;
    },
    menu_footer() {
      return this.shop.menus?.find((it) => it.type === "FOOTER");
    },

    menu() {
      const out = [];

      // Avocado:
      if (this.shop.avocado && this.shop.avocado.enable) {
        out.push({
          to: { name: "AvocadoPage" },
          name: this.$t("global.commons.avocado"),
          src: require("@components/assets/icons/avocado.svg"),
        });
      }
      // Hyper:
      if (this.shop.hyper && this.shop.hyper.enable) {
        out.push({
          to: { name: "HyperPage" },
          name: this.$t("global.commons.hyper"),
          src: require("@components/assets/icons/hyper.svg"),
        });
      }

      // Instagram:
      if (this.shop.instagram) {
        out.push({
          to: { name: "InstagramPage" },
          name: this.$t("global.commons.instagram"),
          src: require("@components/assets/tradmark/instagram.svg"),
        });
      }

      if (
        this.menu_footer &&
        this.menu_footer.menu &&
        this.menu_footer.menu.length &&
        this.menu_footer.menu.some((m) => m.length > 0)
      ) {
        this.menu_footer.menu.forEach((m) => {
          out.push(...m);
        });
      } else {
        out.push(
          ...[
            ...(this.getCustomHomePage()
              ? [
                  {
                    to: { name: this.getCustomHomePage() },
                    name: this.$t("global.commons.home"),
                  },
                  {
                    to: { name: "ShopPage" },
                    name: this.$t("global.commons.shop"),
                  },
                ]
              : [
                  {
                    to: { name: "ShopPage" },
                    name: this.$t("global.commons.shop"),
                  },
                ]),
            {
              to: { name: "ShopBlogsPage" },
              name: this.$t("global.commons.blog"),
            },
          ]
        );
      }

      return out;
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

.s--shop-navigation-drawer {
  display: flex;
  flex-direction: column;
  text-align: start;
  min-height: 100%;

  .list-menu-item {
    font-weight: 500;
    font-size: 1rem;
  }

  .v-list-item__title {
    font-weight: 500;
  }
  .v-list-item__icon {
    .v-icon {
      color: currentColor;
    }
  }
}
</style>
