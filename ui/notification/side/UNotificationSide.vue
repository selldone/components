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
        <div :class="item.type" class="s--notifications-notify">
          <v-img
            v-if="item.data?.img"
            :src="item.data.img"
            class="float-start m-2 rounded"
            height="36"
            width="36"
          ></v-img>

          <v-icon v-else class="me-2" color="#fff">
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

          <v-btn
            class="float-end"
            icon
            size="small"
            variant="text"
            @click.stop="close"
          >
            <v-icon>close</v-icon>
          </v-btn>

          <div class="text-start px-1" v-html="item.text"></div>
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
      content-class="no-shadow-dialog"
      scrollable
    >
      <v-card :min-height="240" class="text-start rounded-28px" color="#e5e5e5">
        <template v-slot:title>
          <div class="text-wrap d-flex align-start">
            <div class="pe-2 flex-grow-1" v-html="alert_dialog_title"></div>
            <v-icon color="#bbb">error_outline</v-icon>
          </div>
        </template>

        <v-card-text class="typo-body">
          <div v-html="alert_dialog_message"></div>
        </v-card-text>

        <v-card-actions>
          <div class="widget-buttons">
            <v-btn
              color="#333"
              size="x-large"
              variant="text"
              @click="alert_dialog = false"
            >
              <v-icon start>close</v-icon>
              {{ alert_dialog_reject_button }}
            </v-btn>

            <v-btn
              :color="color"
              size="x-large"
              variant="flat"
              @click="onAccept"
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
import { Notifications } from "@kyvg/vue3-notification";

export default {
  name: "UNotificationSide",
  components: { Notifications },
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
