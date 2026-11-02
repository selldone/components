<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
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
  <section
    v-if="images.length"
    class="b-app-gallery text-start"
    :class="{ 'b-app-gallery--dark': isDark }"
    :aria-label="$t('app_config.gallery_title')"
  >
    <div class="b-app-gallery__heading">
      <h2>{{ $t("app_config.gallery_previews") }}</h2>
      <span>{{
        $t(
          images.length === 1
            ? "app_config.gallery_count_one"
            : "app_config.gallery_count",
          { total: images.length },
        )
      }}</span>
    </div>
    <v-dialog
      v-model="viewer"
      fullscreen
      :aria-label="$t('app_config.gallery_title')"
      @keydown="onViewerKeydown"
    >
      <template #activator="{ props: activatorProps }">
        <div
          class="b-app-gallery__mosaic"
          :data-count="Math.min(images.length, 5)"
        >
          <!-- The native click handler records the selected preview; one shared ref would point to the last tile. -->
          <button
            v-for="(image, index) in visibleImages"
            :key="image.path"
            v-bind="{ ...activatorProps, ref: undefined }"
            type="button"
            class="b-app-gallery__tile"
            :aria-label="imageLabel(index)"
            @click="currentIndex = index"
          >
            <v-img
              :src="getShopImagePath(image.path)"
              alt=""
              cover
              height="100%"
              width="100%"
            >
              <template #placeholder
                ><v-progress-circular
                  class="b-app-gallery__loading"
                  indeterminate
                  size="24"
                  width="2"
              /></template>
              <template #error
                ><span class="b-app-gallery__error">{{
                  $t("app_config.gallery_unavailable")
                }}</span></template
              >
            </v-img>
            <span
              v-if="images.length > 4 && index === 3"
              class="b-app-gallery__more"
            >
              <strong>+{{ images.length - 3 }}</strong>
              <span>{{
                $t("app_config.gallery_more", { total: images.length })
              }}</span>
            </span>
            <span v-else-if="index === 0" class="b-app-gallery__view"
              ><Expand :size="13" aria-hidden="true" />{{
                $t("global.actions.view")
              }}</span
            >
          </button>
        </div>
      </template>

      <div
        class="b-app-gallery-viewer text-start"
        :class="{ 'b-app-gallery-viewer--dark': isDark }"
        :dir="$vuetify.locale.isRtl ? 'rtl' : 'ltr'"
      >
        <header class="b-app-gallery-viewer__header">
          <div class="b-app-gallery-viewer__identity">
            <h2>{{ app.name }}</h2>
            <p aria-live="polite">{{ imageLabel(currentIndex) }}</p>
          </div>
          <v-btn
            class="b-app-gallery-viewer__close"
            variant="text"
            :aria-label="$t('global.actions.close')"
            @click="viewer = false"
          >
            <X :size="17" aria-hidden="true" />
            <v-tooltip
              activator="parent"
              location="top"
              content-class="sd-modern-tooltip"
              >{{ $t("global.actions.close") }}</v-tooltip
            >
          </v-btn>
        </header>
        <div class="b-app-gallery-viewer__main">
          <div class="b-app-gallery-viewer__image">
            <v-img
              v-if="currentImage"
              :key="currentImage.path"
              :src="getShopImagePath(currentImage.path)"
              :alt="imageLabel(currentIndex)"
              :cover="false"
              height="100%"
              width="100%"
            >
              <template #placeholder
                ><v-progress-circular
                  class="b-app-gallery__loading"
                  indeterminate
                  size="32"
                  width="2"
              /></template>
              <template #error
                ><span class="b-app-gallery__error">{{
                  $t("app_config.gallery_unavailable")
                }}</span></template
              >
            </v-img>
          </div>
          <footer class="b-app-gallery-viewer__controls">
            <v-btn
              class="b-app-gallery-viewer__button"
              variant="flat"
              :disabled="currentIndex === 0"
              @click="moveImage(-1)"
            >
              <ChevronLeft
                class="b-app-gallery-viewer__arrow"
                :size="16"
                aria-hidden="true"
              />{{ $t("global.actions.previous") }}
            </v-btn>
            <span class="b-app-gallery-viewer__count">{{
              $t("app_config.gallery_screenshot")
            }}</span>
            <v-btn
              class="b-app-gallery-viewer__button"
              variant="flat"
              :disabled="currentIndex === images.length - 1"
              @click="moveImage(1)"
            >
              {{ $t("global.actions.next")
              }}<ChevronRight
                class="b-app-gallery-viewer__arrow"
                :size="16"
                aria-hidden="true"
              />
            </v-btn>
          </footer>
        </div>
      </div>
    </v-dialog>
  </section>
</template>

<script lang="ts">
import { ChevronLeft, ChevronRight, Expand, X } from "@lucide/vue";

export default {
  name: "BAppDetailGallery",
  components: { ChevronLeft, ChevronRight, Expand, X },
  props: {
    app: {
      required: true,
      type: Object,
    },
    dark: {
      default: false,
      type: Boolean,
    },
  },
  data: () => ({
    viewer: false,
    currentIndex: 0,
  }),

  computed: {
    isDark() {
      return this.$vuetify.theme.current.dark;
    },
    images() {
      return Array.isArray(this.app?.images)
        ? this.app.images.filter((image) => image?.path)
        : [];
    },
    visibleImages() {
      return this.images.slice(0, 4);
    },
    currentImage() {
      return this.images[this.currentIndex];
    },
  },
  watch: {
    images() {
      this.viewer = false;
      this.currentIndex = 0;
    },
  },
  methods: {
    imageLabel(index) {
      return this.$t("app_config.gallery_image", {
        current: index + 1,
        total: this.images.length,
      });
    },
    moveImage(offset) {
      this.currentIndex = Math.max(
        0,
        Math.min(this.images.length - 1, this.currentIndex + offset),
      );
    },
    onViewerKeydown(event) {
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      const forward = this.$vuetify.locale.isRtl ? "ArrowLeft" : "ArrowRight";
      this.moveImage(event.key === forward ? 1 : -1);
    },
  },
};
</script>

<style scoped>
.b-app-gallery,
.b-app-gallery-viewer {
  --ad-canvas: #f4f5f7;
  --ad-surface: #fff;
  --ad-inset: #f3f4f6;
  --ad-ink: #22262d;
  --ad-muted: #68717e;
  --ad-border: #e3e6eb;
  --ad-blue: #2563d9;
  --ad-on-blue: #fff;
  --ad-gallery-overflow: #f0f3f7e8;
  color: var(--ad-ink);
}
.b-app-gallery--dark,
.b-app-gallery-viewer--dark {
  --ad-canvas: #181b20;
  --ad-surface: #23272e;
  --ad-inset: #2d323a;
  --ad-ink: #edf0f5;
  --ad-muted: #abb4c2;
  --ad-border: #3b424d;
  --ad-blue: #aacaff;
  --ad-on-blue: #152b4c;
  --ad-gallery-overflow: #242c39eb;
}
.b-app-gallery {
  min-inline-size: 0;
}
.b-app-gallery__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-block-end: 10px;
}
.b-app-gallery__heading h2 {
  margin: 0;
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;
}
.b-app-gallery__heading > span {
  color: var(--ad-muted);
  font-size: 12px;
  line-height: 18px;
}
.b-app-gallery__mosaic {
  display: grid;
  grid-template-columns: 1.8fr 1fr 1fr;
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: 7px;
  block-size: 220px;
}
.b-app-gallery__tile {
  position: relative;
  min-inline-size: 0;
  min-block-size: 0;
  padding: 0;
  overflow: hidden;
  border: 1px solid var(--ad-border);
  border-radius: 10px;
  background: var(--ad-inset);
  color: var(--ad-ink);
  cursor: zoom-in;
  text-align: start;
}
.b-app-gallery__tile:first-child {
  grid-row: span 2;
}
.b-app-gallery__mosaic[data-count="1"] {
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
}
.b-app-gallery__mosaic[data-count="2"] {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr;
}
.b-app-gallery__mosaic[data-count="1"] > :first-child,
.b-app-gallery__mosaic[data-count="2"] > :first-child {
  grid-row: auto;
}
.b-app-gallery__mosaic[data-count="3"] {
  grid-template-columns: 1.6fr 1fr;
}
.b-app-gallery__mosaic[data-count="4"] > :last-child,
.b-app-gallery__mosaic[data-count="5"] > :last-child {
  grid-column: span 2;
}
.b-app-gallery__tile:hover {
  border-color: var(--ad-muted);
}
.b-app-gallery__tile:focus-visible {
  outline: 2px solid var(--ad-blue);
  outline-offset: 3px;
}
.b-app-gallery__view {
  position: absolute;
  inset-inline-end: 7px;
  inset-block-end: 7px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 6px;
  border: 1px solid var(--ad-border);
  border-radius: 5px;
  background: var(--ad-surface);
  font-size: 11px;
  line-height: 16px;
}
.b-app-gallery__view svg {
  inline-size: 12px;
  block-size: 12px;
}
.b-app-gallery__more {
  position: absolute;
  inset: 0;
  display: grid;
  place-content: center;
  gap: 3px;
  background: var(--ad-gallery-overflow);
  color: var(--ad-ink);
  text-align: center;
  font-size: 12px;
  line-height: 18px;
}
.b-app-gallery__more strong {
  font-size: 23px;
  font-weight: 500;
  line-height: 28px;
}
.b-app-gallery__loading,
.b-app-gallery__error {
  position: absolute;
  inset: 0;
  margin: auto;
  color: var(--ad-muted);
}
.b-app-gallery__error {
  display: grid;
  place-content: center;
  padding: 12px;
  text-align: center;
  font-size: 12px;
  line-height: 19px;
}
.b-app-gallery-viewer {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: auto minmax(0, 1fr);
  block-size: 100%;
  min-block-size: 0;
  border-radius: 0;
  background: var(--ad-canvas);
}
.b-app-gallery-viewer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 22px;
  border-block-end: 1px solid var(--ad-border);
  background: var(--ad-surface);
}
.b-app-gallery-viewer__identity {
  flex: 1;
  min-inline-size: 0;
}
.b-app-gallery-viewer__identity h2 {
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  line-height: 20px;
  font-weight: 500;
}
.b-app-gallery-viewer__identity p {
  margin: 0;
  color: var(--ad-muted);
  font-size: 12px;
  line-height: 18px;
}
.b-app-gallery-viewer__main {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-content: start;
  gap: 18px;
  min-block-size: 0;
  min-inline-size: 0;
  padding: 26px 22px;
  overflow-y: auto;
}
.b-app-gallery-viewer__image {
  min-block-size: 0;
  min-inline-size: 0;
  block-size: 390px;
  border: 1px solid var(--ad-border);
  border-radius: 12px;
  overflow: hidden;
  background: var(--ad-surface);
}
.b-app-gallery-viewer__controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}
.b-app-gallery-viewer__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  flex: 0 0 auto;
  block-size: auto;
  min-block-size: 42px;
  padding: 10px 14px;
  border: 1px solid var(--ad-border);
  border-radius: 9px;
  background: var(--ad-surface);
  color: var(--ad-ink);
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: normal;
  text-transform: none;
}
.b-app-gallery-viewer__button :deep(.v-btn__content) {
  gap: 7px;
}
.b-app-gallery-viewer__button :deep(.v-btn__overlay),
.b-app-gallery-viewer__button :deep(.v-btn__underlay),
.b-app-gallery-viewer__close :deep(.v-btn__overlay),
.b-app-gallery-viewer__close :deep(.v-btn__underlay) {
  display: none;
}
.b-app-gallery-viewer__button:disabled {
  opacity: 0.5;
}
.b-app-gallery-viewer__close {
  inline-size: 34px;
  block-size: 34px;
  min-inline-size: 34px;
  padding: 0;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: var(--ad-ink);
}
.b-app-gallery-viewer__close:hover {
  background: var(--ad-inset);
}
.b-app-gallery-viewer__button:focus-visible,
.b-app-gallery-viewer__close:focus-visible {
  outline: 2px solid var(--ad-blue);
  outline-offset: 2px;
}
.b-app-gallery-viewer__count {
  color: var(--ad-muted);
  font-size: 12px;
  line-height: 18px;
  text-align: center;
}
.b-app-gallery-viewer:dir(rtl) .b-app-gallery-viewer__arrow {
  transform: scaleX(-1);
}
@media (max-width: 420px) {
  .b-app-gallery__mosaic {
    grid-template-columns: 1fr 1fr;
    block-size: 210px;
  }
  .b-app-gallery__tile:first-child {
    grid-row: auto;
  }
  .b-app-gallery__mosaic[data-count="3"] {
    grid-template-columns: 1fr 1fr;
  }
  .b-app-gallery__mosaic[data-count="3"] > :first-child {
    grid-column: span 2;
  }
  .b-app-gallery__mosaic[data-count="4"] > :last-child,
  .b-app-gallery__mosaic[data-count="5"] > :last-child {
    grid-column: auto;
  }
  .b-app-gallery__mosaic[data-count="1"] {
    grid-template-columns: 1fr;
    block-size: 180px;
  }
  .b-app-gallery__mosaic[data-count="2"] {
    grid-template-rows: 1fr;
    block-size: 180px;
  }
  .b-app-gallery-viewer__header {
    padding: 14px;
  }
  .b-app-gallery-viewer__main {
    padding: 20px 14px;
  }
  .b-app-gallery-viewer__image {
    block-size: 360px;
  }
  .b-app-gallery-viewer__controls {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
  .b-app-gallery-viewer__count {
    grid-row: 2;
    grid-column: span 2;
    text-align: center;
  }
  .b-app-gallery-viewer__button {
    min-block-size: 44px;
  }
  .b-app-gallery-viewer__close {
    inline-size: 44px;
    block-size: 44px;
    min-inline-size: 44px;
  }
}
@media (pointer: coarse) {
  .b-app-gallery-viewer__button {
    min-block-size: 44px;
  }
  .b-app-gallery-viewer__close {
    inline-size: 44px;
    block-size: 44px;
    min-inline-size: 44px;
  }
}
</style>
