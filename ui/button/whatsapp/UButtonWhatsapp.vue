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
  <v-tooltip
    v-if="modern && user.phone"
    location="top"
    content-class="sd-modern-tooltip text-start"
    :max-width="320"
    :open-on-hover="true"
    :open-on-focus="true"
    :persistent="false"
  >
    <template #activator="{ props }">
      <v-btn
        :href="link"
        class="sd-modern-icon-button"
        size="default"
        icon
        target="_blank"
        v-bind="props"
        variant="text"
        :aria-label="
          $t('global.instance_message_title') +
          ' · ' +
          $t('global.social_network.whatsapp')
        "
        @click.stop
      >
        <img
          height="18"
          width="18"
          src="../../../assets/trademark/whatsapp.svg"
          alt=""
        />
      </v-btn>
    </template>
    <div class="sd-modern-tooltip__title">
      {{ $t("global.instance_message_title") }} ·
      {{ $t("global.social_network.whatsapp") }}
    </div>
    <div class="mb-2">
      <v-icon class="me-1" size="small">phone</v-icon>
      {{ user.phone }}
    </div>
    <div>
      <v-icon class="me-1" size="small">message</v-icon>
      {{ message }}
    </div>
  </v-tooltip>
  <v-menu
    v-else-if="!modern"
    content-class="bg-black pa-4 rounded-xl text-start"
    max-width="240"
    open-on-hover
  >
    <template v-slot:activator="{ props }">
      <v-btn
        v-if="user.phone"
        :href="link"
        :size="xSmall ? 24 : small ? 28 : 30"
        icon
        target="_blank"
        v-bind="props"
        variant="text"
        @click.stop
        aria-label="Call"
        class="ms-1"
        ><img
          :height="xSmall ? 12 : small ? 18 : 20"
          :width="xSmall ? 12 : small ? 18 : 20"
          src="../../../assets/trademark/whatsapp.svg"
          alt="WhatsApp"
      /></v-btn>
    </template>
    <div class="mb-3 small">{{ $t("global.instance_message_title") }}:</div>
    <div class="mb-2">
      <v-icon class="me-1" size="small">phone</v-icon>

      {{ user.phone }}
    </div>
    <div class="small">
      <v-icon class="me-1" size="small">message</v-icon>
      {{ message }}
    </div>
  </v-menu>
</template>

<script lang="ts">
import {
  CreateSocialConnectLink,
  SocialNetwork,
} from "@selldone/core-js/enums/social/SocialNetwork";

export default {
  name: "UButtonWhatsapp",
  props: {
    user: {
      required: true,
      type: Object,
    },
    shop: {},
    modern: {
      type: Boolean,
      default: false,
    },
    small: {
      type: Boolean,
      default: false,
    },
    xSmall: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    message() {
      return this.$t("global.instance_message", {
        name: this.user.name,
        author: this.USER() ? this.USER().name : "",
        company: this.shop ? this.shop.title : this.$t("global.selldone"),
      });
    },
    link() {
      return CreateSocialConnectLink(
        SocialNetwork.WhatsApp.code,
        this.user.phone,
        {
          text: this.message,
        },
      );
    },
  },
};
</script>

<style scoped></style>
