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
            class="mx-3"
            hide-details
            icon-only
          ></s-language-selector>

          <!--- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Select  Currency (in mobile mode) ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ --->
          <u-currency-selector
            v-if="$shop.currencies?.length > 1"
            :shop="$shop"
            hide-details
            icon-only
            @change="
              () => {
                onChangeUserSelectedCurrency();
              }
            "
          />
          <v-spacer></v-spacer>

          <v-btn
            icon
            variant="text"
            @click="$emit('update:modelValue', false)"
            aria-label="Close menu"
          >
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
                    <v-img :src="getUserAvatar(USER_ID())" alt="User"></v-img>
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
              class="flex-grow-1 w-100 ps-2"
              nav
              :aria-label="`Open ${tab.title}`"
              role="link"
              :aria-selected="null"
              :prepend-icon="tab.icon"
              :append-icon="
                tab.link?.startsWith('http') ? 'open_in_new' : undefined
              "
              slim
              min-height="48"
            >
              <v-list-item-title class="s--title">
                {{ tab.title }}
              </v-list-item-title>
            </v-list-item>

            <v-expansion-panel v-else :key="'m-' + index">
              <v-expansion-panel-title class="pa-0 pe-3">
                <v-list-item
                  :aria-selected="null"
                  class="ps-2"
                  slim
                  :prepend-icon="tab.icon"
                  min-height="48"
                >
                  <v-list-item-title class="s--title">
                    {{ tab.title }}
                  </v-list-item-title>
                </v-list-item>
              </v-expansion-panel-title>

              <!-- Menu > default -->
              <v-expansion-panel-text>
                <div v-if="tab.type === 'default'" class="mx-n2">
                  <template v-for="(col, i) in tab.cols" :key="i">
                    <v-list-item
                      v-for="(item, index) in col"
                      :key="i + '-' + index"
                      :href="item.href"
                      :target="item.target"
                      :to="item.to"
                      :prepend-icon="item.icon"
                      active-class="bg-primary text-white"
                      class=""
                      exact
                      nav
                      :aria-selected="null"
                      min-height="42"
                    >
                      <v-list-item-title class="s--title"
                        >{{ item.name }}
                      </v-list-item-title>
                    </v-list-item>
                  </template>
                </div>

                <!-- Menu > category -->
                <menu-categories
                  v-if="tab.type === 'category' && tab.categories"
                  :categories="tab.categories"
                  style="--item-heigh: 42px"
                  :dark="dark"
                  zero-padding
                  navigation
                ></menu-categories>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </template>

          <!-- ――――――――――――――――――――― Footer Menu ――――――――――――――――――――― -->

          <v-expansion-panel hide-actions>
            <v-expansion-panel-title>
              <div class="s--title text-center flex-grow-1 text-uppercase">
                {{ $t("global.commons.more") }}...
              </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text class="no-exp-padding">
              <div class="border-between-vertical">
                <v-list-item
                  v-for="(item, i) in menu"
                  :key="'f-' + i"
                  :to="item.to"
                  active-class="bg-primary text-white ps-2"
                  exact
                  class="py-3"
                  nav
                  :aria-selected="null"
                  slim
                  min-height="48"
                >
                  <v-list-item-title class="s--title"
                    >{{ item.name }}
                  </v-list-item-title>
                  <template v-if="item.src" v-slot:append
                    ><img :src="item.src" height="24" width="24" alt="Icon"
                  /></template>
                </v-list-item>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

        <!-- ――――――――――――――――――――― Social links ――――――――――――――――――――― -->

        <v-sheet
          v-if="
            info?.phone ||
            info?.email ||
            info?.address ||
            $shop?.socials?.length
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
            class="justify-center mt-5"
            :size="24"
          ></s-storefront-social-buttons>
          <div style="height: 15vh"></div>
        </v-sheet>
      </div>
    </v-navigation-drawer>
  </teleport>
</template>

<script lang="ts">
import SShopUserMenuList from "../user/SShopUserMenuList.vue";
import MenuCategories from "../../../storefront/menu/header/MenuCategories.vue";
import UCurrencySelector from "../../../ui/currency/selector/UCurrencySelector.vue";
import SLanguageSelector from "../../../storefront/language/selector/SLanguageSelector.vue";
import SStorefrontSocialButtons from "../../../storefront/social/SStorefrontSocialButtons.vue";
import AuthMixin from "@selldone/components-vue/mixin/auth/AuthMixin.ts";

export default {
  name: "SShopNavigationDrawer",
  mixins: [AuthMixin],

  emits: ["update:modelValue"],
  components: {
    SLanguageSelector,
    UCurrencySelector,
    MenuCategories,
    SShopUserMenuList,
    SStorefrontSocialButtons,
  },
  inject: ["$shop"],

  props: {
    modelValue: {},
    dark: {},
  },
  data: () => ({
    busy_logout: false,
  }),

  computed: {
    top_menu() {
      return this.$shop.menus?.find((it) => it.type === "HEADER");
    },

    tabs() {
      return this.top_menu?.menu;
    },

    info() {
      return this.$shop.info;
    },
    menu_footer() {
      return this.$shop.menus?.find((it) => it.type === "FOOTER");
    },

    menu() {
      const out = [];

      // Avocado:
      if (this.$shop.avocado && this.$shop.avocado.enable) {
        out.push({
          to: { name: window.$storefront.routes.AVOCADO_PAGE },
          name: this.$t("global.commons.avocado"),
          src: require("../../../assets/icons/avocado.svg"),
        });
      }
      // Hyper:
      if (this.$shop.hyper && this.$shop.hyper.enable) {
        out.push({
          to: { name: window.$storefront.routes.HYPER_PAGE },
          name: this.$t("global.commons.hyper"),
          src: require("../../../assets/icons/hyper.svg"),
        });
      }

      // Instagram:
      if (this.$shop.instagram) {
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

  .s--title {
    font-size: 14px !important;
    font-weight: 500;
  }

  .no-exp-padding {
    .v-expansion-panel-text__wrapper {
      padding: 0 !important;
    }
  }
}
</style>
