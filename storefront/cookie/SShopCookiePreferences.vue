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
  <v-card class="text-start">
    <v-card-title>
      <v-avatar class="me-2">
        <v-img :src="getShopImagePath(shop?.icon, 128)"></v-img>
      </v-avatar>

      <div>
        <b class="d-block">{{ shop?.title }}</b>
        {{ $t("footer.dialog_setting.title") }}
      </div>
    </v-card-title>
    <v-card-text>
      <div class="py-10">
        <h2 class="my-2">{{ $t("global.cookie.title") }}</h2>
        <p class="typo-body">
          {{ $t("global.cookie.message") }}
        </p>
      </div>

      <v-list-item class="text-start">
        <v-list-item-avatar tile>
          <v-img
            :src="require('@/Components/assets/icons/europe.svg')"
            width="48"
            height="48"
            contain
          ></v-img>
        </v-list-item-avatar>

        <v-list-item-content dir="ltr">
          <v-list-item-title>GDPR</v-list-item-title>
          <v-list-item-subtitle
            >General Data Protection Regulation
          </v-list-item-subtitle>
          <v-list-item-subtitle class="text-success"
            >Europe data privacy regulation
            <v-icon color="success" small>check</v-icon>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-list v-if="apps?.lenght" flat subheader three-line>
        <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Application ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

        <v-subheader>
          {{ $t("footer.dialog_setting.app_list") }}
        </v-subheader>

        <v-list-item v-for="app in apps" :key="app.code">
          <v-list-item-avatar tile>
            <v-img :src="getShopImagePath(app.icon)" contain />
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>{{ app.name }}</v-list-item-title>
            <v-list-item-subtitle>{{ app.description }}</v-list-item-subtitle>
          </v-list-item-content>

          <v-list-item-action>
            <v-switch
              v-model="app.active"
              color="success"
              @change="setShopAppCustomerActiveState(app, app.active)"
            />
            <v-list-item-action-text class="mx-auto">
              {{ app.active ? $t('global.commons.active') : $t('global.commons.inactive') }}
            </v-list-item-action-text>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </v-card-text>
    <v-card-actions>
      <div class="widget-buttons">
        <v-btn v-if="hasClose" depressed text x-large @click="$emit('close')">
          <v-icon class="me-1">close</v-icon>
          {{ $t("global.actions.close") }}
        </v-btn>

        <v-btn
          v-if="showCookieAccept"
          color="primary"
          x-large
          depressed
          @click="
            setCookieAccept(true);
            accepted = true;
            $emit('close')
          "
          dark
          ><v-icon class="me-1">check</v-icon>

          I Agree</v-btn
        >
      </div>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: "SShopCookiePreferences",
  props: {
    shop: {
      type: Object,
      required: true,
    },
    hasClose: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    accepted: false,
  }),

  computed: {
    showCookieAccept() {
      return localStorage.getItem(`GDPR-Cookie`) !== "true" && !this.accepted;
    },

    apps() {
      this.shop.apps.forEach((app) => {
        // GDPR: Load from local storage if user not login!
        if (!this.USER()) {
          app.blocked =
            localStorage.getItem(
              `shop:${this.shop.id}-app:${app.code}:blocked`
            ) === "1";
        }

        app.active = !app.blocked;
      });

      return this.shop.apps;
    },
  },
  methods: {
    setShopAppCustomerActiveState(app, active) {
      let t = this;

      if (this.USER()) {
        axios
          .post(
            window.XAPI.POST_SET_SHOP_APP_STATUS_BY_CUSTOMER(
              this.shop.name,
              app.code
            ),
            {
              active: active,
            }
          )
          .then(({ data }) => {
            if (!data.error) {
              app.blocked = !active;
              t.showSuccessAlert(null, `Application status has been updated successfully.`);
            } else {
              t.showErrorAlert(null, data.error_msg);
            }
          })
          .catch((error) => {
            t.showLaravelError(error);
            console.log(error);
          });
      } else {
        // GDPR: Save in local storage if user not login!
        if (active)
          localStorage.removeItem(
            `shop:${this.shop.id}-app:${app.code}:blocked`
          );
        else
          localStorage.setItem(
            `shop:${this.shop.id}-app:${app.code}:blocked`,
            "1"
          );
      }
    },
  },
};
</script>

<style scoped></style>
