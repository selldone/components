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
  <v-list-item :key="login.code" :class="{ disabled: !login.available }">
    <template v-slot:prepend>
      <v-avatar rounded size="24">
        <img v-if="login.image" :src="login.image" />
        <v-icon v-else color="#333">{{ login.icon }}</v-icon>
      </v-avatar>
    </template>

    <v-list-item-title
      >{{ login.title }}
      <v-chip
        v-if="login.premium"
        class="float-end"
        color="primary"
        label
        size="x-small"
      >
        <v-icon size="x-small" start>add</v-icon>
        {{ $t("global.commons.premium") }}
      </v-chip>
      <v-chip
        v-if="login.paid"
        class="float-end"
        color="#673AB7"
        label
        size="x-small"
      >
        <v-icon size="x-small" start>paid</v-icon>
        {{ $t("global.commons.paid") }}
      </v-chip>
    </v-list-item-title>
    <v-list-item-subtitle v-if="login.subtitle" :title="login.subtitle">
      {{ login.subtitle }}
    </v-list-item-subtitle>

    <template v-slot:append>
      <v-btn
        :loading="busy_login === login.code"
        icon
        variant="text"
        @click="
          setOptionLoginMethods(
            login.code,
            !(!options_login || options_login.includes(login.code)),
          )
        "
      >
        <u-check
          :model-value="
            login.available &&
            (!options_login || options_login.includes(login.code))
          "
          read-only
        ></u-check>
      </v-btn>
    </template>
  </v-list-item>
</template>

<script>
import { ShopOptionsHelper } from "@selldone/core-js/helper/shop/ShopOptionsHelper";

export default {
  name: "BOptionsLoginMethodRow",
  components: {},
  props: {
    shop: {
      required: false,
      type: Object,
    },
    login: {
      required: false,
      type: Object,
    },
  },

  data: () => ({
    busy_login: null,
  }),

  computed: {
    options_login() {
      let out = ShopOptionsHelper.GetLoginMethods(this.shop);
      return out && Array.isArray(out) ? out : null;
    },
  },

  created() {},
  methods: {
    setOptionLoginMethods(code, enable) {
      this.busy_login = code;
      axios
        .post(window.API.POST_SET_SHOP_OPTIONS_LOGIN_METHODS(this.shop.id), {
          code: code,
          enable: enable,
        })
        .then(({ data }) => {
          if (!data.error) {
            this.shop.options = data.options;
            this.showSuccessAlert(null, "Login methods updated successfully.");
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_login = null;
        });
    },
  },
};
</script>

<style scoped></style>
