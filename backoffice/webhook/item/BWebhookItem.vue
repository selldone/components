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
  <div class="d-flex align-center p-2 bg-white mnh56">
    <v-icon class="me-1">{{ getIcon(webhook.type) }}</v-icon>

    <div class="flex-grow-1 overflow-hidden">
      <span class="single-line d-block">{{ webhook.url }}</span>

      <div>
        <small
          >{{ webhook.type }}
          <span title="Create date"
            >({{ getFromNowString(webhook.created_at) }})</span
          ></small
        >
        <b
          v-if="webhook.fails > 0"
          class="mx-2 text-red small"
          title="Webhook auto-inactivated after 100 fails and needs manually reset."
        >
          <v-icon class="me-1" color="red" size="small">report</v-icon>
          {{ webhook.fails }} fails
          {{ webhook.fails >= 100 ? " Inactive - Please reset" : "" }}</b
        >
      </div>
    </div>

    <v-btn
      :title="$t('global.actions.edit')"
      class="mx-1"
      icon
      variant="text"
      @click.stop="$emit('click:edit', webhook)"
    >
      <v-icon size="small">edit</v-icon>
      <v-tooltip activator="parent" location="bottom">Edit webhook.</v-tooltip>
    </v-btn>
    <v-btn
      :loading="loadingDelete"
      :title="$t('global.actions.delete')"
      color="red"
      icon
      variant="text"
      @click.stop="$emit('click:delete', webhook)"
    >
      <v-icon>close</v-icon>
    </v-btn>
  </div>
</template>

<script lang="ts">
import WebhookTypes from "@selldone/core-js/enums/webhook/WebhookTypes";

export default {
  name: "BWebhookItem",
  components: {},
  props: {
    webhook: {
      required: true,
      type: Object,
    },

    loadingDelete: {
      default: false,
      type: Boolean,
    },
  },
  data: () => ({}),

  computed: {},

  created() {},

  mounted() {},
  methods: {
    getIcon(type) {
      if (type === WebhookTypes.Inventory.code) {
        return "precision_manufacturing";
      } else if (type === WebhookTypes.OnlineOrder.code) {
        return "shopping_cart";
      } else if (type === WebhookTypes.PosOrder.code) {
        return "shopping_bag";
      } else if (type === WebhookTypes.AvocadoOrder.code) {
        return "commit";
      } else if (type === WebhookTypes.HyperOrder.code) {
        return "qr_code_scanner";
      } else if (type === WebhookTypes.FulfillmentOrder.code) {
        return "join_full";
      } else if (type === WebhookTypes.Register.code) {
        return "person_add";
      } else if (type === WebhookTypes.Leave.code) {
        return "person_remove";
      }
    },
  },
};
</script>
