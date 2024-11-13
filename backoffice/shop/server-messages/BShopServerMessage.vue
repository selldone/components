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
  <div v-if="has_message">
    <!------------------------------- Messages ------------------------------->

    <v-menu
      v-if="shop && messages?.length"
      :persistent="false"
      close-on-content-click
      min-width="240"
    >
      <template v-slot:activator="{ props }">
        <span
          :caption="$t('global.commons.messages')"
          class="sub-caption -hover d-inline-block fadeIn delay_200"
          v-bind="props"
        >
          <v-btn icon variant="text">
            <v-badge
              :content="messages.length"
              :dot="messages.length === 1"
              :model-value="messages.length > 0"
              color="blue"
              floating
            >
              <v-icon>mail</v-icon>
            </v-badge>
          </v-btn>
        </span>
      </template>

      <v-sheet class="text-start" rounded="xl">
        <v-list max-width="480">
          <v-list-item
            v-for="(message, index) in messages"
            :key="index"
            @click="showMessage(message)"
          >
            <template v-slot:prepend>
              <v-icon :color="getPriorityColor(message.priority)">mail</v-icon>
            </template>

            <v-list-item-title
              v-html="extractContent(message.title)"
            ></v-list-item-title>
            <v-list-item-subtitle
              v-html="extractContent(message.message)"
            ></v-list-item-subtitle>
          </v-list-item>

          <v-list-item
            v-if="!messages || !messages.length"
            class="text-center text-muted"
          >
            {{ $t("global.commons.no_message") }}
          </v-list-item>
        </v-list>
      </v-sheet>
    </v-menu>

    <!--- ======= Message Dialog ======= --->
    <v-dialog v-if="selected_message" v-model="show_messages" :max-width="640">
      <v-card class="text-start" rounded="xl">
        <v-card-title class="text-uppercase d-flex align-center">
          <span v-html="selected_message.title"></span>
          <v-spacer></v-spacer>
          <v-icon>email</v-icon>
        </v-card-title>
        <v-card-text v-html="selected_message.message"></v-card-text>
        <v-card-actions>
          <div class="widget-buttons">
            <v-btn size="x-large" variant="text" @click="show_messages = false"
              >{{ $t("global.actions.close") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
export default {
  name: "BShopServerMessage",
  components: {},
  data: () => ({
    show_messages: false,
    selected_message: null,
  }),
  computed: {
    has_message() {
      return this.messages?.length;
    },
    shop() {
      return this.$route.params.shop_id
        ? this.$store.getters.getCurrentAdminShop
        : null;
    },

    messages() {
      if (!this.shop) return [];
      return this.shop.messages;
    },
  },
  watch: {},
  created() {},
  methods: {
    showMessage(message) {
      this.selected_message = message;
      this.show_messages = true;
    },
    getPriorityColor(priority) {
      if (priority === "l") return "#444";
      else if (priority === "m") return "#1976D2";
      else if (priority === "h") return "#C2185B";

      return "#444";
    },

    //―――――――――――――――――――――― Convert Html to Text ――――――――――――――――――――

    extractContent(html: string) {
      return new DOMParser().parseFromString(html, "text/html").documentElement
        .textContent;
    },
  },
};
</script>
<style lang="scss" scoped></style>
