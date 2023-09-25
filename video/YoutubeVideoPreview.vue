<template>
  <div v-if="is_valid">
    <v-list-item>
      <v-list-item-avatar rounded>
        <v-img :src="thumbnail_url"></v-img>
      </v-list-item-avatar>
      <v-list-item-content>
        <v-list-item-title class="font-weight-bold">
          {{ title }}
        </v-list-item-title>
        <v-list-item-subtitle>
          {{ author_name }}
        </v-list-item-subtitle>
      </v-list-item-content>
      <v-list-item-action>
        <v-btn :href="`https://www.youtube.com/watch?v=${videoId}`" target="_blank" title="View video on youtube." icon>
          <v-icon small>open_in_new</v-icon>
        </v-btn>
      </v-list-item-action>
    </v-list-item>
  </div>
</template>

<script>
export default {
  name: "YoutubeVideoPreview",
  components: {},
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
         this.resetToDefault();      // 🞇 Reset to default

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

<style scoped lang="scss"></style>
