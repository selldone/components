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
  <!-- ―――――――――― User ―――――――――― -->



  <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ User ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

  <v-slide-y-reverse-transition group leave-absolute>
    <v-btn
      v-if="!busy_user && USER()"
      key="kav1"
      :color="!dark ? '#ddd' : ThemeColorDeepDark"
      :loading="busy_logout"
      class="me-1 mt-1 hover-shadow"
      height="42"
      rounded
      variant="outlined"
    >

      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ User Badges ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <img
        v-if="club"
        :src="getCustomerClubLevel(club.level).icon"
        height="22"
        width="22"
        class="me-3 ms-n1"
      />
      <v-icon v-else :color="!dark ? '#222' : '#fff'" start>menu</v-icon>

      <v-avatar
        :color="!dark ? '#fff' : ThemeColorDeepDark"
        class="me-n3"
        size="32"
      >
        <img :src="getUserAvatar(USER_ID())" />
      </v-avatar>




      <v-menu
        v-model="menu"
        :close-on-content-click="true"
        :max-width="460"
        :min-width="280"
        activator="parent"
        open-on-click
        width="80vw"
        z-index="99999999"
      >
        <v-card color="#f8f8f8" flat rounded="xl">
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

                  <img
                    v-if="club"
                    :src="getCustomerClubLevel(club.level).icon"
                    class="mx-1"
                    height="18"
                    width="18"
                  />

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
                  v-if="$shop?.lottery?.enable"
                  class="d-flex align-center pt-2"
                >
                  <img
                    class="m-1"
                    height="24"
                    src="../../../../assets/icons/chips.svg"
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
            v-if="$shop"
            class="mx-4 my-2"
            @click:logout="logout()"
          ></s-shop-user-menu-list>

          <!-- ―――――――――― Extra links ―――――――――― -->

          <template v-if="has_avocado || has_hyper || has_insta">
            <v-row v-if="$shop" class="m-0 pb-4" dense justify="space-around">
              <v-col
                v-if="has_avocado"
                class="d-flex flex-column align-center"
                cols="4"
              >
                <v-btn
                  :to="{ name: 'AvocadoPage' }"
                  icon
                  size="large"
                  variant="text"
                >
                  <img
                    height="24"
                    src="../../../../assets/icons/avocado.svg"
                    width="24"
                  />
                </v-btn>
                <small>{{ $t("global.commons.avocado") }}</small>
              </v-col>
              <v-col
                v-if="has_hyper"
                class="d-flex flex-column align-center"
                cols="4"
              >
                <v-btn
                  :to="{ name: window.$storefront.routes.HYPER_PAGE }"
                  icon
                  size="large"
                  variant="text"
                >
                  <img
                    height="24"
                    src="../../../../assets/icons/hyper.svg"
                    width="24"
                  />
                </v-btn>
                <small>
                  {{ $t("global.commons.hyper") }}
                </small>
              </v-col>
              <v-col
                v-if="has_insta"
                class="d-flex flex-column align-center"
                cols="4"
              >
                <v-btn
                  :to="{ name: 'InstagramPage' }"
                  icon
                  size="large"
                  variant="text"
                >
                  <img
                    height="24"
                    src="../../../../assets/trademark/instagram.svg"
                    width="24"
                  />
                </v-btn>
                <small>{{ $t("global.commons.instashop") }}</small>
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

    <u-button-circle
      v-else-if="!busy_user"
      key="kav2"
      :color="!dark ? '#333' : '#fff'"
      dense
      exact
      tile
      :loading="!$shop"
      @click="NeedLogin()"
      :tooltip="$t('layout_shop.login_to_shop_short')"
      class="me-3 fadeIn"

      :src="
      dark
        ? require('./assets/user.svg')
        : require('./assets/user.svg')
    "
    >
    </u-button-circle>
  </v-slide-y-reverse-transition>
</template>

<script lang="ts">
import SShopUserMenuList from "@selldone/components-vue/storefront/menu/user/SShopUserMenuList.vue";
import TemplateMixin from "@selldone/components-vue/mixin/template/TemplateMixin.ts";
import AuthMixin from "@selldone/components-vue/mixin/auth/AuthMixin.ts";
import ClubMixin from "@selldone/components-vue/mixin/club/ClubMixin.ts";

export default {
  name: "SHeaderSectionUser",
  mixins: [TemplateMixin, AuthMixin,ClubMixin],

  components: {
    SShopUserMenuList,
  },
  inject: ["$shop"],

  props: {
    dark: Boolean,
  },
  data: () => ({
    busy_logout: false,
    menu: false,
  }),

  computed: {
    user() {
      return this.$store.getters.getUser;
    },
    club() {
      return this.getClub();
    },
    profile() {
      return this.user && this.user.profile;
    },

    theme() {
      if (!this.$shop) return null;
      return this.$shop.theme;
    },

    busy_user() {
      return this.$store.getters.getBusyUser;
    },

    has_avocado() {
      return this.$shop.avocado && this.$shop.avocado.enable;
    },
    has_hyper() {
      return this.$shop.hyper && this.$shop.hyper.enable;
    },
    has_insta() {
      return this.$shop.instagram;
    },
  },

  watch: {},

  created() {},

  mounted() {},
  beforeUnmount() {},

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


</style>
