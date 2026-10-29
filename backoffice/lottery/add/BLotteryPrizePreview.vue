<template>
  <section
    class="b-lottery-prize-preview text-start"
    :aria-label="$t('lottery_edit.preview_title')"
  >
    <h2>{{ $t("lottery_edit.preview_title") }}</h2>
    <p>{{ $t("lottery_edit.preview_subtitle") }}</p>

    <div
      class="b-lottery-prize-preview__states"
      role="group"
      :aria-label="$t('lottery_edit.preview_title')"
    >
      <v-btn
        variant="text"
        :aria-pressed="!hoverPreview"
        @click="hoverPreview = false"
      >
        {{ $t("lottery_edit.preview_resting") }}
      </v-btn>
      <v-btn
        variant="text"
        :aria-pressed="hoverPreview"
        @click="hoverPreview = true"
      >
        {{ $t("lottery_edit.preview_hover") }}
      </v-btn>
    </div>

    <div class="b-lottery-prize-preview__figure">
      <div
        class="b-lottery-prize-preview__wheel"
        role="img"
        :aria-label="title || $t('lottery_edit.preview_title_placeholder')"
      >
        <div
          class="b-lottery-prize-preview__slice"
          :class="{ 'b-lottery-prize-preview__slice--hover': hoverPreview }"
          :style="{
            backgroundColor: hoverPreview
              ? effectiveColor
              : 'rgb(var(--v-theme-surface))',
          }"
        >
          <v-img
            v-if="imageSource"
            :key="imageSource"
            :src="imageSource"
            class="b-lottery-prize-preview__image"
            @error="previewImageUnavailable = true"
          ></v-img>
        </div>
        <span
          v-for="index in 6"
          :key="index"
          class="b-lottery-prize-preview__separator"
          :style="{ transform: `rotate(${index * 60 - 120}deg)` }"
        ></span>
        <span class="b-lottery-prize-preview__label">{{
          title || $t("lottery_edit.preview_title_placeholder")
        }}</span>
        <span class="b-lottery-prize-preview__center" aria-hidden="true"></span>
      </div>
    </div>

    <p class="b-lottery-prize-preview__hint">
      {{ $t("lottery_edit.preview_angle_hint") }}
    </p>
    <p
      v-if="previewImageUnavailable"
      class="b-lottery-prize-preview__hint"
      role="status"
    >
      {{ $t("lottery_edit.preview_image_unavailable") }}
    </p>
    <p v-else-if="!imageSource" class="b-lottery-prize-preview__hint">
      {{ $t("lottery_edit.preview_no_image") }}
    </p>

    <div class="b-lottery-prize-preview__detail">
      <v-avatar v-if="imageSource" size="36"
        ><v-img :src="imageSource"></v-img
      ></v-avatar>
      <div>
        <strong>{{
          title || $t("lottery_edit.preview_title_placeholder")
        }}</strong>
        <p>
          {{
            description || $t("lottery_edit.preview_description_placeholder")
          }}
        </p>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: "BLotteryPrizePreview",
  props: {
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    image: { type: String, default: null },
    color: { type: String, default: null },
    selectedFile: { default: null },
  },
  data: () => ({
    hoverPreview: false,
    objectUrl: null,
    previewImageUnavailable: false,
  }),
  computed: {
    imageSource() {
      return (
        this.objectUrl ||
        (this.image ? this.getShopImagePath(this.image) : null)
      );
    },
    effectiveColor() {
      return this.color || "#FFA000";
    },
  },
  watch: {
    selectedFile: {
      immediate: true,
      handler(value) {
        this.releaseObjectUrl();
        this.previewImageUnavailable = false;
        const file = Array.isArray(value) ? value[0] : value;
        if (!file) return;
        // Bound this disposable preview only; the existing upload flow keeps its own validation.
        if (
          !(file instanceof File) ||
          ![
            "image/png",
            "image/jpeg",
            "image/webp",
            "image/gif",
            "image/avif",
          ].includes(file.type) ||
          file.size > 10 * 1024 * 1024
        ) {
          this.previewImageUnavailable = true;
          return;
        }
        try {
          this.objectUrl = URL.createObjectURL(file);
        } catch {
          this.previewImageUnavailable = true;
        }
      },
    },
    image() {
      this.previewImageUnavailable = false;
    },
  },
  beforeUnmount() {
    this.releaseObjectUrl();
  },
  methods: {
    releaseObjectUrl() {
      if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    },
  },
};
</script>

<style lang="scss" scoped>
.b-lottery-prize-preview {
  min-width: 0;
  color: rgb(var(--v-theme-on-surface));

  h2 {
    margin: 0;
    font-family: inherit;
    font-size: 18px;
    font-weight: 600;
    line-height: 1.4;
  }

  p {
    margin: 6px 0 0;
    color: rgba(var(--v-theme-on-surface), 0.66);
    font-size: 13px;
    font-weight: 400;
    line-height: 1.7;
  }

  &__states {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-block: 16px 20px;
    padding-block: 4px;

    > .v-btn {
      min-width: 0;
      min-height: 36px;
      height: auto;
      padding: 8px 12px;
      border: 1px solid rgba(var(--v-theme-on-surface), 0.09);
      border-radius: 9px !important;
      background: transparent;
      font-family: inherit;
      font-size: 13px;
      font-weight: 500;
      line-height: 20px;
      letter-spacing: 0;
      text-transform: none;

      :deep(.v-btn__content) {
        font: inherit;
      }
    }

    > .v-btn[aria-pressed="true"] {
      background: rgb(var(--v-theme-surface));
      box-shadow: 0 3px 10px rgba(var(--v-theme-on-surface), 0.13);
      :deep(.v-btn__overlay) {
        opacity: 0;
      }
    }
  }

  &__figure {
    position: relative;
    width: 100%;
    max-width: 300px;
    height: 220px;
    margin-inline: auto;
    overflow: hidden;
  }

  &__wheel {
    position: absolute;
    top: 0;
    left: 50%;
    width: 440px;
    height: 440px;
    transform: translateX(-50%);
    overflow: hidden;
    border: 12px solid rgb(var(--v-theme-surface));
    border-radius: 50%;
    background: repeating-conic-gradient(
      from -30deg,
      rgba(var(--v-theme-on-surface), 0.035) 0deg 60deg,
      rgba(var(--v-theme-on-surface), 0.075) 60deg 120deg
    );
  }

  &__slice {
    position: absolute;
    inset: 0;
    clip-path: polygon(50% 50%, 21.1325% 0, 78.8675% 0);
    background: rgb(var(--v-theme-surface));
  }

  &__image {
    width: 100%;
    height: 100%;
    transform: rotate(-60deg);
  }

  &__slice--hover &__image {
    opacity: 0.2;
    transform: rotate(-60deg) scale(1.15);
  }

  &__separator {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 60%;
    height: 3px;
    transform-origin: 0 center;
    background: rgb(var(--v-theme-surface));
  }

  &__label {
    position: absolute;
    top: calc(50% - 11px);
    left: 50%;
    width: calc(50% - 48px);
    height: 22px;
    padding-inline-start: 24px;
    transform: rotate(-90deg);
    transform-origin: 0 center;
    text-align: center;
    color: #fff;
    font-size: 16px;
    font-weight: 500;
    line-height: 22px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    pointer-events: none;
  }

  &__center {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 40px;
    height: 40px;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background: rgb(var(--v-theme-surface));
  }

  &__hint {
    font-size: 12px !important;
  }

  &__detail {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-block-start: 20px;
    padding-block-start: 16px;
    border-block-start: 1px solid rgba(var(--v-theme-on-surface), 0.09);
    overflow-wrap: anywhere;

    strong {
      font-size: 14px;
      font-weight: 600;
    }
    p {
      margin-block-start: 4px;
    }
  }

  @media (max-width: 680px), (pointer: coarse) {
    &__states > .v-btn {
      min-height: 44px;
    }
  }
}
</style>
