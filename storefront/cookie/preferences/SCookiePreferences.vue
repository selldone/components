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
    <v-card-title class="d-flex align-center">
      <v-avatar :size="48" class="me-2 avatar-gradient -thin -shop">
        <v-img :src="getShopImagePath($shop?.icon, 128)"></v-img>
      </v-avatar>

      <div>
        <b class="d-block">{{ $shop?.title }}</b>
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
        <template v-slot:prepend>
          <v-avatar tile>
            <v-img
              :src="require('../../../assets/icons/europe.svg')"
              height="48"
              width="48"
            ></v-img>
          </v-avatar>
        </template>

        <v-list-item-title>GDPR</v-list-item-title>
        <v-list-item-subtitle
          >General Data Protection Regulation
        </v-list-item-subtitle>
        <v-list-item-subtitle class="text-success"
          >Europe data privacy regulation
          <v-icon color="success" size="small">check</v-icon>
        </v-list-item-subtitle>
      </v-list-item>

      <v-list v-if="apps?.length" lines="three">
        <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Application ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

        <v-list-subheader>
          {{ $t("footer.dialog_setting.app_list") }}
        </v-list-subheader>

        <v-list-item v-for="app in apps" :key="app.code">
          <template v-slot:prepend>
            <v-avatar tile>
              <v-img :src="getShopImagePath(app.icon)" />
            </v-avatar>
          </template>

          <v-list-item-title>{{ app.name }}</v-list-item-title>
          <v-list-item-subtitle>{{ app.description }}</v-list-item-subtitle>

          <v-list-item-action>
            <v-switch
              v-model="app.active"
              color="success"
              @update:model-value="
                setShopAppCustomerActiveState(app, app.active)
              "
            />
            <div class="mx-auto small">
              {{
                app.active
                  ? $t("global.commons.active")
                  : $t("global.commons.inactive")
              }}
            </div>
          </v-list-item-action>
        </v-list-item>
      </v-list>

      <!--- ================= Countries ================= --->
      <div
        v-if="$shop.countries?.length"
        class="text-start text-uppercase mt-3 mx-5"
      >
        <small>{{ $t("global.commons.service_area") }}</small
        ><br />
        <flag
          v-for="country in $shop.countries"
          :key="country"
          :iso="country"
          :squared="false"
          class="m-1 hover-scale force-top"
        />
      </div>
    </v-card-text>
    <v-card-actions>
      <div class="widget-buttons">
        <v-btn
          v-if="hasClose"
          size="x-large"
          variant="text"
          @click="$emit('close')"
        >
          <v-icon start>close</v-icon>
          {{ $t("global.actions.close") }}
        </v-btn>

        <v-btn
          v-if="showCookieAccept"
          color="primary"
          size="x-large"
          variant="flat"
          @click="
            setCookieAccept(true);
            accepted = true;
            $emit('close');
          "
        >
          <v-icon class="me-1">check</v-icon>

          I Agree
        </v-btn>
      </div>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
export default {
  name: "SCookiePreferences",
  inject: ["$shop"],
  emits: ["close"],
  props: {
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
      this.$shop.apps.forEach((app) => {
        // GDPR: Load from local storage if user not login!
        if (!this.USER()) {
          app.blocked =
            localStorage.getItem(
              `shop:${this.$shop.id}-app:${app.code}:blocked`,
            ) === "1";
        }

        app.active = !app.blocked;
      });

      return this.$shop.apps;
    },
  },
  methods: {
    //―――――――――――――――――――――― Cookie ――――――――――――――――――――

    setCookieAccept(active) {
      // @ts-ignore
      if (this.preview) return; // Maybe exists in the component (preview in seller dashboard)

      // GDPR: Save in local storage if user not login!
      if (!active) localStorage.setItem(`GDPR-Cookie`, "false");
      else localStorage.setItem(`GDPR-Cookie`, "true");
    },

    setShopAppCustomerActiveState(app, active) {
      let t = this;

      if (this.USER()) {
        axios
          .post(
            window.XAPI.POST_SET_SHOP_APP_STATUS_BY_CUSTOMER(
              this.$shop.name,
              app.code,
            ),
            {
              active: active,
            },
          )
          .then(({ data }) => {
            if (!data.error) {
              app.blocked = !active;
              t.showSuccessAlert(
                null,
                `Application status has been updated successfully.`,
              );
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
            `shop:${this.$shop.id}-app:${app.code}:blocked`,
          );
        else
          localStorage.setItem(
            `shop:${this.$shop.id}-app:${app.code}:blocked`,
            "1",
          );
      }
    },
  },
};
</script>

<style scoped></style>
