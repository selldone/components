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
    class="s--article-seo-editor  s--shadow-no-padding  p-3"
    :class="{ 'pointer-pointer': !opened }"
    @click.stop="
      () => {
        if (!opened) openMenu();
      }
    "
  >
    <small class="absolute-top-end m-3 m-small" style="line-height: normal"
      >SEO</small
    >
    <v-btn v-if="opened" @click.stop="opened=false" icon small class="fadeIn absolute-top-start"><v-icon small>close</v-icon></v-btn>

    <div class="article-edit-form">
      <v-expand-transition>
        <div v-if="!opened" class="article-edit-placeholder d-flex text-start">
          <v-avatar class="rounded-18px" size="48">
            <v-img v-if="article.image" :src="article.image"></v-img>
          </v-avatar>
          <div
            class="subtitle-2 flex-grow-1 px-3"
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
              @change="onChange()"
              label="URL"
              prepend-inner-icon="link"
              class="m-3 english-field"
              counter="128"
              messages="Use a clear and short URL, You can change it without worrying about the link being broken."
            >
              <template v-slot:append>
                <score-indicator :value="$SEO.GetPageURLScore(slug)" class="mt-n1"></score-indicator>
              </template>
            </v-text-field>

            <v-text-field
              v-model="page_title"
              @change="onChange"
              label="Page title"
              prepend-inner-icon="arrow_right"
              class="m-3 english-field"
              counter="128"
              messages="Leave it empty to set the page title the same as the article title."
            >
              <template v-slot:append>
                <score-indicator :value="$SEO.GetPageTitleScore(page_title)" class="mt-n1"></score-indicator>
              </template>
            </v-text-field>

            <v-textarea
              v-model="description"
              @change="onChange"
              counter="256"
              class="m-3"
              :label="$t('global.article.edit_window.digest')"
            >
              <template v-slot:append>
                <score-indicator :value="$SEO.GetPageDescription(description)" class="mt-n1"></score-indicator>
              </template>
            </v-textarea>

            <vue-select-image
              v-if="hasImage"
              :data-images="dataImages"
              h="84px"
              :selected-images="initialSelected"
              @onselectimage="onSelectImage"
            />

          </form>
        </div>
      </v-expand-transition>
    </div>
  </div>
</template>

<script>
import VueSelectImage from "vue-select-image";
import ScoreIndicator from "@/Components/ui/progress/score-indicator/ScoreIndicator.vue";

require("vue-select-image/dist/vue-select-image.css");

export default {
  name: "ArticleEdit",

  components: {
    ScoreIndicator,
    VueSelectImage,
  },
  props: {
    article: {
      required: true,
      type: Object,
    },
    dataImages: {
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

      initialSelected: [],

      hasImage: false, // trigger images to show selected image correctly!
      opened: false,
    };
  },
  computed: {
    counterDanger() {
      return this.description.length > 256;
    },
  },
  watch: {
    dataImages: function (newVal, oldVal) {
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

    saveEdit() {
      this.article.description = this.description;
      this.article.image = this.coverImage;
      this.article.slug = this.slug;
      this.article.page_title = this.page_title;

      this.closeNewComment();
      this.$emit("save-change");
    },

    onChange(){
      this.article.description = this.description;
      this.article.image = this.coverImage;
      this.article.slug = this.slug;
      this.article.page_title = this.page_title;

      this.$emit("change");
    },


    onSelectImage(image) {
      this.coverImage = image.src;
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
      let index = this.imageIndex(this.article.image);
      if (index < 0) index = 0;
      if (this.dataImages.length > 0) {
        this.coverImage = this.dataImages[index].src;
        this.initialSelected = [this.dataImages[index]];
        this.hasImage = true;
      }
    },
    //――――――――――――――――――――――― Helper Methods ―――――――――――――――――――――――

    startEditing() {
      this.state = "editing";
    },
    stopEditing() {
      this.state = "default";
      this.data.body = "";
    },

    imageIndex(src) {
      return this.dataImages.findIndex((element) => {
        return element.src === src;
      });
    },

    closeNewComment() {
      this.opened = false;

    },
  },
};
</script>

<style scoped lang="scss">

/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */

.s--article-seo-editor{
  border-radius: 28px ;
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
