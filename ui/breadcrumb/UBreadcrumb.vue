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
      v-if="$vuetify.display.smAndUp"
      :class="{ 'flex-mode': flexMode }"
      :items="hierarchyItems"
      class="single-line overflow-auto thin-scroll"
      divider="/"
    >
      <template v-slot:item="{ item }">
        <router-link
          v-if="!item.disabled"
          :replace="replace"
          :target="target"
          :to="item.to"
        >
          <span class="font-weight-medium">
            <v-icon v-if="item.icon" :color="SaminInfoColor" class="me-1">{{
              item.icon
            }}</v-icon>
            <circle-image
              v-if="item.image"
              :size="imageSize"
              :src="getShopImagePath(item.image, IMAGE_SIZE_SMALL)"
              class="me-1"
              scale-on-hover
            />

            <span :title="item.text" class="link-dash">{{
              item.text?.limitWords(4)
            }}</span>
          </span>
        </router-link>
        <span v-else :title="item.text" class="font-weight-medium">
          <circle-image
            v-if="item.image"
            :size="imageSize"
            :src="getShopImagePath(item.image, IMAGE_SIZE_SMALL)"
            class="me-1"
            scale-on-hover
          />

          {{ item.text?.limitWords(4) }}</span
        >
      </template>
    </v-breadcrumbs>

    <!--  Small screen -->
    <div v-else-if="hierarchyItems.length > 0">
      <v-btn class="w-100" size="x-large" variant="text" @click="dialog = true">
        {{ $t("global.commons.category") }}
        <v-icon class="ms-1" size="x-small">expand_more</v-icon>
      </v-btn>
    </div>

    <v-bottom-sheet
      v-if="!$vuetify.display.smAndUp"
      v-model="dialog"
      content-class="rounded-t-xl"
      inset
      max-width="98vw"
      scrollable
      width="480"
    >
      <v-card min-height="40vh" rounded="t-xl">
        <v-card-text class="pb-16">
          <v-list class="text-start">
            <v-list-item
              v-for="(item, i) in hierarchyItems"
              :key="i"
              :to="item.disabled ? undefined : item.to"
              exact
              @click="dialog = false"
            >
              <template v-slot:prepend>
                <v-avatar :tile="!!item.icon">
                  <img
                    v-if="item.image"
                    :src="getShopImagePath(item.image, IMAGE_SIZE_SMALL)"
                  />
                  <v-icon v-else-if="item.icon" class="me-1"
                    >{{ item.icon }}
                  </v-icon>
                </v-avatar>
              </template>

              <v-list-item-title>{{ item.text }}</v-list-item-title>
              <v-list-item-subtitle>
                <v-chip
                  v-if="i === hierarchyItems.length - 1"
                  color="#111"
                  label
                  size="x-small"
                  >{{ $t("global.commons.current") }}
                </v-chip>
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script>
import CircleImage from "../../ui/image/CircleImage.vue";

export default {
  name: "UBreadcrumb",
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

<style lang="scss" scoped>
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
