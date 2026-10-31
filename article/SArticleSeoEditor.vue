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
    :class="[
      workspace ? 'sd-modern-widget s--article-seo-editor--workspace' : 's--shadow-no-padding p-3',
      { 'pointer-pointer': !workspace && !opened },
    ]"
    :style="workspace ? undefined : '--background:#fff'"
    class="s--article-seo-editor text-start"
    @click.stop="
      () => {
        if (!workspace && !opened) openMenu();
      }
    "
  >
    <small v-if="!workspace" class="absolute-top-end m-3 m-small" style="line-height: normal"
      >SEO</small
    >
    <v-btn
      v-if="opened && !workspace"
      class="fadeIn absolute-top-start"
      icon
      size="small"
      variant="text"
      @click.stop="opened = false"
    >
      <v-icon>close</v-icon>
    </v-btn>

    <div class="article-edit-form">
      <v-expand-transition>
        <div v-if="!workspace && !opened" class="article-edit-placeholder d-flex text-start">
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
        <div v-if="workspace || opened" class="description-input" :class="{ 'pt-3': !workspace }">
          <form id="article-edit-form" @submit="workspace && $event.preventDefault()">
            <header v-if="workspace" class="s--article-seo-editor__heading">
              <h2>{{ $t('global.article.workspace.search_details') }}</h2>
              <p>{{ $t('global.article.workspace.search_details_hint') }}</p>
            </header>
            <v-text-field
              v-model="slug"
              :class="workspace ? 'sd-modern-underlined-field s--article-seo-editor__slug' : 'm-3 english-field'"
              :disabled="disabled"
              counter="128"
              :persistent-counter="workspace"
              :label="workspace ? $t('global.article.workspace.url_slug') : 'URL'"
              :messages="workspace ? $t(productWorkspace ? 'add_product.description_modern.description_slug_hint' : 'global.article.workspace.url_hint') : 'Use a clear and short URL, You can change it without worrying about the link being broken.'"
              :prepend-inner-icon="workspace ? undefined : 'link'"
              :persistent-placeholder="workspace"
              variant="underlined"
              @update:model-value="workspace && onChange()"
              @change="!workspace && onChange()"
            >
              <template v-if="!workspace" v-slot:append-inner>
                <u-progress-score
                  :value="$SEO.GetPageURLScore(slug)"
                ></u-progress-score>
              </template>
            </v-text-field>

            <v-text-field
              v-model="page_title"
              :class="workspace ? 'sd-modern-underlined-field' : 'm-3 english-field'"
              :disabled="disabled"
              counter="128"
              :persistent-counter="workspace"
              :label="workspace ? $t('global.article.workspace.page_title') : 'Page title'"
              :messages="workspace ? $t(productWorkspace ? 'add_product.description_modern.product_page_title_hint' : 'global.article.workspace.page_title_hint') : 'Leave it empty to set the page title the same as the article title.'"
              :prepend-inner-icon="workspace ? undefined : 'arrow_right'"
              :placeholder="workspace && !productWorkspace ? article.title : undefined"
              :persistent-placeholder="workspace"
              variant="underlined"
              @update:model-value="workspace && onChange()"
              @change="!workspace && onChange()"
            >
              <template v-if="!workspace" v-slot:append-inner>
                <u-progress-score
                  :value="$SEO.GetPageTitleScore(page_title)"
                ></u-progress-score>
              </template>
            </v-text-field>

            <v-textarea
              v-model="description"
              :label="$t(workspace ? 'global.article.workspace.meta_description' : 'global.article.edit_window.digest')"
              :disabled="disabled"
              :messages="workspace ? $t('global.article.workspace.meta_description_hint') : undefined"
              :rows="3"
              auto-grow
              :persistent-placeholder="workspace"
              :class="workspace ? 'sd-modern-underlined-field s--article-seo-editor__description' : 'm-3'"
              counter="256"
              :persistent-counter="workspace"
              variant="underlined"
              @update:model-value="workspace && onChange()"
              @change="!workspace && onChange()"
            >
              <template v-if="!workspace" v-slot:append-inner>
                <u-progress-score
                  :value="$SEO.GetPageDescription(description)"
                ></u-progress-score>
              </template>
            </v-textarea>

            <section v-if="workspace" class="s--article-seo-editor__image-section">
              <div class="s--article-seo-editor__heading">
                <h3>{{ $t('global.article.workspace.sharing_image') }}</h3>
                <p>{{ $t('global.article.workspace.sharing_image_hint') }}</p>
              </div>
              <u-fade-scroll
                v-if="hasImage"
                ref="workspaceCovers"
                class="s--article-seo-editor__covers"
                selected-class="s--article-seo-editor__cover--selected"
                show-arrow
                small-arrow
              >
                <div class="s--article-seo-editor__cover-strip">
                <button
                  v-for="(item, index) in displayImages"
                  :key="item"
                  type="button"
                  class="s--article-seo-editor__cover"
                  :class="{ 's--article-seo-editor__cover--selected': coverImage === item }"
                  :disabled="disabled"
                  :aria-label="$t('global.article.workspace.sharing_image_option', { index: index + 1 })"
                  :aria-pressed="coverImage === item"
                  @click="onSelectImage(item)"
                >
                  <v-img :src="item" :aspect-ratio="1.618" cover alt="" />
                  <span>{{ $t('global.article.workspace.article_image', { index: index + 1 }) }}</span>
                  <v-icon v-if="coverImage === item" class="s--article-seo-editor__selected" size="16" aria-hidden="true">check_circle</v-icon>
                </button>
                </div>
              </u-fade-scroll>
              <div v-else class="s--article-seo-editor__empty" role="status">
                <v-icon size="24" aria-hidden="true">image_not_supported</v-icon>
                <h4>{{ $t('global.article.workspace.no_article_images') }}</h4>
                <p>{{ $t('global.article.workspace.no_article_images_hint') }}</p>
              </div>
            </section>
            <u-fade-scroll
              v-if="!workspace && hasImage"
              :class="workspace ? 's--article-seo-editor__covers' : 'my-4'"
              :selected-class="workspace ? 's--article-seo-editor__cover--selected' : 'bg-success border-lg'"
              show-arrow
            >
              <div class="s--article-seo-editor__cover-list d-flex align-center justify-start overflow-visible">
                <v-card
                  v-for="(item, index) in displayImages"
                  :key="item"
                  :class="[
                    workspace ? 's--article-seo-editor__cover' : 'ma-2',
                    { 'bg-success border-lg': !workspace && coverImage === item,
                      's--article-seo-editor__cover--selected': workspace && coverImage === item },
                  ]"
                  :image="item"
                  :color="workspace ? undefined : 'grey-lighten-1'"
                  :disabled="disabled"
                  height="100"
                  :rounded="workspace ? undefined : 'xl'"
                  variant="outlined"
                  width="100"
                  min-width="100"
                  :role="workspace ? 'button' : undefined"
                  :tabindex="workspace ? (disabled ? -1 : 0) : undefined"
                  :aria-label="workspace ? $t('global.article.workspace.sharing_image_option', { index: index + 1 }) : undefined"
                  :aria-pressed="workspace ? coverImage === item : undefined"
                  @click="onSelectImage(item)"
                  @keydown.enter.prevent="workspace && onSelectImage(item)"
                  @keydown.space.prevent="workspace && onSelectImage(item)"
                >
                  <div class="d-flex fill-height align-center justify-center">
                    <v-scale-transition>
                      <v-icon
                        v-if="coverImage === item"
                        :color="workspace ? 'primary' : 'success'"
                        icon="check_circle"
                        :size="workspace ? 24 : 48"
                        :style="workspace ? 'background-color: rgb(var(--v-theme-surface)); border-radius: 50%' : `
                          background-color: #ffffffaa;
                          border-radius: 50%;
                          backdrop-filter: blur(4px);
                        `"
                      ></v-icon>
                    </v-scale-transition>
                  </div>
                </v-card>
              </div>
            </u-fade-scroll>
          </form>
        </div>
      </v-expand-transition>
    </div>
  </div>
</template>

<script lang="ts">
import UProgressScore from "../ui/progress/score/UProgressScore.vue";
import UFadeScroll from "@selldone/components-vue/ui/fade-scroll/UFadeScroll.vue";

export default {
  name: "ArticleEdit",

  components: {
    UFadeScroll,
    UProgressScore,
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
    workspace: { type: Boolean, default: false },
    productWorkspace: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
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
  computed: {
    displayImages() {
      if (!this.workspace) return this.images;
      const images = [...new Set(this.images.filter(Boolean))];
      return this.article.image && !images.includes(this.article.image)
        ? [this.article.image, ...images]
        : images;
    },
  },
  watch: {
    article() {
      if (this.workspace) this.refresh();
    },
    images: function (newVal, oldVal) {
      this.refresh();
    },
  },
  created() {},
  mounted: function () {
    this.$nextTick(function () {
      this.refresh();
      if (this.workspace) this.openMenu();
    });
  },
  methods: {
    openMenu() {
      this.opened = true;

      this.$emit("open-menu");
    },

    onChange() {
      if (this.disabled) return;
      this.article.description = this.description;
      this.article.image = this.coverImage;
      this.article.slug = this.slug;
      this.article.page_title = this.page_title;

      this.$emit("change");
    },

    onSelectImage(image) {
      if (this.disabled) return;
      this.coverImage = image;
      this.onChange();
      this.scrollSelectedCover();
    },

    scrollSelectedCover() {
      if (!this.workspace) return;
      this.$nextTick(() => {
        const fade = this.$refs?.workspaceCovers, scroll = fade?.$refs.scroll;
        const selected = scroll?.querySelector('.s--article-seo-editor__cover--selected');
        if (!selected) return;
        const bounds = scroll.getBoundingClientRect(), item = selected.getBoundingClientRect();
        const left = item.left < bounds.left ? item.left - bounds.left : item.right > bounds.right ? item.right - bounds.right : 0;
        if (left) scroll.scrollBy({ left, behavior: 'auto' });
        fade.onScroll(scroll);
      });
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
      if (!this.workspace && !this.images.includes(this.coverImage)) {
        this.images.unshift(this.coverImage);
      }

      this.hasImage = this.displayImages.length > 0;

      if (!this.coverImage && this.displayImages.length) {
        // Auto select first image.
        this.coverImage = this.displayImages[0];
      }
      this.scrollSelectedCover();
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
  background-color: #fff;

  .article-edit-placeholder {
    user-select: none;
    line-height: normal;
  }

  .article-edit-form {
    border-radius: 16px;
  }
}

.s--article-seo-editor--workspace {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
  padding: 24px;
  border: 1px solid var(--sd-modern-border);
  border-radius: 18px;
  color: rgb(var(--v-theme-on-surface));
  background: rgb(var(--v-theme-surface));
  font-family: inherit;
  font-size: 13px;
  line-height: 20px;

  .article-edit-form,
  .description-input,
  form,
  .sd-modern-underlined-field,
  .s--article-seo-editor__covers {
    width: 100%;
    min-width: 0;
    max-width: 100%;
    box-sizing: border-box;
  }

  .s--article-seo-editor__heading {
    margin-block-end: 22px;

    h2,
    h3 { margin: 0; font-family: inherit; font-size: 14px !important; font-weight: 500; line-height: 22px; }
    p { margin: 4px 0 0; font-size: 12px; line-height: 19px; color: var(--sd-modern-muted); }
  }

  .sd-modern-underlined-field {
    --sd-modern-field-height: 60px;
    margin-block-end: 22px;

    :deep(.v-input__control),
    :deep(.v-field),
    :deep(.v-field__field) { min-width: 0; max-width: 100%; }
    :deep(.v-field__input) {
      font-family: inherit;
      font-size: 13px !important;
      font-weight: 400;
      line-height: 20px !important;
      letter-spacing: 0;
    }
    :deep(.v-field-label),
    :deep(.v-field-label--floating) { font-size: 12px !important; font-weight: 500; line-height: 20px !important; }
    :deep(.v-input__details),
    :deep(.v-messages),
    :deep(.v-messages__message),
    :deep(.v-counter) {
      min-width: 0;
      max-width: 100%;
      font-size: 11px !important;
      line-height: 18px !important;
      overflow-wrap: anywhere;
    }
    :deep(.v-input__details) { align-items: flex-start; gap: 14px; }
    :deep(.v-messages) { flex: 1 1 0; }
    :deep(.v-counter) { flex: 0 0 auto; align-self: flex-start; white-space: nowrap; }
  }

  .s--article-seo-editor__description { margin-block-end: 0; }

  .s--article-seo-editor__slug :deep(input) {
    direction: ltr;
  }

  .s--article-seo-editor__image-section {
    margin-block-start: 24px;
    padding-block-start: 24px;
    border-block-start: 1px solid var(--sd-modern-border);

    .s--article-seo-editor__heading { margin: 0; }
  }

  .s--article-seo-editor__covers {
    margin-block-start: 14px;

    :deep(.--scroll) { min-width: 0; max-width: 100%; padding: 4px; overflow-x: auto; scrollbar-width: thin; }
    :deep(.--scroll::-webkit-scrollbar) { display: block; height: 4px; }
    :deep(.--scroll::-webkit-scrollbar-thumb) { border-radius: 4px; background: var(--sd-modern-border); }
  }

  .s--article-seo-editor__cover-strip {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: calc((100% - 20px) / 3);
    gap: 10px;
    width: 100%;
    min-width: 0;
  }

  .s--article-seo-editor__cover {
    position: relative;
    display: grid;
    gap: 6px;
    min-width: 0;
    min-height: 88px;
    padding: 7px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 10px;
    background: var(--sd-modern-inset);
    color: inherit;
    font-family: inherit;
    font-size: 11px;
    line-height: 16px;
    text-align: center;
    white-space: normal;
    overflow-wrap: anywhere;
    cursor: pointer;

    :deep(.v-img) { width: 100%; border-radius: 5px; }
    &:disabled { opacity: 0.5; cursor: default; }
  }

  .s--article-seo-editor__cover--selected { border: 2px solid rgb(var(--v-theme-primary)); padding: 6px; }
  .s--article-seo-editor__selected { position: absolute; inset-block-start: 4px; inset-inline-end: 4px; color: rgb(var(--v-theme-primary)); background: rgb(var(--v-theme-surface)); border-radius: 50%; }
  .s--article-seo-editor__cover:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 3px;
  }

  .s--article-seo-editor__empty {
    padding: 30px 12px;
    text-align: center;

    > .v-icon { margin-block-end: 10px; color: var(--sd-modern-muted); }
    h4 { margin: 0; font-size: 12px; font-weight: 500; line-height: 20px; }
    p { margin: 7px 0 0; font-size: 11px; line-height: 18px; color: var(--sd-modern-muted); }
  }

  @media (max-width: 580px) { padding: 18px; }
  @media (max-width: 580px), (pointer: coarse) {
    .sd-modern-underlined-field :deep(.v-field__input) { font-size: 16px !important; }
  }
}
</style>
