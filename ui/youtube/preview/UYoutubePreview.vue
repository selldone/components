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
  <div v-if="is_valid" :class="{ 'u-youtube-preview--modern text-start': modern }">
    <div v-if="modern" class="u-youtube-preview__row" :aria-label="$t('add_product.images_modern.youtube_preview')">
      <u-avatar-folder
        :src="thumbnail_url"
        :size="48"
        is-red
        side-icon="smart_display"
        placeholder-icon="smart_display"
        elevated
      />
      <div class="u-youtube-preview__identity">
        <p class="u-youtube-preview__title">{{ title || videoId }}</p>
        <p class="u-youtube-preview__author">{{ author_name || $t('add_product.images_modern.youtube_preview') }}</p>
      </div>
      <v-btn
        :href="`https://www.youtube.com/watch?v=${videoId}`"
        target="_blank"
        rel="noopener noreferrer"
        icon
        variant="text"
        class="sd-modern-icon-button u-youtube-preview__open"
        :aria-label="$t('add_product.images_modern.youtube_view')"
      >
        <v-icon icon="north_east" size="16" aria-hidden="true" />
        <v-tooltip
          activator="parent"
          :text="$t('add_product.images_modern.youtube_open')"
          location="top"
          :open-on-focus="true"
          content-class="sd-modern-tooltip text-start"
        />
      </v-btn>
    </div>
    <v-list-item v-else>
      <template v-slot:prepend>
        <u-avatar-folder :src="thumbnail_url" is-red side-icon="smart_display" elevated>
        </u-avatar-folder>
      </template>

      <v-list-item-title class="font-weight-bold">
        {{ title }}
      </v-list-item-title>
      <v-list-item-subtitle>
        {{ author_name }}
      </v-list-item-subtitle>

      <template v-slot:append>
        <v-list-item-action end>
          <v-btn
            :href="`https://www.youtube.com/watch?v=${videoId}`"
            icon
            target="_blank"
            title="View video on youtube."
            variant="text"
          >
            <v-icon size="small">open_in_new</v-icon>
          </v-btn>
        </v-list-item-action>
      </template>
    </v-list-item>
  </div>
</template>

<script lang="ts">
import UAvatarFolder from "../../../ui/avatar/folder/UAvatarFolder.vue";

export default {
  name: "UYoutubePreview",
  components: { UAvatarFolder },
  props: {
    modern: {
      type: Boolean,
      default: false,
    },
    videoId: {
      required: false,
    },
  },

  data: () => ({
    busy: false,
    title: null,
    author_name: null,
    author_url: null,
    thumbnail_url: null,
    requestId: 0,
  }),

  computed: {
    is_valid() {
      return /^[a-zA-Z0-9_-]{11}$/.test(this.videoId);
    },
  },
  watch: {
    videoId() {
      this.fetch();
    },
  },
  created() {
    this.fetch();
  },
  beforeUnmount() {
    this.requestId++;
  },

  methods: {
    fetch() {
      // Clear metadata without resetting the request identity used by older callbacks.
      const requestId = ++this.requestId;
      this.busy = false;
      this.title = null;
      this.author_name = null;
      this.author_url = null;
      this.thumbnail_url = null;

      if (!this.is_valid) return;

      this.busy = true;

      const videoUrl = `https://www.youtube.com/watch?v=${this.videoId}`;
      $.ajax({
        url: `https://www.youtube.com/oembed?url=${videoUrl}&format=json`,
        method: "GET",
        dataType: "json",
        success: (data) => {
          if (requestId !== this.requestId) return;
          const { title, author_name, author_url, thumbnail_url } = data;
          this.title = title;
          this.author_name = author_name;
          this.author_url = author_url;
          this.thumbnail_url = thumbnail_url;
        },
        error: (error) => {
          if (requestId !== this.requestId) return;
          console.error(error);
        },
        complete: () => {
          if (requestId !== this.requestId) return;
          this.busy = false;
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.u-youtube-preview--modern {
  min-width: 0;

  .u-youtube-preview__row {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }

  .u-youtube-preview__identity {
    flex: 1;
    min-width: 0;
  }

  .u-youtube-preview__title,
  .u-youtube-preview__author {
    margin: 0;
    overflow-wrap: anywhere;
  }

  .u-youtube-preview__title {
    font-size: 13px;
    font-weight: 400;
    line-height: 20px;
  }

  .u-youtube-preview__author {
    margin-top: 3px;
    color: rgba(var(--v-theme-on-surface), 0.64);
    font-size: 12px;
    line-height: 19px;
  }

  .u-youtube-preview__open {
    flex-shrink: 0;
  }
}
</style>
