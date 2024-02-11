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
  <div
    v-if="value && can_show"
    :class="{ preview: preview }"
    :style="{
      'background-image': notification.bg
        ? `url('${getShopImagePath(notification.bg)}`
        : null,
      'background-color': notification.color,
      color: notification.text_color,
      'border-radius': notification.radius + 'px',
      width: notification.width,
      height: notification.height,

      'animation-delay':
        (notification.delay && !testMode ? notification.delay : 0) + 's',
    }"
    class="s--storefront-campaign-notification p-2 fadeInUpBig"
  >
    <v-img
      v-if="notification.image"
      :src="getShopImagePath(notification.image)"
      class="mx-auto my-2"
      height="96"
    ></v-img>
    <p
      v-if="notification.title"
      class="dialog-title mx-2 mt-2 text-center font-weight-black"
      v-html="notification.title"
    ></p>
    <p
      :style="{
        'padding-left': notification.radius + 'px',
        'padding-right': notification.radius + 'px',
      }"
      class="text-start mx-2"
      v-html="notification.message"
    ></p>
    <v-spacer></v-spacer>

    <div>
      <div class="widget-buttons">
        <v-btn
          :color="notification.text_color"
          class="m-2"
          variant="text"
          @click="close()"
        >
          {{ $t("global.actions.close") }}
        </v-btn>

        <v-btn
          v-if="notification.action"
          :color="notification.btn_color ? notification.btn_color : undefined"
          :href="testMode ? null : notification.url"
          :style="{
            color: notification.btn_text_color
              ? notification.btn_text_color
              : undefined,
          }"
          :target="preview || !pageName ? '_blank' : ''"
          :to="
            pageName && !notification.url && !testMode
              ? {
                  name: window.$storefront.routes.PAGE_RENDER,
                  params: { page_name: pageName },
                }
              : null
          "
          :url="notification.url"
          class="m-2"
          size="large"
          variant="flat"
          @click="close()"
          v-html="notification.action"
        >
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
import { StorefrontLocalStorages } from "@core/helper/local-storage/StorefrontLocalStorages";

export default {
  name: "SStorefrontCampaignNotification",
  computed: {},
  props: {
    notification: {
      require: true,
      type: Object,
    },
    preview: {
      type: Boolean,
      default: false,
    },
    value: {
      type: Boolean,
      default: false,
    },
    pageName: {
      type: String,
    },
    testMode: {
      type: Boolean,
      default: false,
    },
    forceShow: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      can_show: true,
    };
  },
  created() {
    if (!this.forceShow && !this.preview && !this.notification.persist) {
      if (
        localStorage.getItem(
          StorefrontLocalStorages.GetShopNotificationViewed(
            this.$localstorage_base_path(),
          ),
        ) === "true"
      ) {
        this.can_show = false;
      }
    }
  },

  methods: {
    close() {
      this.$emit("input", false);

      if (!this.preview && !this.notification.persist) {
        localStorage.setItem(
          StorefrontLocalStorages.GetShopNotificationViewed(
            this.$localstorage_base_path(),
          ),
          "true",
        );
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.s--storefront-campaign-notification {
  filter: drop-shadow(3px 13px 11px rgba(0, 0, 0, 0.13));
  min-height: 200px;
  max-height: 100%;
  max-width: 100%;
  width: 320px;
  min-width: 240px;
  display: flex;
  flex-direction: column;

  background-repeat: no-repeat;
  background-size: cover;
  position: fixed;
  right: 8px;
  bottom: 48px;

  z-index: 999999;

  &.preview {
    position: initial;
    z-index: 1;
  }
}
</style>
