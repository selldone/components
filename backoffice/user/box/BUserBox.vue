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
  <div v-if="user" class="d-flex align-center py-1 text-start">
    <v-avatar
      :size="small ? 32 : 42"
      class="hover-scale m-2 avatar-gradient -thin"
    >
      <img :src="getUserAvatar(user.id)" />
    </v-avatar>

    <div class="flex-grow-1">
      <b class="single-line"
        >{{ user.name }}
        <v-icon v-if="user.verified" class="ms-1" color="blue" size="small"
          >verified
        </v-icon>
        <v-icon
          v-if="user.ban"
          :title="`User banned for ${user.ban}`"
          class="ms-1"
          color="red"
          >block
        </v-icon>
        <v-icon
          v-if="user.block_at"
          :title="`Blocked by system at ${getFromNowString(
            user.block_at,
          )} for ${user.block_hours} hours!`"
          class="ms-1"
          color="red"
        >
          crisis_alert
        </v-icon>
      </b>

      <v-row
        v-if="user.email || user.phone"
        :class="{ 'my-1': !small }"
        class="small"
        no-gutters
      >
        <div class="flex-grow-1">
          <span v-copy class="py-1" @click.stop>{{ user.email }}</span>
        </div>
        <div v-if="user.phone" class="flex-grow-1">
          <span v-copy class="py-1" @click.stop>{{ user.phone }}</span>
          <u-button-whatsapp
            :user="user"
            class="ms-2"
            small
          ></u-button-whatsapp>
        </div>
      </v-row>
    </div>
  </div>
  <div v-else-if="user?.deleted_at" class="text-red font-weight-bold small">
    <v-icon class="me-1" color="red" size="small">warning</v-icon>
    Deleted!
  </div>
  <small v-else>Not set!</small>
</template>

<script>
import UButtonWhatsapp from "../../../ui/button/whatsapp/UButtonWhatsapp.vue";
import { RouteMixin } from "../../../mixin/RouteMixin";

export default {
  name: "BUserBox",
  mixins: [RouteMixin],

  components: { UButtonWhatsapp },
  props: {
    user: {},
    small: Boolean,
  },
  methods: {},
};
</script>

<style scoped></style>
