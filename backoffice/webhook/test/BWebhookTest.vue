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
  <div class="widget-box mb-5">
    <u-widget-header
      :add-loading="busy"
      add-caption="Send test data"
      icon="science"
      title="Test lab"
      @click:add="sendTest()"
    >
    </u-widget-header>

    <div
      :class="{ 'stop-animations': !busy }"
      class="d-flex align-center my-5 mx-3"
    >
      <div class="pod">
        <v-icon :color="busy ? 'amber' : '#111'" class="mb-1" size="24"
          >{{ busy ? "bolt" : webhook_obj.icon }}
        </v-icon>
        <small>{{ webhook_obj.title }}</small>
      </div>

      <div class="flex-grow-1 sph">
        <span class="dot -reverse"></span>
      </div>

      <div class="pod">
        <v-icon class="mb-1" color="#111" size="24">dns</v-icon>

        <small :title="webhook.url"
          >...{{ webhook.url.substring(webhook.url.length - 8) }}</small
        >
      </div>
    </div>

    <v-select
      v-if="webhook_obj.actions"
      v-model="action"
      :items="actions"
      label="Action"
      messages="Action is the cause of firing the event. The request structures are the same for all actions in an event."
      variant="underlined"
    ></v-select>

    <v-expand-transition>
      <div v-if="response">
        <s-json-table :value="response" dense json-enable></s-json-table>
      </div>
    </v-expand-transition>
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import WebhookTypes from "@selldone/core-js/enums/webhook/WebhookTypes";
import SJsonTable from "../../../ui/json/table/SJsonTable.vue";


export default {
  name: "BWebhookTest",
  mixins: [],

  components: { SJsonTable },
  props: {
    webhook: { required: true },
  },
  data: () => ({
    busy: false,
    response: null,
    action: null,
  }),

  computed: {
    webhook_obj() {
      return WebhookTypes[this.webhook.type];
    },
    actions() {
      return this.webhook_obj.actions;
    },
  },

  watch: {
    actions(actions) {
      this.action = actions ? actions[0] : null;
    },
  },

  created() {
    this.action = this.actions ? this.actions[0] : null;
  },

  methods: {
    sendTest() {
      this.busy = true;
      this.response = null;
      axios
        .post(
          window.API.POST_SHOP_WEBHOOK_TEST(
            this.webhook.shop_id,
            this.webhook.id,
          ),
          {
            action: this.action,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.response = data.response;
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

<style scoped></style>
