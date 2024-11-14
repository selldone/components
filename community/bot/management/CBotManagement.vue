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
  <v-container
    :class="{ 'pointer-event-none': community && !access.admin }"
    class="text-start"
  >
    <div class="widget-box">
      <u-widget-header icon="fa:fab fa-telegram" title="Telegram channel">
      </u-widget-header>

      <p class="mt-3" dir="ltr">
        Auto publish post on your Telegram channel. <br />

        1. add <b>@{{ official_telegram_bot }}</b> bot to
        <b>your channel</b> and set send post permission. <br />
        2. Past your <b>channel name</b> here and click <b>save</b>.
      </p>
      <p v-if="telegram && telegram.errors" dir="ltr">
        Send errors: <b class="text-danger">{{ telegram.errors }}</b> / limit is
        30! System auto disable the publishing if your bot reach this limit. If
        this happen you should re-enable it manually.
      </p>
      <v-alert
        v-if="telegram && !telegram.enable"
        border="start"
        color="red"
        type="error"
      >
        Telegram bot disabled to publish on this channel! Check your channel
        name and set the channel again.
      </v-alert>

      <v-switch
        v-model="telegram_enable"
        :label="telegram_enable ? 'Enable' : 'Disable'"
        class="mb-3"
        color="success"
        messages="Publish on the telegram channel"
      ></v-switch>

      <v-text-field
        v-model="telegram_channel"
        :prepend-inner-icon="telegram_lock ? 'lock' : 'lock_open'"
        :readonly="telegram_lock"
        label="Telegram channel"
        messages="Past your channel name here"
        placeholder="Your channel name without @..."
        prefix="@"
        @click:prepend-inner="telegram_lock = !telegram_lock"
        variant="underlined"
      >
      </v-text-field>

      <div class="widget-buttons">
        <v-btn
          :disabled="!telegram_channel"
          :loading="busy"
          color="primary"
          size="x-large"
          @click="saveBot('Telegram', telegram_channel, telegram_enable)"
        >
          <v-icon start>save</v-icon>
          {{ $t("global.actions.save") }}
        </v-btn>
      </div>
    </div>
  </v-container>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import { SetupService } from "@selldone/core-js/server/SetupService.ts";


export default {
  name: "CBotManagement",
  mixins: [],
  components: {},

  props: {
    community: {}, // In the add if be null.
  },

  data() {
    return {
      busy: false,

      telegram_enable: true,
      telegram_channel: null,
      telegram_lock: false,
    };
  },

  computed: {
    access() {
      return this.community && this.community.access;
    },

    bots() {
      return this.community && this.community.bots;
    },
    telegram() {
      return this.bots && this.bots.Telegram;
    },
    official_telegram_bot() {
      return SetupService.GetOfficialBotTelegram();
    },
  },

  watch: {},

  created() {
    if (this.telegram) {
      this.telegram_enable = this.telegram.enable;
      this.telegram_channel = this.telegram.channel;
      this.telegram_lock = !!this.telegram.channel;
    } else {
      this.telegram_lock = false;
    }
  },
  mounted() {},

  methods: {
    //――――――――――――――――――――――― Set bot config ―――――――――――――――――――――――

    saveBot(driver, channel, enable) {
      this.busy = true;

      axios
        .post(window.CAPI.POST_COMMUNITY_BOTS_EDIT(this.community.id, driver), {
          channel: channel,
          enable: enable,
        })
        .then(({ data }) => {
          if (!data.error) {
            this.community.bots = data.bots;
            this.$emit("update:bot", data.bot);

            NotificationService.showSuccessAlert();
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
