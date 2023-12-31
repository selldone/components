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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div class="s--breadcrumb-image">
    <v-breadcrumbs
      v-if="$vuetify.breakpoint.smAndUp"
      :items="hierarchyItems"
      divider="/"
      class="single-line overflow-auto thin-scroll"
      :class="{ 'flex-mode': flexMode }"
    >
      <template v-slot:item="{ item }">
        <router-link
          v-if="!item.disabled"
          :to="item.to"
          :replace="replace"
          :target="target"
        >
          <span class="font-weight-medium">
            <v-icon v-if="item.icon" class="me-1" :color="SaminInfoColor">{{
              item.icon
            }}</v-icon>
            <circle-image
              v-if="item.image"
              :src="getShopImagePath(item.image, IMAGE_SIZE_SMALL)"
              :size="imageSize"
              scale-on-hover
              class="me-1"
            />

            <span class="link-dash" :title="item.text">{{
              item.text?.limitWords(4)
            }}</span>
          </span>
        </router-link>
        <span v-else class="font-weight-medium" :title="item.text">
          <circle-image
            v-if="item.image"
            :src="getShopImagePath(item.image, IMAGE_SIZE_SMALL)"
            :size="imageSize"
            scale-on-hover
            class="me-1"
          />

          {{ item.text?.limitWords(4) }}</span
        >
      </template>
    </v-breadcrumbs>

    <!--  Small screen -->
    <v-expand-transition v-else>
      <div v-if="hierarchyItems.length > 1">
        <v-btn text @click="dialog = true" class="w-100" x-large>
          {{ $t("global.commons.category") }}
          <v-icon class="ms-1" x-small>expand_more</v-icon>
        </v-btn>
      </div>
    </v-expand-transition>

    <v-bottom-sheet
      v-if="!$vuetify.breakpoint.smAndUp"
      v-model="dialog"
      max-width="98vw"
      width="480"
      content-class="rounded-t-xl"
      inset
      scrollable
    >
      <v-card rounded="t-xl" min-height="40vh">
        <v-card-text class="pb-16">
          <v-list class="text-start">
            <v-list-item
              selectable
              v-for="(item, i) in hierarchyItems"
              :key="i"
              :to="item.disabled ? undefined : item.to"
              exact
              @click="dialog = false"
            >
              <v-list-item-avatar :tile="!!item.icon">
                <img
                  v-if="item.image"
                  :src="getShopImagePath(item.image, IMAGE_SIZE_SMALL)"
                />
                <v-icon v-else-if="item.icon" class="me-1">{{
                  item.icon
                }}</v-icon>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title>{{ item.text }} </v-list-item-title>
                <v-list-item-subtitle>
                  <v-chip
                    v-if="i === hierarchyItems.length - 1"
                    label
                    color="#111"
                    dark
                    x-small
                    >{{ $t("global.commons.current") }}</v-chip
                  >
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script>
import CircleImage from "@components/ui/image/CircleImage.vue";
export default {
  name: "SBreadcrumbImage",
  components: { CircleImage },
  props: {
    hierarchyItems: {
      required: true,
      type: Array,
    },
    // Target tab : _blank or  ...
    target: {
      required: false,
      type: String,
    },
    replace: {
      default: false,
      type: Boolean,
    },
    imageSize: {
      default: 20,
    },
    flexMode: {
      default: false,
      type: Boolean,
    },
  },
  data: function () {
    return {
      dialog: false,
    };
  },
};
</script>

<style scoped lang="scss">
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */
.s--breadcrumb-image {
}
/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */

.s--breadcrumb-image {
  width: 100%;
  display: block;
  position: relative;
  min-width: 84px;
  text-align: start;

  .flex-mode {
    // Show overflow, auto adjust
    display: flex;
    overflow: visible !important;
  }
}
</style>
