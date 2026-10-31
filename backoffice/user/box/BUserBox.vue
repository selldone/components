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
  <div v-if="modern && user" class="b-user-box--modern text-start">
    <div class="b-user-box__identity">
      <v-avatar
        :size="25"
        class="hover-scale avatar-gradient -thin"
        :class="avatarClass"
      >
        <v-img :src="getUserAvatar(user.id)" />
      </v-avatar>
      <span class="b-user-box__name">{{ user.name }}</span>
      <v-tooltip
        v-if="user.verified"
        location="top"
        content-class="sd-modern-tooltip text-start"
        open-on-hover
        open-on-focus
        open-on-click
        :persistent="false"
      >
        <template #activator="{ props }">
          <button
            v-bind="props"
            type="button"
            class="b-user-box__verified no-inv"
            :aria-label="$t('global.commons.verified_user')"
            @click.stop
          >
            <v-icon size="13" aria-hidden="true">verified</v-icon>
          </button>
        </template>
        {{ $t("global.commons.verified_user") }}
      </v-tooltip>
      <v-icon
        v-if="user.ban"
        :title="`User banned for ${user.ban}`"
        color="red"
        size="small"
        >block</v-icon
      >
      <v-icon
        v-if="user.block_at"
        :title="`Blocked by system at ${getFromNowString(
          user.block_at,
        )} for ${user.block_hours} hours!`"
        color="red"
        size="small"
        >crisis_alert</v-icon
      >
    </div>
    <div v-if="user.email" class="b-user-box__contact">
      <button
        v-copy
        type="button"
        class="b-user-box__value"
        :aria-label="
          $t('global.actions.copy') +
          ' ' +
          $t('global.commons.email') +
          ': ' +
          user.email
        "
        @click.stop
      >
        <bdi>{{ user.email }}</bdi>
      </button>
    </div>
    <div v-if="user.phone" class="b-user-box__contact">
      <button
        v-copy
        type="button"
        class="b-user-box__value"
        :aria-label="
          $t('global.actions.copy') +
          ' ' +
          $t('global.commons.phone') +
          ': ' +
          user.phone
        "
        @click.stop
      >
        <bdi>{{ user.phone }}</bdi>
      </button>
      <v-tooltip
        location="top"
        content-class="sd-modern-tooltip text-start"
        open-on-hover
        open-on-focus
        :persistent="false"
      >
        <template #activator="{ props }">
          <a
            v-bind="props"
            :href="'tel:' + user.phone"
            class="sd-modern-icon-button"
            :aria-label="$t('global.actions.call') + ' ' + user.phone"
            @click.stop
          >
            <v-icon size="16" aria-hidden="true">call</v-icon>
          </a>
        </template>
        {{ $t("global.actions.call") }} <bdi>{{ user.phone }}</bdi>
      </v-tooltip>
      <u-button-whatsapp :user="user" modern />
    </div>
  </div>
  <div v-else-if="user" class="d-flex align-center py-1 text-start">
    <v-avatar
      :size="small ? 32 : 42"
      class="hover-scale m-2 avatar-gradient -thin"
      :class="avatarClass"
    >
      <v-img :src="getUserAvatar(user.id)" />
    </v-avatar>

    <div class="flex-grow-1">
      <b class="single-line"
        ><span class="b-user-box__name">{{ user.name }}</span>
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

<script lang="ts">
import UButtonWhatsapp from "../../../ui/button/whatsapp/UButtonWhatsapp.vue";
import { RouteMixin } from "../../../mixin/route/RouteMixin.ts";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";

export default {
  name: "BUserBox",
  mixins: [RouteMixin, DateMixin],

  components: { UButtonWhatsapp },
  props: {
    user: {},
    modern: { type: Boolean, default: false },
    small: Boolean,
    avatarClass: {},
  },
  methods: {},
};
</script>

<style scoped lang="scss">
.b-user-box--modern {
  --sd-modern-icon-button-size: 32px;
  min-width: 0;

  .sd-modern-icon-button:focus-visible,
  .b-user-box__value:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 2px;
  }

  .b-user-box__identity {
    display: flex;
    align-items: center;
    gap: 7px;
    min-width: 0;
  }

  .b-user-box__name {
    min-width: 0;
    overflow-wrap: anywhere;
    font-size: 12px;
    font-weight: 400;
    line-height: 18px;
  }

  .b-user-box__verified {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 24px;
    width: 24px;
    height: 24px;
    padding: 0;
    border: 0;
    border-radius: 5px;
    color: rgb(var(--v-theme-primary));
    background: transparent;

    &:focus-visible {
      outline: 2px solid rgb(var(--v-theme-primary));
      outline-offset: 2px;
    }
  }

  .b-user-box__contact {
    display: flex;
    align-items: center;
    gap: 5px;
    min-width: 0;
    margin-block-start: 3px;
    color: var(--sd-modern-muted, rgba(var(--v-theme-on-surface), 0.66));
    font-size: 11px;
    font-weight: 400;
    line-height: 17px;
  }

  .b-user-box__value {
    min-width: 0;
    padding: 0;
    border: 0;
    color: inherit;
    background: transparent;
    font: inherit;
    letter-spacing: normal;
    text-transform: none;
    text-align: start;
    overflow-wrap: anywhere;
    cursor: pointer;
  }
}

@media (max-width: 599px), (pointer: coarse) {
  .b-user-box--modern .b-user-box__value {
    min-height: 44px;
  }

  .b-user-box--modern .b-user-box__verified {
    flex-basis: 44px;
    width: 44px;
    height: 44px;
  }
}
</style>
