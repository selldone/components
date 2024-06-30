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
  <v-sheet
    v-if="message && show"
    :color="color"
    class="z1 pa-2 d-flex align-center justify-center"
    dark
    min-height="48"
  >
    <v-spacer></v-spacer>
    <div class="flex-grow-1 py-2 py-sm-0">
      <div class="typo-body mb-5 mb-sm-0" v-html="message"></div>

      <div
        class="small d-flex align-center justify-center mt-1 flex-column flex-sm-row"
      >
        <template v-if="end_date">
          <span
            >{{ $t("global.commons.ends_in") }}
            <v-icon>{{
              $vuetify.display.smAndUp ? "arrow_right" : "arrow_drop_down"
            }}</v-icon></span
          >
          <u-count-down :end="end_date" class="mx-2"></u-count-down>
        </template>

        <v-btn
          v-if="action_text"
          :href="action_url"
          class="ms-0 ms-sm-5 my-3 my-sm-0"
          target="_blank"
          variant="outlined"
        >
          <span v-html="action_text"></span>
          <v-icon class="ms-1">navigate_next</v-icon>
        </v-btn>
      </div>
    </div>
    <v-spacer></v-spacer>
    <div>
      <u-time-laps
        v-if="autoClose"
        :duration-ms="120 * 1000"
        class="mx-5"
        color="amber"
        size="20"
        width="3"
        @end="show = false"
      >
        <v-icon size="small" @click="show = false">close</v-icon>
      </u-time-laps>
    </div>
  </v-sheet>
</template>

<script>
import UTimeLaps from "../../../ui/time/lapse/UTimeLaps.vue";
import UCountDown from "../../../ui/count-down/UCountDown.vue";

export default {
  name: "UNotificationServer",
  components: { UCountDown, UTimeLaps },
  props: {
    notification: {},
    autoClose: { type: Boolean, default: false },
  },
  data: () => ({
    show: false,
  }),
  computed: {
    user() {
      return this.USER();
    },

    message() {
      return this.notification && this.notification.message;
    },
    color() {
      return this.notification && this.notification.color;
    },
    end_date() {
      return (
        this.notification &&
        this.notification.end_at &&
        this.convertToLocalTime(this.notification.end_at)
      );
    },
    action_text() {
      return this.notification && this.notification.action_text;
    },
    action_url() {
      return this.notification && this.notification.action_url;
    },
  },

  watch: {},
  created() {
    if (this.message) this.show = true;
  },

  methods: {},
};
</script>

<style lang="scss" scoped></style>
