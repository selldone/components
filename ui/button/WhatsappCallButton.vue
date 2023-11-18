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
  <span>
    <v-menu offset-y open-on-hover max-width="240" rounded="xl">
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          v-if="user.phone"
          icon
          :href="link"
          target="_blank"
          @click.stop
          v-bind="attrs"
          v-on="on"
          :small="small"
          :x-small="xSmall"
          ><img
            src="@components/assets/tradmark/whatsapp.svg"
            :height="xSmall?12:small ? 18 : 20"
            :width="xSmall?12:small ? 18 : 20"
        /></v-btn>
      </template>
      <v-sheet dark class="text-start p-4">
        <div class="mb-3 small">{{ $t("global.instance_message_title") }}:</div>
        <div class="mb-2">
          <v-icon small class="me-1">phone</v-icon>

          {{ user.phone }}
        </div>
        <v-icon small class="me-1">message</v-icon>
        {{ message }}
      </v-sheet>
    </v-menu>
  </span>
</template>

<script>
import { CreateSocialConnectLink, SocialNetwork } from "../../../../core/enums/social/SocialNetwork";

export default {
  name: "WhatsappCallButton",
  props: {
    user: {
      required: true,
      type: Object,
    },
    shop: {},
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
        author: this.USER()?this.USER().name:'',
        company: this.shop ? this.shop.title : this.$t("global.selldone"),
      });
    },
    link() {
      return CreateSocialConnectLink(
        SocialNetwork.WhatsApp.code,
        this.user.phone,
        {
          text: this.message,
        }
      );
    },
  },
};
</script>

<style scoped></style>
