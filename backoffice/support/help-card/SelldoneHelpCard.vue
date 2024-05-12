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
  <v-card
    v-if="!error"
    :class="{
      small: small,
    }"
    :max-width="maxWidth"
    :target="target"
    :to="
      current_help
        ? {
            name: 'OPageHelp',
            params: { help_id: current_help.id },
          }
        : null
    "
    class="blog-card mx-auto text-start"
  >
    <div v-if="current_help">
      <v-img
        v-if="current_help.article.image"
        :height="small ? 140 : 240"
        :src="current_help.article.image"
        class="blog-card-header"
      >
      </v-img>

      <v-card-title class="title-blog">
        {{ current_help.article.title }}
      </v-card-title>
    </div>

    <v-skeleton-loader
      v-else
      :max-width="maxWidth"
      min-width="320"
      type="card"
    ></v-skeleton-loader>
  </v-card>
</template>

<script>
export default {
  name: "SelldoneHelpCard",
  props: {
    help: {},
    autoFetch: { type: Boolean, default: false },
    helpId: {},

    maxWidth: {
      default: 400,
    },
    small: { type: Boolean, default: false },

    target: {},
  },

  data: () => ({
    fetched_help: null,
    error: false,
  }),

  computed: {
    current_help() {
      return this.autoFetch ? this.fetched_help : this.blog;
    },
  },

  watch: {
    helpId(helpId) {
      this.fetched_help = null;

      if (!this.autoFetch || !helpId) return;
      this.fetchHelp();
    },
  },

  created() {
    if (this.autoFetch && this.helpId) {
      this.fetchHelp();
    }
  },

  methods: {
    fetchHelp() {
      axios
        .get(window.GAPI.GET_HELP_DIGEST(this.helpId))
        .then(({ data }) => {
          if (!data.error) {
            this.fetched_help = { article: data.article, id: this.helpId };
            this.$emit("update:help", this.fetched_help);
          } else {
            //  this.showErrorAlert(null, data.error_msg);
            this.error = true;
          }
        })

        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {});
    },
  },
};
</script>

<style lang="scss" scoped></style>
