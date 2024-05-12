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
  <div v-if="is_valid">
    <v-list-item>
      <template v-slot:prepend>
        <u-avatar-folder :src="thumbnail_url" is-red side-icon="smart_display">
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

<script>
import UAvatarFolder from "../../../ui/avatar/folder/UAvatarFolder.vue";

export default {
  name: "UYoutubePreview",
  components: { UAvatarFolder },
  props: {
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

  methods: {
    fetch() {
      this.resetToDefault(); // 🞇 Reset to default

      if (!this.is_valid) return;

      this.busy = true;

      const videoUrl = `https://www.youtube.com/watch?v=${this.videoId}`;
      $.ajax({
        url: `https://www.youtube.com/oembed?url=${videoUrl}&format=json`,
        method: "GET",
        dataType: "json",
        success: (data) => {
          const { title, author_name, author_url, thumbnail_url } = data;
          this.title = title;
          this.author_name = author_name;
          this.author_url = author_url;
          this.thumbnail_url = thumbnail_url;
        },
        error: function (error) {
          console.error(error);
        },
        complete: function () {
          this.busy = false;
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped></style>
