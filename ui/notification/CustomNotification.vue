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
    class="custom-notification p-2 fadeInUpBig"
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
  >
    <v-img
      v-if="notification.image"
      :src="getShopImagePath(notification.image)"
      height="96"
      class="mx-auto my-2"
      contain
    ></v-img>
    <p
      v-if="notification.title"
      class="dialog-title mx-2 mt-2 text-center font-weight-black"
      v-html="notification.title"
    ></p>
    <p
      class="text-start mx-2"
      :style="{
        'padding-left': notification.radius + 'px',
        'padding-right': notification.radius + 'px',
      }"
      v-html="notification.message"
    ></p>
    <v-spacer></v-spacer>

    <div>
      <div class="widget-buttons">
        <v-btn
          depressed
          :color="notification.text_color"
          text
          class="m-2"
          @click="close()"
        >
          {{ $t("global.actions.close") }}
        </v-btn>

        <v-btn
          :url="notification.url"
          v-if="notification.action"
          :href="testMode ? null : notification.url"
          :to="
            pageName && !notification.url && !testMode
              ? { name: 'PageRender', params: { page_name: pageName } }
              : null
          "
          :target="preview || !pageName ? '_blank' : ''"
          depressed
          large
          :color="notification.btn_color ? notification.btn_color : undefined"
          class="m-2"
          v-html="notification.action"
          @click="close()"
          :style="{
            color: notification.btn_text_color
              ? notification.btn_text_color
              : undefined,
          }"
        >
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
import { LocalStorages } from "../../../../core/helper/local-storage/LocalStorages";

export default {
  name: "CustomNotification",
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
          LocalStorages.GetShopNotificationViewed(
            this.$localstorage_base_path()
          )
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
          LocalStorages.GetShopNotificationViewed(
            this.$localstorage_base_path()
          ),
          "true"
        );
      }
    },
  },
};
</script>

<style scoped lang="scss">
.custom-notification {
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
