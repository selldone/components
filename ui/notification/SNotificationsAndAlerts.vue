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
  <div>
    <notifications
      group="regular-notifications"
      position="bottom right"
      style="z-index: 9999999"
    >
      <template v-slot:body="{ item, close }">
        <div class="vue-samin-notification" :class="item.type">
          <v-img
            v-if="item.data?.img"
            width="36"
            height="36"
            class="float-start m-2 rounded"
            :src="item.data.img"
          ></v-img>

          <v-icon v-else class="float-start m-2" dark>
            {{
              item.data?.icon
                ? item.data.icon
                : item.type === "error"
                  ? "error"
                  : item.type === "warn"
                    ? "warning"
                    : item.type === "award"
                      ? "card_giftcard"
                      : item.type === "success"
                        ? "check_circle"
                        : item.type === "message"
                          ? "message"
                          : "info"
            }}
          </v-icon>

          <b class="font-weight-bold" v-html="item.title"> </b>

          <v-btn icon class="float-end" @click="close" size="small">
            <v-icon>close</v-icon>
          </v-btn>

          <div class="text-start" v-html="item.text"></div>
        </div>
      </template>
    </notifications>

    <v-dialog
      v-model="alert_dialog"
      :max-width="
        Math.max(
          480,
          (alert_dialog_accept_button + alert_dialog_reject_button).length * 11,
        )
      "
      scrollable
      content-class="no-shadow-dialog"
    >
      <v-card class="text-start rounded-28px" :min-height="240" color="#e5e5e5">
        <v-card-title class="dialog-title d-flex align-center">
          <div class="pe-2 flex-grow-1" v-html="alert_dialog_title"></div>
          <v-icon color="#bbb">error_outline</v-icon>
        </v-card-title>

        <v-card-text class="typo-body">
          <div v-html="alert_dialog_message"></div>
        </v-card-text>

        <v-card-actions>
          <div class="widget-buttons">
            <v-btn
              color="#333"
              variant="text"
              @click="alert_dialog = false"
              size="x-large"
            >
              <v-icon class="me-1">close</v-icon>
              {{ alert_dialog_reject_button }}
            </v-btn>

            <v-btn
              :color="color"
              variant="flat"
              @click="onAccept"
              size="x-large"
            >
              <v-icon class="me-1">check</v-icon>
              {{ alert_dialog_accept_button }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: "SNotificationsAndAlerts",
  data: () => ({
    alert_dialog: false,
    alert_dialog_title: "",
    alert_dialog_message: "",
    alert_dialog_accept_button: "",
    alert_dialog_reject_button: "",
    alert_dialog_callback: null,
    color: "red",
  }),

  created() {
    //█████████████████████████████████████████████████████████████
    //――――――――――――――――――――――――― Event Bus ―――――――――――――――――――――――――
    //█████████████████████████████████████████████████████████████
    this.EventBus.$on(
      "alert-dialog",
      ({ title, message, accept, reject, callback, color }) => {
        this.alert_dialog_title = title;
        this.alert_dialog_message = message;
        this.alert_dialog_accept_button = accept;
        this.alert_dialog_reject_button = reject;
        this.alert_dialog_callback = callback;
        this.alert_dialog = true;
        this.color = color;
      },
    );
  },

  beforeUnmount() {
    this.EventBus.$off("alert-dialog");
  },
  methods: {
    onAccept() {
      if (
        this.alert_dialog_callback &&
        typeof this.alert_dialog_callback === "function"
      ) {
        this.alert_dialog_callback();
      }
      this.alert_dialog = false;
    },
  },
};
</script>

<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */

.is-mobile {
  .vue-notification-group {
    bottom: 76px !important;
  }
}
</style>
