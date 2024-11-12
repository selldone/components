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
  <v-col
    class="c-container -force-rounded position-relative border-top-thick -amber"
    cols="12"
  >
    <div class="bg-white z2 c-widget p-3">
      <h2 class="text-uppercase">Subscribe to continue</h2>
      <p>
        Do you want to access the contents of this topic? So buy this membership
        right now.
      </p>

      <div class="d-flex border-between text-center my-2">
        <div class="w-50 p-1">
          <span class="d-block">Duration</span>
          <span class="d-block text-h4"
            ><span class="small">{{ $t(subscription.name) }}</span></span
          >
        </div>
        <div class="w-50 p-1">
          <span class="d-block">Price</span>
          <u-price
            :amount="topic.price"
            :currency="topic.currency"
            x-large
          ></u-price>
        </div>
        <div v-if="trial" class="w-50 p-1">
          <span class="d-block">Trial</span>

          <span class="d-block text-h4"
            >{{ trial.days }} <span class="small">days</span></span
          >
        </div>
      </div>
      <!-- Subscriber statistics -->
      <div v-if="access.admin" class="d-flex text-center my-2">
        <div class="w-50">
          <span class="d-block">Subscribers</span>
          <span class="d-block text-h4">{{ topic.total_subscribers }} </span>
        </div>
        <div class="w-50">
          <span class="d-block">Total sells</span>
          <span class="d-block text-h4">{{ topic.total_sells }} </span>
        </div>
      </div>

      <div class="d-flex justify-end">
        <v-btn
          class="m-2"
          color="success"
          size="x-large"
          variant="flat"
          @click="subscribe()"
          >Subscribe now just for
          <u-price
            :amount="topic.price"
            :currency="topic.currency"
            class="ms-2"
          ></u-price>
        </v-btn>
      </div>
    </div>
  </v-col>
</template>

<script lang="ts">
import { CommunityTopic } from "@selldone/core-js";
import AuthMixin from "@selldone/components-vue/mixin/auth/AuthMixin.ts";

export default {
  name: "CommunityTopicSubscribe",
  mixins: [AuthMixin],

  components: {},
  props: {
    community: {
      required: true,
      type: Object,
    },
    topic: {
      required: true,
      type: Object,
    },
  },

  data() {
    return {};
  },

  computed: {
    access() {
      return this.community.access;
    },

    trial() {
      if (!this.topic.trial) return null;
      return CommunityTopic.TrialTypes[this.topic.trial];
    },
    subscription() {
      return CommunityTopic.SubscriptionTypes[this.topic.subscription];
    },
  },

  methods: {
    //――――――――――――――――――――――― Subscribe ―――――――――――――――――――――――
    subscribe() {
      if (!this.USER()) {
        this.NeedLogin();
        return;
      }
    },
  },
};
</script>

<style lang="scss" scoped></style>
