<template>
  <div class="sld-bfb-prev" :class="`-layout-${layoutSafe}`">
    <div class="sld-bfb-prev__inner">
      <!-- Split layouts -->
      <template v-if="layoutSafe === 'split_right' || layoutSafe === 'split_left'">
        <div class="sld-bfb-prev__split" :class="{ '-reverse': layoutSafe === 'split_left' }">
          <div class="sld-bfb-prev__content">
            <div class="sld-bfb-prev__title">{{ titleSafe }}</div>
            <div v-if="subtitleSafe" class="sld-bfb-prev__subtitle">
              {{ subtitleSafe }}
            </div>

            <div class="sld-bfb-prev__input">
              <b-listing-form-builder-field-preview :field="slide?.field" />
            </div>

            <div v-if="tipsSafe" class="sld-bfb-prev__tips">
              {{ tipsSafe }}
            </div>
          </div>

          <div class="sld-bfb-prev__image">
            <div class="sld-bfb-prev__imgbox">
              <img v-if="imageSafe" :src="getShopImagePath(imageSafe)" alt="illustration" />
              <div v-else class="sld-bfb-prev__imgempty">
                <v-icon size="44" class="text-muted">image</v-icon>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Stacked -->
      <template v-else-if="layoutSafe === 'stacked'">
        <div class="sld-bfb-prev__imgbox -stacked">
          <img v-if="imageSafe" :src="getShopImagePath(imageSafe)" alt="illustration" />
          <div v-else class="sld-bfb-prev__imgempty">
            <v-icon size="44" class="text-muted">image</v-icon>
          </div>
        </div>

        <div class="sld-bfb-prev__title">{{ titleSafe }}</div>
        <div v-if="subtitleSafe" class="sld-bfb-prev__subtitle">{{ subtitleSafe }}</div>

        <div class="sld-bfb-prev__input">
          <b-listing-form-builder-field-preview :field="slide?.field" />
        </div>

        <div v-if="tipsSafe" class="sld-bfb-prev__tips">{{ tipsSafe }}</div>
      </template>

      <!-- Centered -->
      <template v-else>
        <div class="sld-bfb-prev__center">
          <div class="sld-bfb-prev__imgbox -center">
            <img v-if="imageSafe" :src="getShopImagePath(imageSafe)" alt="illustration" />
            <div v-else class="sld-bfb-prev__imgempty">
              <v-icon size="44" class="text-muted">image</v-icon>
            </div>
          </div>

          <div class="sld-bfb-prev__title">{{ titleSafe }}</div>
          <div v-if="subtitleSafe" class="sld-bfb-prev__subtitle">{{ subtitleSafe }}</div>

          <div class="sld-bfb-prev__input">
            <b-listing-form-builder-field-preview :field="slide?.field" />
          </div>

          <div v-if="tipsSafe" class="sld-bfb-prev__tips">{{ tipsSafe }}</div>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import BListingFormBuilderFieldPreview from "./BListingFormBuilderFieldPreview.vue";

export default {
  name: "BListingFormBuilderSlidePreview",

  components: { BListingFormBuilderFieldPreview },

  props: {
    slide: { type: Object, required: true },
  },

  computed: {
    layoutSafe(): string {
      const l = String((this as any).slide?.layout || "split_right").trim();
      const allowed = new Set(["split_right", "split_left", "stacked", "centered"]);
      return allowed.has(l) ? l : "split_right";
    },

    titleSafe(): string {
      const t = String((this as any).slide?.title || "").trim();
      return t || "Step title";
    },

    subtitleSafe(): string {
      return String((this as any).slide?.subtitle || "").trim();
    },

    tipsSafe(): string {
      return String((this as any).slide?.tips || "").trim();
    },

    imageSafe(): string {
      return String((this as any).slide?.image || "").trim();
    },
  },
};
</script>

<style lang="scss" scoped>
/* Local preview typography variables */
$sld-bfb-prev-title: 28px;
$sld-bfb-prev-sub: 14px;

.sld-bfb-prev {
  border: 1px solid rgba(20, 20, 20, 0.10);
  border-radius: 18px;
  background: #fff;
  overflow: hidden;

  &__inner {
    padding: 18px;
  }

  &__title {
    font-size: $sld-bfb-prev-title;
    font-weight: 900;
    line-height: 1.1;
    overflow-wrap: anywhere;
  }

  &__subtitle {
    margin-top: 6px;
    font-size: $sld-bfb-prev-sub;
    color: rgba(0, 0, 0, 0.62);
    overflow-wrap: anywhere;
  }

  &__tips {
    margin-top: 12px;
    padding: 12px 14px;
    border-radius: 14px;
    background: rgba(0, 0, 0, 0.03);
    color: rgba(0, 0, 0, 0.64);
    line-height: 1.6;
    overflow-wrap: anywhere;
  }

  &__input {
    margin-top: 16px;
  }

  &__split {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 18px;
    align-items: center;

    &.-reverse {
      grid-template-columns: 320px 1fr;

      .sld-bfb-prev__content {
        order: 2;
      }
      .sld-bfb-prev__image {
        order: 1;
      }
    }

    @media (max-width: 900px) {
      grid-template-columns: 1fr;
    }
  }

  &__imgbox {
    border-radius: 16px;
    background: rgba(0, 0, 0, 0.03);
    border: 1px solid rgba(20, 20, 20, 0.08);
    overflow: hidden;
    min-height: 240px;
    display: grid;
    place-items: center;

    img {
      width: 100%;
      height: 100%;
      min-height: 240px;
      object-fit: cover;
      display: block;
    }

    &.-stacked {
      margin-bottom: 14px;
      min-height: 220px;

      img {
        min-height: 220px;
      }
    }

    &.-center {
      max-width: 420px;
      width: 100%;
      margin: 0 auto 14px;
      min-height: 220px;

      img {
        min-height: 220px;
      }
    }
  }

  &__imgempty {
    padding: 24px;
  }

  &__center {
    text-align: center;
  }
}
</style>