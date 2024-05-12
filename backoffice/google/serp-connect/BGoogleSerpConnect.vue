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
  <!-- --------------------------------- Google Search Console Connect --------------------------- -->

  <div>
    <v-list-item>
      <template v-slot:prepend>
        <v-avatar rounded>
          <img src="../../../assets/trademark/google.svg" />
        </v-avatar>
      </template>

      <v-list-item-title>
        <b>Connect to Google Search Console</b>
      </v-list-item-title>
      <v-list-item-subtitle>
        Connect your shop to the search console and start exploring keywords,
        ranks, and other free SEO tools on Selldone.
      </v-list-item-subtitle>
    </v-list-item>

    <div v-if="!shop.search_console">
      <b class="d-block mt-7 mb-2">
        Prior to linking Selldone with Google Search Console, ensure the
        following:
      </b>
      <ol class="my-3">
        <li>
          Add, verify, and set as primary your
          <router-link :to="{ name: 'BPageShopSettingDomain' }"
            ><b>Custom Domain</b></router-link
          >
          .
          <u-check :model-value="!!main_domain" class="mx-1"></u-check>
        </li>
        <li>
          Add and verify
          <b>{{ main_domain ? main_domain.domain : "your domain" }}</b> in your
          <a href="https://search.google.com/search-console" target="_blank"
            ><b>Google Search Console</b></a
          >.
        </li>
      </ol>
    </div>

    <div class="widget-buttons">
      <v-btn
        v-if="!shop.search_console"
        :class="{ disabled: !main_domain }"
        :href="`/shops/${shop.id}/services/google/search/authentication/login`"
        :loading="busy_search"
        color="primary"
        size="x-large"
        variant="elevated"
        @click="busy_search = true"
      >
        <v-icon start>cable</v-icon>
        Connect Now
      </v-btn>
      <v-btn
        v-else
        :loading="busy_remove_search_console"
        color="red"
        size="x-large"
        variant="text"
        @click="askRemove()"
      >
        <v-icon start>mobiledata_off</v-icon>
        Remove connection
      </v-btn>
    </div>
  </div>
</template>

<script>
export default {
  name: "BGoogleSerpConnect",
  components: {},
  props: {
    shop: {
      required: false,
      type: Object,
    },
  },

  data: () => ({
    busy_search: false,
    busy_remove_search_console: false,
  }),

  computed: {
    main_domain() {
      return this.shop.domains.find((i) => i.enable && i.primary);
    },
  },

  watch: {},

  created() {},

  methods: {
    askRemove() {
      this.openDangerAlert(
        "Remove connection",
        "Are you sure remove the search console link?",
        "Yes, remove it",
        () => {
          this.removeSearchConsole();
        },
      );
    },

    removeSearchConsole() {
      this.busy_remove_search_console = true;

      axios
        .delete(window.API.DELETE_SEARCH_CONSOLE_CONNECTION(this.shop.id))
        .then(({ data }) => {
          if (!data.error) {
            this.shop.search_console = false;
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_remove_search_console = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
