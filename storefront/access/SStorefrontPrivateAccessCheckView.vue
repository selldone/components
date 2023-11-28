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
  <div class="s--storefront-private-access-check-view d-flex">
    <div class="m-auto pa-3">
      <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Shop Info ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

      <div>
        <v-avatar size="64" class="avatar-gradient -thin -shop mb-2">
          <img :src="getShopImagePath(shop.icon, 128)" />
        </v-avatar>
      </div>

      <div class="mb-5 font-weight-bold">
        {{ shop.title }}
      </div>
      <v-expand-transition>
        <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Busy User ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

        <div v-if="busy_user" class="display-1" key="1">
          {{ $t("check_access.waiting_message") }}
        </div>

        <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ User Fetched ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

        <div v-else key="2">
          <div
            class="display-1 mb-3"
            v-html="$t('check_access.no_access_message')"
          ></div>

          <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Contact ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

          <div v-if="info && info.email" class="widget-buttons">
            <v-btn :href="`mailto:${info.email}`" text color="primary" x-large>
              <v-icon class="me-1">email</v-icon>
              {{ info.email }}</v-btn
            >
          </div>
          <div v-if="info && info.phone" class="widget-buttons">
            <v-btn :href="`tel:${info.phone}`" text color="primary" x-large>
              <v-icon class="me-1">phone</v-icon>

              {{ info.phone }}</v-btn
            >
          </div>

          <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ User ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

          <template v-if="user">
            <hr class="my-5" />

            <div class="d-flex align-center text-start mb-5 max-widget-width">
              <v-avatar class="me-2 avatar-gradient -thin" size="38">
                <v-img :src="getUserAvatar(user.id)"></v-img>
              </v-avatar>
              <div class="flex-grow-1">
                <div>
                  <b>{{ user.name }}</b>
                </div>
                <small>{{ user.email }}</small>
              </div>
            </div>

            <div class="widget-buttons">
              <v-btn
                @click="
                  busy_logout = true;
                  Logout(() => {
                    busy_logout = false;
                  });
                "
                :loading="busy_logout"
                color="primary"
                x-large
              >
                <v-icon class="me-1">logout</v-icon>
                {{ $t("global.actions.logout") }}
              </v-btn>
            </div>
          </template>

          <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Guest ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

          <div v-else class="widget-buttons">
            <v-btn
              :href="`${window.$storefront.prefix_url}/login`"
              @click="busy_login = true"
              :loading="busy_login"
              color="primary"
              x-large
            >
              <v-icon class="me-1">login</v-icon>
              {{ $t("global.actions.login_now") }}
            </v-btn>
          </div>
        </div>
      </v-expand-transition>
    </div>
  </div>
</template>

<script>
import { ShopRestriction } from "@core/enums/shop/ShopRestriction";

export default {
  name: "SStorefrontPrivateAccessCheckView",
  components: {},
  /**
   * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
   *  🔷 Props
   * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
   */
  props: {
    shop: { required: true, type: Object },
  },

  /**
   * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
   *  🔷 Data
   * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
   */
  data: () => ({
    busy_logout: false,
    busy_login: false,
  }),

  /**
   * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
   *  🔷 Compute Section
   * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
   */
  computed: {
    is_private() {
      return (
        this.shop && this.shop.restriction === ShopRestriction.PRIVATE.code
      );
    },
    user() {
      return this.USER();
    },
    customer_has_access() {
      return this.user && this.user.access;
    },
    busy_user() {
      return this.$store.getters.getBusyUser;
    },
    info() {
      return this.shop && this.shop.info;
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
.s--storefront-private-access-check-view {
  min-height: 80vh;
  display: flex;
}
</style>
