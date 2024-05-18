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

<template>
  <!-- --------------------------------- Google Search Console Connect --------------------------- -->

  <div v-if="search_console_available" class="widget-box ">
    <s-widget-header
      :src="require('../../../assets/icons/seo.svg')"
      :title="$t('channel_google.serp.title') "
    >
    </s-widget-header>

    <v-list-subheader
      >
      {{$t('channel_google.serp.subtitle')}}


    </v-list-subheader>


    <b-google-serp-connect
      :shop="shop"
    ></b-google-serp-connect>
  </div>
</template>

<script>
import BGoogleSerpConnect from "../../google/serp-connect/BGoogleSerpConnect.vue";
import { SetupService } from "@selldone/core-js/server/SetupService";

export default {
  name: "BGoogleSerp",
  components: {
    BGoogleSerpConnect,
  },
  props: {
    shop: {
      required: true,
      type: Object,
    },
  },
  data: () => ({}),
  computed: {
    search_console_available() {
      return SetupService.LocalServiceCountry() !== "IR";
    },
  },

  watch: {},

  created() {},

  methods: {},
};
</script>

<style lang="scss" scoped></style>
