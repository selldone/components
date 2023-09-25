<template>
  <v-container
    class="text-start"
    :class="{ 'pointer-event-none': community && !access.admin }"
  >
    <div class="widget-box">
      <widget-header title="Telegram channel" icon="fab fa-telegram">
      </widget-header>

      <p dir="ltr" class="mt-3">
        Auto publish post on your Telegram channel. <br />

        1. add <b>@{{ official_telegram_bot }}</b> bot to
        <b>your channel</b> and set send post permission. <br />
        2. Past your <b>channel name</b> here and click <b>save</b>.
      </p>
      <p dir="ltr" v-if="telegram && telegram.errors">
        Send errors: <b class="text-danger">{{ telegram.errors }}</b> / limit is
        30! System auto disable the publishing if your bot reach this limit. If
        this happen you should re-enable it manually.
      </p>
      <v-alert
        v-if="telegram && !telegram.enable"
        color="red"
        type="error"
        border="left"
      >
        Telegram bot disabled to publish on this channel! Check your channel
        name and set the channel again.
      </v-alert>

      <v-switch
        v-model="telegram_enable"
        :label="telegram_enable ? 'Enable' : 'Disable'"
        messages="Publish on the telegram channel"
        color="success"
        class="mb-3"
      ></v-switch>

      <v-text-field
        v-model="telegram_channel"
        label="Telegram channel"
        placeholder="Your channel name without @..."
        messages="Past your channel name here"
        :prepend-inner-icon="telegram_lock ? 'lock' : 'lock_open'"
        @click:prepend-inner="telegram_lock = !telegram_lock"
        :readonly="telegram_lock"
        prefix="@"
      >
      </v-text-field>

      <div class="widget-buttons">
        <v-btn
          x-large
          color="primary"
          @click="saveBot('Telegram', telegram_channel, telegram_enable)"
          :loading="busy"
          :disabled="!telegram_channel"
        >
          <v-icon class="me-1">save</v-icon>
          {{ $t("global.actions.save") }}
        </v-btn>
      </div>
    </div>
  </v-container>
</template>

<script>
import SetupService from "../../../../../core/server/SetupService";

export default {
  name: "CommunityBotsEdit",
  components: {  },

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

            this.showSuccessAlert();
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },
  },
};
</script>

<style scoped lang="scss"></style>
