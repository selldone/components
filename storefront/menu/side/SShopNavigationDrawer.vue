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
  <teleport to="body">
    <v-navigation-drawer
      :class="{ 'ma-2': modelValue }"
      :model-value="modelValue"
      :width="420"
      class="text-start pt-5 overflow-hidden t-all-400"
      location="start"
      style="border-radius: 24px; height: calc(100vh - 100px); max-width: 90vw"
      temporary
      @update:model-value="(val) => $emit('update:modelValue', val)"
      theme="light"
    >
      <div class="s--shop-navigation-drawer">
        <div class="d-flex align-center pa-2">
          <!--- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Select  Language (in mobile mode) ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ --->
          <s-language-selector
            v-if="shop"
            :shop="shop"
            class="mx-3"
            hide-details
            icon-only
          ></s-language-selector>

          <!--- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Select  Currency (in mobile mode) ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ --->
          <u-currency-selector
            v-if="
              /* isMobile &&*/ shop &&
              shop.currencies &&
              shop.currencies.length > 1
            "
            :shop="shop"
            hide-details
            icon-only
            @change="
              () => {
                onChangeUserSelectedCurrency();
              }
            "
          />
          <v-spacer></v-spacer>

          <v-btn icon variant="text" @click="$emit('update:modelValue', false)">
            <v-icon>close</v-icon>
          </v-btn>
        </div>

        <!--- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Login ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ --->

        <div v-if="!USER()" class="flex-grow-1 my-2">
          <v-btn
            class="tnt"
            rounded="0"
            block
            size="x-large"
            @click="NeedLogin()"
            color="primary"
            variant="flat"
          >
            <v-icon start>login</v-icon>
            {{ $t("global.actions.login") }}
          </v-btn>
        </div>

        <v-expansion-panels class="border-between-vertical" flat>
          <!-- ――――――――――――――――――――― Shop User Menu List ――――――――――――――――――――― -->

          <v-expansion-panel v-if="USER()" class="py-4">
            <v-expansion-panel-title class="px-0 pe-3 py-2">
              <v-list-item>
                <template v-slot:prepend>
                  <v-avatar class="avatar-gradient -thin -user">
                    <v-img :src="getUserAvatar(USER_ID())"></v-img>
                  </v-avatar>
                </template>

                <v-list-item-title class="font-weight-bold"
                  >{{ USER().name }}
                </v-list-item-title>
                <v-list-item-subtitle class="mt-1"
                  >{{ USER().email }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-expansion-panel-title>
            <v-expansion-panel-text class="mx-n6">
              <s-shop-user-menu-list
                :shop="shop"
                navigation
                class="border-between-vertical"
              ></s-shop-user-menu-list>

              <!-- ――――――――――――――――――――― Logout Button ――――――――――――――――――――― -->

              <v-list-item>
                <v-btn
                  :loading="busy_logout"
                  block
                  class="tnt mt-3"
                  size="large"
                  variant="flat"
                  @click="
                    busy_logout = true;
                    Logout(() => (busy_logout = false));
                  "
                >
                  <v-icon class="me-1" size="small">logout</v-icon>
                  {{ $t("global.actions.logout") }}
                </v-btn>
              </v-list-item>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <!-- ――――――――――――――――――――― Header Menu ――――――――――――――――――――― -->

          <template
            v-for="(tab, index) in tabs?.filter((t) =>
              ['link', 'default', 'category'].includes(t.type),
            )"
          >
            <v-list-item
              v-if="tab.type === 'link'"
              :key="'l-' + index"
              :href="tab.link"
              :target="tab.link?.startsWith('http') ? '_blank' : undefined"
              class="flex-grow-1 w-100"
            >
              <v-list-item-title>
                {{ tab.title }}
              </v-list-item-title>
              <template v-slot:prepend>
                <v-icon
                  v-if="tab.icon"
                  :size="
                    tab.icon_size === 'small'
                      ? 'small'
                      : tab.icon_size === 'large'
                        ? 'large'
                        : undefined
                  "
                  >{{ tab.icon }}
                </v-icon>
                <v-icon v-else-if="tab.link?.startsWith('http')" size="small"
                  >open_in_new
                </v-icon>
              </template>
            </v-list-item>

            <v-expansion-panel v-else :key="'m-' + index">
              <v-expansion-panel-title class="pa-0 pe-3">
                <v-list-item :href="tab.link" text>
                  <v-list-item-title>
                    {{ tab.title }}
                  </v-list-item-title>
                  <template v-if="tab.icon" v-slot:prepend>
                    <v-icon
                      :size="
                        tab.icon_size === 'small'
                          ? 'small'
                          : tab.icon_size === 'large'
                            ? 'large'
                            : undefined
                      "
                      >{{ tab.icon }}
                    </v-icon>
                  </template>
                </v-list-item>
              </v-expansion-panel-title>

              <!-- Menu > default -->
              <v-expansion-panel-text>
                <div v-if="tab.type === 'default'">
                  <div v-for="(col, i) in tab.cols" :key="i">
                    <v-list-item
                      v-for="(item, index) in col"
                      :key="index"
                      :href="item.href"
                      :target="item.target"
                      :to="item.to"
                      active-class="bg-primary text-white"
                      class="list-menu-item"
                      exact
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
                  :dark="dark"
                ></menu-categories>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </template>
        </v-expansion-panels>

        <div class="pt-16 border-between-vertical">
          <!-- ――――――――――――――――――――― Footer Menu ――――――――――――――――――――― -->
          <v-list-item
            v-for="(item, i) in menu"
            :key="'f-' + i"
            :to="item.to"
            active-class="bg-primary text-white"
            exact
            class="py-3"
          >
            <v-list-item-title>{{ item.name }}</v-list-item-title>
            <template v-if="item.src" v-slot:append
              ><img :src="item.src" height="24" width="24"
            /></template>
          </v-list-item>
        </div>

        <!-- ――――――――――――――――――――― Social links ――――――――――――――――――――― -->

        <v-sheet
          v-if="
            info?.phone || info?.email || info?.address || shop?.socials?.length
          "
          class="border-top mt-16 text-subtitle-2 pt-5 border-top mt-3"
        >
          <div class="pa-2">
            <div v-if="info.phone" class="pa-1">
              <v-icon class="me-1" size="small">phone</v-icon>
              <span v-copy>{{ info.phone }}</span>
            </div>
            <div v-if="info.email" class="pa-1">
              <v-icon class="me-1" size="small">email</v-icon>
              <span v-copy>{{ info.email }}</span>
            </div>
            <div v-if="info.address" class="pa-1">
              <v-icon class="me-1" size="small">place</v-icon>

              <flag
                v-if="info.country_code"
                :iso="info.country_code"
                :squared="false"
                class="me-1"
              />
              {{ info.address }}
            </div>
          </div>
          <s-storefront-social-buttons
            :shop="shop"
            class="justify-center mt-5"
          ></s-storefront-social-buttons>
          <div style="height: 15vh"></div>
        </v-sheet>
      </div>
    </v-navigation-drawer>
  </teleport>
</template>

<script>
import SShopUserMenuList from "../user/SShopUserMenuList.vue";
import MenuCategories from "../../../storefront/menu/header/MenuCategories.vue";
import UCurrencySelector from "../../../ui/currency/selector/UCurrencySelector.vue";
import SLanguageSelector from "../../../storefront/language/selector/SLanguageSelector.vue";
import SStorefrontSocialButtons from "../../../storefront/social/SStorefrontSocialButtons.vue";

export default {
  name: "SShopNavigationDrawer",
  emits: ["update:modelValue"],
  components: {
    SLanguageSelector,
    UCurrencySelector,
    MenuCategories,
    SShopUserMenuList,
    SStorefrontSocialButtons,
  },
  props: {
    modelValue: {},
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
          to: { name: window.$storefront.routes.AVOCADO_PAGE },
          name: this.$t("global.commons.avocado"),
          src: require("../../../assets/icons/avocado.svg"),
        });
      }
      // Hyper:
      if (this.shop.hyper && this.shop.hyper.enable) {
        out.push({
          to: { name: window.$storefront.routes.HYPER_PAGE },
          name: this.$t("global.commons.hyper"),
          src: require("../../../assets/icons/hyper.svg"),
        });
      }

      // Instagram:
      if (this.shop.instagram) {
        out.push({
          to: { name: window.$storefront.routes.INSTAGRAM_PAGE },
          name: this.$t("global.commons.instagram"),
          src: require("../../../assets/trademark/instagram.svg"),
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
                    to: { name: window.$storefront.routes.SHOP_PAGE },
                    name: this.$t("global.commons.shop"),
                  },
                ]
              : [
                  {
                    to: { name: window.$storefront.routes.SHOP_PAGE },
                    name: this.$t("global.commons.shop"),
                  },
                ]),
            {
              to: { name: window.$storefront.routes.SHOP_BLOGS_PAGE },
              name: this.$t("global.commons.blog"),
            },
          ],
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
