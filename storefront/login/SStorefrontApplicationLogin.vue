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
  <v-dialog v-if="nativeApp" v-model="login_to_app_dialog" max-width="480">
    <v-card>
      <v-card-title class="dialog-title">
        {{ $t("shop.native.title") }}
      </v-card-title>

      <v-card-text class="text-start">
        <p>
          {{ $t("shop.native.message") }}
        </p>
        <p class="font-weight-bold">
          <v-icon class="mx-1" color="green">security</v-icon>
          {{ $t("shop.native.message_bold") }}
        </p>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          class="mx-1"
          rounded
          size="large"
          variant="text"
          @click="rejectLoginNativeApp()"
        >
          {{ $t("global.actions.no") }}
        </v-btn>

        <v-btn
          class="mx-1"
          color="green-darken-1"

          size="large"
          variant="flat"
          @click="sendTokenToNativeApp()"
        >
          {{ $t("global.actions.accept") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "SStorefrontApplicationLogin",
  components: {},
  props: {
    shop: {
      require: true,
      type: Object,
    },
  },
  data: () => ({
    login_to_app_dialog: false,
  }),
  computed: {
    nativeApp() {
      return window.NativeApp; // Object pass by server to indicate native app request (login)
    },
  },
  watch: {},
  created() {},
  mounted() {
    //――――――――――――――――――――――  Request Login by app (Open app auto) ――――――――――――――――――――

    if (this.nativeApp) {
      this.login_to_app_dialog = true;
    }

    if (this.$route.query && this.$route.query.native) {
      this.$store.commit("setIsNative", true);
    }
  },

  methods: {
    sendTokenToNativeApp() {
      this.login_to_app_dialog = false;
      window.location = `${this.nativeApp.app}?token=${window.$cookies.get(
        "access_token",
      )}`;
    },
    rejectLoginNativeApp() {
      this.login_to_app_dialog = false;
      window.location = `${this.nativeApp.app}`;
    },
  },
};
</script>

<style lang="scss"></style>
