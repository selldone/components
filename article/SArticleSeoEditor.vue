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
    :class="{ 'pointer-pointer': !opened }"
    class="s--article-seo-editor s--shadow-no-padding p-3"
    @click.stop="
      () => {
        if (!opened) openMenu();
      }
    "
  >
    <small class="absolute-top-end m-3 m-small" style="line-height: normal"
      >SEO</small
    >
    <v-btn
      v-if="opened"
      class="fadeIn absolute-top-start"
      icon
      size="small"
      variant="text"
      @click.stop="opened = false"
    >
      <v-icon size="small">close</v-icon>
    </v-btn>

    <div class="article-edit-form">
      <v-expand-transition>
        <div v-if="!opened" class="article-edit-placeholder d-flex text-start">
          <v-avatar class="rounded-18px" size="48">
            <v-img v-if="article.image" :src="article.image" cover></v-img>
            <v-icon v-else>image</v-icon>
          </v-avatar>
          <div
            class="text-subtitle-2 flex-grow-1 px-3"
            style="max-width: calc(100% - 80px)"
          >
            <b class="d-block single-line">{{ article.description }}</b>
            <small class="d-block my-1">
              {{ $t("global.article.edit_window.title") }}
              <span class="fas fa-chevron-down mx-2" />
            </small>
          </div>
        </div>
      </v-expand-transition>
      <v-expand-transition>
        <div v-if="opened" class="description-input pt-3">
          <form id="article-edit-form">
            <v-text-field
              v-model="slug"
              class="m-3 english-field"
              counter="128"
              label="URL"
              messages="Use a clear and short URL, You can change it without worrying about the link being broken."
              prepend-inner-icon="link"
              variant="underlined"
              @change="onChange()"
            >
              <template v-slot:append-inner>
                <score-indicator
                  :value="$SEO.GetPageURLScore(slug)"
                  class="mt-n1"
                ></score-indicator>
              </template>
            </v-text-field>

            <v-text-field
              v-model="page_title"
              class="m-3 english-field"
              counter="128"
              label="Page title"
              messages="Leave it empty to set the page title the same as the article title."
              prepend-inner-icon="arrow_right"
              variant="underlined"
              @change="onChange"
            >
              <template v-slot:append-inner>
                <score-indicator
                  :value="$SEO.GetPageTitleScore(page_title)"
                  class="mt-n1"
                ></score-indicator>
              </template>
            </v-text-field>

            <v-textarea
              v-model="description"
              :label="$t('global.article.edit_window.digest')"
              :rows="3"
              auto-grow
              class="m-3"
              counter="256"
              variant="underlined"
              @change="onChange"
            >
              <template v-slot:append-inner>
                <score-indicator
                  :value="$SEO.GetPageDescription(description)"
                  class="mt-n1"
                ></score-indicator>
              </template>
            </v-textarea>

            <v-slide-group
              v-if="hasImage"
              :model-value="coverImage"
              class="pa-4"
              mandatory
              selected-class="bg-success border-lg"
              show-arrows
              @update:model-value="onSelectImage"
            >
              <v-slide-group-item
                v-for="item in images"
                :key="item"
                v-slot="{ isSelected, toggle, selectedClass }"
                :value="item"
              >
                <v-card
                  :class="['ma-4', selectedClass]"
                  :image="item"
                  color="grey-lighten-1"
                  height="100"
                  rounded="xl"
                  width="100"
                  @click="toggle"
                >
                  <div class="d-flex fill-height align-center justify-center">
                    <v-scale-transition>
                      <v-icon
                        v-if="isSelected"
                        color="success"
                        icon="check_circle"
                        size="48"
                      ></v-icon>
                    </v-scale-transition>
                  </div>
                </v-card>
              </v-slide-group-item>
            </v-slide-group>
          </form>
        </div>
      </v-expand-transition>
    </div>
  </div>
</template>

<script>
import ScoreIndicator from "@components/ui/progress/score-indicator/ScoreIndicator.vue";

require("vue-select-image/dist/vue-select-image.css");

export default {
  name: "ArticleEdit",

  components: {
    ScoreIndicator,
  },
  emits: ["open-menu", "change"],
  props: {
    article: {
      required: true,
      type: Object,
    },
    images: {
      required: true,
      type: Array,
    },
  },

  data: function () {
    return {
      description: "",

      coverImage: "",
      slug: "",
      page_title: "",

      hasImage: false, // trigger images to show selected image correctly!
      opened: false,
    };
  },
  computed: {},
  watch: {
    images: function (newVal, oldVal) {
      this.refresh();
    },
  },
  created() {},
  mounted: function () {
    this.$nextTick(function () {
      this.refresh();
    });
  },
  methods: {
    openMenu() {
      this.opened = true;

      this.$emit("open-menu");
    },

    onChange() {
      this.article.description = this.description;
      this.article.image = this.coverImage;
      this.article.slug = this.slug;
      this.article.page_title = this.page_title;

      this.$emit("change");
    },

    onSelectImage(image) {
      this.coverImage = image;
      this.onChange();
    },

    refresh() {
      // 🞇 Refresh description.
      if (this.article.description) this.description = this.article.description;
      else this.description = "";

      this.slug = this.article.slug;
      this.page_title = this.article.page_title;

      // 🞇 Refresh cover image.
      this.hasImage = false;
      // Find selected image.
      this.coverImage = this.article.image;

      // Add cover image to images list if not exists.
      if (!this.images.includes(this.coverImage)) {
        this.images.unshift(this.coverImage);
      }

      this.hasImage = this.images.length > 0;

      if (!this.coverImage && this.images.length) {
        // Auto select first image.
        this.coverImage = this.images[0];
      }
    },
  },
};
</script>

<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */

.s--article-seo-editor {
  border-radius: 28px;
  text-align: center;
  position: relative;

  .article-edit-placeholder {
    user-select: none;
    line-height: normal;
  }

  .article-edit-form {
    border-radius: 16px;
  }
}
</style>
