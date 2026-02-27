<!--
  Storefront Listing Onboarding (Airbnb-like)
  This component renders ONE slide (step).

  Usage (preview):
    <s-storefront-listing-onboarding-slide :slide="slide" preview />

  Usage (real):
    <s-storefront-listing-onboarding-slide :slide="slide" v-model="value" />
-->

<template>
  <div
    class="sld-onb-slide"
    :class="[
      `-layout-${layout}`,
      { '-has-items': hasInfoItems },
    ]"
  >
    <div class="sld-onb-slide__inner">
      <div class="sld-onb-slide__content">
        <div v-if="step" class="sld-onb-step">Step {{ step }}</div>

        <div v-if="title" class="sld-onb-title">{{ title }}</div>
        <div v-if="subtitle" class="sld-onb-subtitle">{{ subtitle }}</div>
        <div v-if="tips" class="sld-onb-tips">{{ tips }}</div>

        <div v-if="hasField" class="sld-onb-input">
          <s-storefront-listing-onboarding-field-renderer
            :field="safeSlide.field"
            :model-value="valueProxy"
            :preview="preview"
            @update:modelValue="onUpdateValue"
          />
        </div>
      </div>

      <!-- ✅ Right side: either items list OR single illustration -->
      <div v-if="hasInfoItems" class="sld-onb-slide__media">
        <div class="sld-onb-items">
          <div
            v-for="(it, i) in infoItems"
            :key="it._key"
            class="sld-onb-items__row"
          >
            <div class="sld-onb-items__left">
              <div class="sld-onb-items__num">
                {{ it.step ?? (i + 1) }}
              </div>

              <div class="sld-onb-items__texts">
                <div class="sld-onb-items__title">
                  {{ it.title }}
                </div>
                <div v-if="it.subtitle" class="sld-onb-items__subtitle">
                  {{ it.subtitle }}
                </div>
              </div>
            </div>

            <div class="sld-onb-items__right">
              <img
                v-if="it.imageUrl"
                class="sld-onb-items__img"
                :src="it.imageUrl"
                alt=""
              />
              <div v-else class="sld-onb-items__img-fallback" aria-hidden="true">
                <span>•</span>
              </div>
            </div>

            <div v-if="i !== infoItems.length - 1" class="sld-onb-items__sep" />
          </div>
        </div>
      </div>

      <div v-else-if="imageUrl" class="sld-onb-slide__media">
        <img class="sld-onb-illustration" :src="imageUrl" alt="" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import SStorefrontListingOnboardingFieldRenderer from "./SStorefrontListingOnboardingFieldRenderer.vue";

type InfoItem = {
  _key: string;
  step: number | null;
  title: string;
  subtitle: string;
  imageUrl: string;
};

export default {
  name: "SStorefrontListingOnboardingSlide",

  components: {
    SStorefrontListingOnboardingFieldRenderer,
  },

  props: {
    slide: { type: Object, required: true },
    preview: { type: Boolean, default: false },
    modelValue: { default: null },
    step: { type: Number, default: null },
  },

  emits: ["update:modelValue"],

  data: () => ({
    previewValue: null as any,
  }),

  computed: {
    safeSlide(): any {
      const s: any = this.slide || {};
      return {
        id: s.id || "",
        type: s.type || (s.field ? "field" : "info"),
        layout: s.layout || "split_right",
        title: s.title || "",
        subtitle: s.subtitle || "",
        tips: s.tips || "",
        image: s.image || "",
        field: s.field || null,

        // ✅ new: info-items (supports multiple schema shapes)
        items:
          Array.isArray(s.items)
            ? s.items
            : Array.isArray(s.info_items)
              ? s.info_items
              : Array.isArray(s.info?.items)
                ? s.info.items
                : [],
      };
    },

    layout(): string {
      const l = String(this.safeSlide.layout || "split_right");
      if (l === "centered") return "center";
      if (l === "stacked") return "media_top";
      return l;
    },

    title(): string {
      return String(this.safeSlide.title || "");
    },

    subtitle(): string {
      return String(this.safeSlide.subtitle || "");
    },

    tips(): string {
      return String(this.safeSlide.tips || "");
    },

    hasField(): boolean {
      return this.safeSlide.type !== "info" && !!this.safeSlide.field;
    },

    hasInfoItems(): boolean {
      const arr = this.safeSlide.items;
      return Array.isArray(arr) && arr.length > 0;
    },

    infoItems(): InfoItem[] {
      const arr = Array.isArray(this.safeSlide.items) ? this.safeSlide.items : [];
      return arr
        .map((raw: any, idx: number) => {
          const o: any = raw && typeof raw === "object" ? raw : {};

          const title = String(o.title || "").trim();
          const subtitle = String(o.subtitle || o.description || "").trim();

          const img = String(o.image || o.icon || "").trim();
          const imageUrl = this.resolveImage(img);

          const step =
            o.step !== undefined && o.step !== null
              ? this.toIntOrNull(o.step)
              : null;

          return {
            _key: String(o.id || `${this.safeSlide.id || "slide"}_${idx}`),
            step,
            title: title || `Item ${idx + 1}`,
            subtitle,
            imageUrl,
          };
        })
        .filter((x: InfoItem) => !!x.title);
    },

    imageUrl(): string {
      const img = String(this.safeSlide.image || "").trim();
      return this.resolveImage(img);
    },

    valueProxy(): any {
      return this.preview ? this.previewValue : this.modelValue;
    },
  },

  watch: {
    modelValue: {
      immediate: true,
      handler(v: any) {
        if (!this.preview) return;
        this.previewValue = v;
      },
    },

    slide: {
      immediate: true,
      handler() {
        if (this.preview) this.previewValue = null;
      },
    },
  },

  methods: {
    toIntOrNull(v: any): number | null {
      const n = parseInt(String(v ?? ""), 10);
      return Number.isFinite(n) && !Number.isNaN(n) ? n : null;
    },

    resolveImage(img: string): string {
      const s = String(img || "").trim();
      if (!s) return "";
      if (s.startsWith("http://") || s.startsWith("https://")) return s;

      // Selldone global helper
      // @ts-ignore
      const fn = (this as any).getShopImagePath;
      if (typeof fn === "function") return fn(s);
      return s;
    },

    onUpdateValue(v: any) {
      if (this.preview) {
        this.previewValue = v;
        return;
      }
      this.$emit("update:modelValue", v);
    },
  },
};
</script>

<style lang="scss" scoped>
/**
 * ✅ Key fix: for horizontal split templates, make it 50/50.
 * This applies to BOTH single-image and list-items media blocks.
 */
.sld-onb-slide {
  background: #fff;
  padding: 34px 28px;
  min-height: 420px;

  &__inner {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); /* ✅ 50/50 */
    gap: 28px;
    align-items: center;
  }

  &__content {
    max-width: 100%; /* ✅ let the left half actually use its half */
  }

  &__media {
    display: flex;
    justify-content: center;
    align-items: center;
    min-width: 0;
  }
}

.sld-onb-step {
  font-size: 12px;
  font-weight: 700;
  opacity: 0.65;
  margin-bottom: 10px;
}

.sld-onb-title {
  font-size: 34px;
  font-weight: 900;
  line-height: 1.12;
}

.sld-onb-subtitle {
  margin-top: 10px;
  font-size: 15px;
  opacity: 0.82;
}

.sld-onb-tips {
  margin-top: 12px;
  font-size: 13px;
  opacity: 0.7;
}

.sld-onb-input {
  margin-top: 18px;
}

.sld-onb-illustration {
  width: 100%;
  max-width: 100%; /* ✅ fill the right half */
  max-height: 360px;
  object-fit: contain;
}

/* ✅ Info items list (Airbnb intro style) */
.sld-onb-items {
  width: 100%;
  max-width: 100%; /* ✅ fill the right half */
  display: grid;
  gap: 0;
}

.sld-onb-items__row {
  position: relative;
  padding: 18px 6px;
}

.sld-onb-items__left {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  min-width: 0;

  /* ✅ reserve space so text never goes under the right image */
  padding-right: 110px;
}

.sld-onb-items__num {
  width: 18px;
  flex: 0 0 auto;
  font-weight: 900;
  font-size: 14px;
  opacity: 0.9;
  line-height: 1.4;
}

.sld-onb-items__texts {
  min-width: 0;
  flex: 1 1 auto;
}

.sld-onb-items__title {
  font-weight: 900;
  font-size: 16px;
  line-height: 1.25;
}

.sld-onb-items__subtitle {
  margin-top: 6px;
  font-size: 14px;
  opacity: 0.78;
  line-height: 1.45;
}

.sld-onb-items__right {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 96px;
  display: flex;
  justify-content: flex-end;
}

.sld-onb-items__img {
  width: 82px;
  height: 82px;
  object-fit: contain;
  display: block;
}

.sld-onb-items__img-fallback {
  width: 82px;
  height: 82px;
  display: grid;
  place-items: center;
  opacity: 0.2;
  font-weight: 900;
}

.sld-onb-items__sep {
  position: absolute;
  left: 18px;
  right: 0;
  bottom: 0;
  height: 1px;
  background: rgba(0, 0, 0, 0.08);
}

/* Layout variations */
.sld-onb-slide.-layout-split_left {
  .sld-onb-slide__content {
    order: 2;
  }
  .sld-onb-slide__media {
    order: 1;
  }
}

.sld-onb-slide.-layout-center {
  padding: 28px 18px;

  .sld-onb-slide__inner {
    grid-template-columns: 1fr;
  }

  .sld-onb-slide__content {
    max-width: 720px;
    margin: 0 auto;
    text-align: center;
  }

  .sld-onb-slide__media {
    margin-top: 16px;
  }
}

.sld-onb-slide.-layout-media_top {
  .sld-onb-slide__inner {
    grid-template-columns: 1fr;
  }

  .sld-onb-slide__media {
    order: 1;
    margin-bottom: 14px;
  }

  .sld-onb-slide__content {
    order: 2;
    max-width: 720px;
    margin: 0 auto;
  }
}

.sld-onb-slide.-layout-media_bottom {
  .sld-onb-slide__inner {
    grid-template-columns: 1fr;
  }

  .sld-onb-slide__content {
    order: 1;
    max-width: 720px;
    margin: 0 auto;
  }

  .sld-onb-slide__media {
    order: 2;
    margin-top: 14px;
  }
}

@media (max-width: 900px) {
  .sld-onb-slide {
    padding: 22px 14px;

    &__inner {
      grid-template-columns: 1fr !important;
    }

    &__media {
      margin-top: 12px;
      justify-content: flex-start;
    }
  }

  .sld-onb-title {
    font-size: 26px;
  }

  .sld-onb-items__left {
    padding-right: 0; /* ✅ no overlay risk on mobile layout */
  }

  .sld-onb-items__right {
    position: static;
    transform: none;
    width: auto;
    justify-content: flex-start;
    margin-top: 10px;
  }

  .sld-onb-items__img,
  .sld-onb-items__img-fallback {
    width: 64px;
    height: 64px;
  }

  .sld-onb-items__sep {
    left: 0;
  }
}
</style>