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
  <v-card
    class="s--shop-onboarding-customization"
    :class="{ 's--shop-onboarding-customization--modern text-start': modern }"
    color="transparent"
    flat
  >
    <div v-if="modern" class="s--shop-onboarding-customization__modern">
      <p class="s--shop-onboarding-customization__intro">
        {{ $t("onboarding.modern.customize.intro") }}
      </p>
      <article
        class="s--shop-onboarding-customization__level"
        aria-labelledby="onboarding-customize-pages"
      >
        <header class="s--shop-onboarding-customization__heading">
          <span
            class="s--shop-onboarding-customization__number s--shop-onboarding-customization__number--primary"
            aria-hidden="true"
            >{{ $t("onboarding.modern.customize.level_1") }}</span
          >
          <div>
            <h4
              id="onboarding-customize-pages"
              class="s--shop-onboarding-customization__level-title"
            >
              {{ $t("onboarding.modern.customize.pages.title") }}
            </h4>
            <p class="s--shop-onboarding-customization__meta">
              <span
                ><v-icon size="13">ads_click</v-icon
                >{{ $t("onboarding.modern.customize.pages.human_ai") }}</span
              >
              <span>{{
                $t("onboarding.modern.customize.pages.visual_builder")
              }}</span>
            </p>
          </div>
          <v-btn
            :to="{ name: 'LandingTemplatesListPage' }"
            target="_blank"
            rel="noopener noreferrer"
            class="sd-modern-button sd-modern-button--inline"
            color="primary"
            variant="text"
          >
            {{ $t("onboarding.modern.customize.browse") }}
            <v-icon end size="15">north_east</v-icon>
          </v-btn>
        </header>
        <p class="s--shop-onboarding-customization__copy">
          {{ $t("onboarding.modern.customize.pages.description") }}
        </p>
        <div
          v-if="templates?.length"
          class="s--shop-onboarding-customization__templates"
        >
          <div
            v-for="template in templates.slice(0, 2)"
            :key="template.id"
            class="s--shop-onboarding-customization__template"
          >
            <v-img
              :src="getShopImagePath(template.image)"
              width="28"
              height="32"
              cover
              class="s--shop-onboarding-customization__thumbnail"
              aria-hidden="true"
            >
              <template #placeholder
                ><v-icon size="22">layers</v-icon></template
              >
              <template #error><v-icon size="22">layers</v-icon></template>
            </v-img>
            <div class="s--shop-onboarding-customization__template-copy">
              <h5 class="s--shop-onboarding-customization__template-name">
                {{ template.name }}
              </h5>
              <p>
                {{ $t("onboarding.modern.customize.template")
                }}<template v-if="template.premium">
                  · {{ $t("onboarding.modern.customize.premium") }}</template
                >
              </p>
            </div>
            <v-btn
              v-if="template.preview"
              :href="template.preview"
              target="_blank"
              rel="noopener noreferrer"
              class="sd-modern-button sd-modern-button--inline s--shop-onboarding-customization__preview"
              color="primary"
              variant="text"
            >
              {{ $t("global.commons.preview") }}
              <v-icon end size="14">north_east</v-icon>
            </v-btn>
          </div>
        </div>
        <div
          v-if="busy_fetch"
          class="s--shop-onboarding-customization__loading"
          role="status"
          :aria-label="$t('global.commons.loading')"
        >
          <v-progress-circular
            color="primary"
            indeterminate
            size="24"
            width="2"
          />
        </div>
        <div class="s--shop-onboarding-customization__brand">
          <div>
            <h5 class="s--shop-onboarding-customization__label">
              {{ $t("onboarding.modern.customize.theme") }}
            </h5>
            <p>{{ $t("onboarding.modern.customize.theme_description") }}</p>
          </div>
          <v-btn
            :to="{ name: 'BPageShopSettingTheme' }"
            target="_blank"
            rel="noopener noreferrer"
            class="sd-modern-button sd-modern-button--inline"
            color="primary"
            variant="text"
          >
            <span
              class="s--shop-onboarding-customization__palette"
              aria-hidden="true"
            >
              <u-color-circle
                :color="color_light"
                :size="12"
                border-less
              /><u-color-circle
                :color="color_dark"
                :size="12"
                border-less
              /><u-color-circle
                :color="color_deep_dark"
                :size="12"
                border-less
              />
            </span>
            {{ $t("onboarding.modern.customize.theme_action") }}
            <v-icon end size="15">north_east</v-icon>
          </v-btn>
        </div>
        <div class="s--shop-onboarding-customization__tools">
          <v-btn
            :to="{ name: 'BPageLandingEditor', params: { page_id: 'new' } }"
            target="_blank"
            rel="noopener noreferrer"
            class="sd-modern-button sd-modern-button--inline"
            color="primary"
            variant="text"
          >
            <v-icon start size="15">web</v-icon>
            {{ $t("onboarding.modern.customize.pages.open_builder") }}
            <v-icon end size="15">north_east</v-icon>
          </v-btn>
        </div>
      </article>
      <article
        v-for="path in advancedPaths"
        :key="path.id"
        class="s--shop-onboarding-customization__level"
        :aria-labelledby="`onboarding-customize-${path.id}`"
      >
        <header class="s--shop-onboarding-customization__heading">
          <span
            class="s--shop-onboarding-customization__number"
            aria-hidden="true"
            >{{ $t(`onboarding.modern.customize.level_${path.number}`) }}</span
          >
          <div>
            <h4
              class="s--shop-onboarding-customization__level-title"
              :id="`onboarding-customize-${path.id}`"
            >
              {{ $t(`onboarding.modern.customize.${path.id}.title`) }}
            </h4>
            <p class="s--shop-onboarding-customization__meta">
              <span
                ><v-icon size="13">auto_awesome</v-icon
                >{{ $t("onboarding.modern.customize.build_ai") }}</span
              >
              <span>{{ $t("onboarding.modern.customize.advanced") }}</span>
            </p>
          </div>
          <v-btn
            class="sd-modern-button s--shop-onboarding-customization__guide"
            variant="outlined"
            aria-haspopup="dialog"
            @click="$emit('ai-build', path.id, $event)"
          >
            {{ $t(`onboarding.modern.customize.${path.id}.action`) }}
            <v-icon
              end
              size="15"
              class="s--shop-onboarding-customization__forward"
              >arrow_forward</v-icon
            >
          </v-btn>
        </header>
        <p class="s--shop-onboarding-customization__copy">
          {{ $t(`onboarding.modern.customize.${path.id}.description`) }}
        </p>
        <div
          v-if="path.id === 'custom'"
          class="s--shop-onboarding-customization__tools"
        >
          <div class="s--shop-onboarding-customization__frameworks">
            <span v-for="framework in frameworks" :key="framework.name">
              <v-icon
                :icon="framework.icon"
                size="17"
                :class="`s--shop-onboarding-customization__${framework.name.toLowerCase()}`"
              />
              {{ framework.name }}
            </span>
            <span>{{ $t("onboarding.modern.customize.any_framework") }}</span>
          </div>
        </div>
        <div class="s--shop-onboarding-customization__tools">
          <a
            :href="path.repository"
            class="sd-modern-button sd-modern-button--inline s--shop-onboarding-customization__repository"
            target="_blank"
            rel="noopener noreferrer"
          >
            <v-icon size="14">fa:fab fa-github</v-icon>
            {{ $t(`onboarding.modern.customize.${path.id}.repository`) }}
            <v-icon size="14">north_east</v-icon>
          </a>
        </div>
      </article>
      <footer class="s--shop-onboarding-customization__footer">
        <v-icon size="14">layers</v-icon
        ><span>{{ $t("onboarding.modern.customize.footer") }}</span>
      </footer>
    </div>
    <v-card-text v-else>
      <u-widget-header
        :title="$t('onboarding.customize.template.title')"
        icon="auto_awesome_motion"
      >
      </u-widget-header>

      <div class="d-flex align-center">
        <p class="typo-body flex-grow-1">
          {{ $t("onboarding.customize.template.msg") }}
        </p>

        <v-img
          :src="require('../assets/template.svg')"
          class="m-2 imgi"
        ></v-img>
      </div>

      <u-fade-scroll
        v-if="templates?.length"
        drag-scroll
        show-arrow
        stick-class="min-width-250"
        class="mx-n3"
      >
        <div class="d-flex px-3 py-10 justify-start">
          <l-template-card
            v-for="template in templates"
            :key="template.id"
            :template="template"
            class="me-2"
            min-width="250"
            size="default"
            variant="flat"
          ></l-template-card>
        </div>
      </u-fade-scroll>
      <div v-if="busy_fetch" class="py-16 text-center">
        <v-progress-circular
          color="#999"
          indeterminate
          size="100"
          width="4"
        ></v-progress-circular>
      </div>

      <div class="widget-buttons">
        <v-btn
          :to="{ name: 'LandingTemplatesListPage' }"
          color="#000"
          size="x-large"
          target="_blank"
          variant="elevated"
        >
          {{ $t("onboarding.customize.template.action") }}
          <v-icon end>open_in_new</v-icon>
        </v-btn>
      </div>

      <hr class="my-5" />

      <u-widget-header
        :title="$t('onboarding.customize.tour.title')"
        icon="movie_filter"
      ></u-widget-header>
      <p class="typo-body flex-grow-1">
        {{ $t("onboarding.customize.tour.subtitle") }}
      </p>

      <b-shop-onboarding-tour
        :shop="shop"
        class="mx-n3"
      ></b-shop-onboarding-tour>

      <hr class="my-5" />

      <u-widget-header
        :title="$t('onboarding.customize.colors.title')"
        icon="palette"
      >
      </u-widget-header>

      <div class="d-flex align-center">
        <p class="typo-body flex-grow-1">
          {{ $t("onboarding.customize.colors.msg") }}
        </p>
        <v-img :src="require('../assets/pantone.svg')" class="m-2 imgi"></v-img>
      </div>

      <div class="widget-buttons">
        <v-btn
          :to="{ name: 'BPageShopSettingTheme' }"
          color="#000"
          size="x-large"
        >
          <u-color-circle :color="color_light" class="me-1"></u-color-circle>
          <u-color-circle :color="color_dark" class="me-1"></u-color-circle>
          <u-color-circle
            :color="color_deep_dark"
            class="me-1"
          ></u-color-circle>

          {{ $t("onboarding.customize.colors.action") }}
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import UFadeScroll from "../../../ui/fade-scroll/UFadeScroll.vue";
import LTemplateCard from "@selldone/page-builder/components/templates/card/LTemplateCard.vue";
import UColorCircle from "../../../ui/color/circle/UColorCircle.vue";
import UWidgetHeader from "@selldone/components-vue/ui/widget/header/UWidgetHeader.vue";
import BShopOnboardingTour from "@selldone/components-vue/backoffice/onboarding/customization/BShopOnboardingTour.vue";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "SShopOnboardingCustomization",
  mixins: [],
  emits: ["ai-build"],
  components: {
    BShopOnboardingTour,
    UWidgetHeader,
    UColorCircle,
    LTemplateCard,
    UFadeScroll,
  },
  props: {
    modern: { type: Boolean, default: false },
    shop: {
      required: true,
      type: Object,
    },

    timeSeries: {
      required: true,
      type: Object,
    },
  },

  data: () => ({
    dialog_sample: false,

    templates: null,
    busy_fetch: false,
    advancedPaths: [
      {
        id: "layout",
        number: 2,
        repository: "https://github.com/selldone/storefront",
      },
      {
        id: "custom",
        number: 3,
        repository:
          "https://github.com/pajuhaan/selldone-custom-storefront-backoffice-1",
      },
    ],
    frameworks: [
      { name: "React", icon: "fa:fab fa-react" },
      { name: "Angular", icon: "fa:fab fa-angular" },
      { name: "Vue", icon: "fa:fab fa-vuejs" },
    ],
  }),

  computed: {
    theme() {
      return this.shop.theme;
    },

    color_light() {
      return this.theme && this.theme?.color_light
        ? this.theme?.color_light
        : "#70557e";
    },

    color_dark() {
      return this.theme && this.theme?.color_dark
        ? this.theme?.color_dark
        : "#3a2c41";
    },

    color_deep_dark() {
      return this.theme && this.theme?.color_deep_dark
        ? this.theme?.color_deep_dark
        : "#261b2d";
    },
  },

  watch: {},

  methods: {
    fetchHotTemplates() {
      if (window.CACHED_HOT_TEMPLATES) {
        this.templates = window.CACHED_HOT_TEMPLATES;
        return;
      }
      this.templates = [];
      this.busy_fetch = true;
      axios
        .get(window.GAPI.GET_PAGE_BUILDER_TEMPLATES(), {
          params: {
            hot: true,
            limit: 10,
          },
        })
        .then(({ data }) => {
          if (!data.error) {
            this.templates = data.templates;
            window.CACHED_HOT_TEMPLATES = data.templates;
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_fetch = false;
          this.blur = false;
        });
    },
  },

  created() {
    this.fetchHotTemplates();
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
.s--shop-onboarding-customization {
  &--modern {
    min-width: 0;
    font-family: inherit;
    font-size: 13px;
    font-weight: 400;
    line-height: 1.55;
    overflow-wrap: anywhere;

    h4,
    h5,
    p {
      margin: 0;
    }
    .s--shop-onboarding-customization__level-title,
    .s--shop-onboarding-customization__label,
    .s--shop-onboarding-customization__template-name {
      font-family: inherit;
      font-weight: 500;
    }
    .s--shop-onboarding-customization__level-title {
      font-size: 15px;
      line-height: 1.4;
      letter-spacing: -0.1px;
    }
    .s--shop-onboarding-customization__label,
    .s--shop-onboarding-customization__template-name {
      font-size: 13px;
      line-height: 1.5;
    }
    .sd-modern-button {
      --v-btn-height: 36px;
      min-height: 36px;
      height: auto;
      max-width: 100%;
      padding: 7px 11px;
      border-radius: 8px;
      font-family: inherit;
      font-size: 13px;
      font-weight: 500;
      line-height: 1.45;
      letter-spacing: 0;
      white-space: normal;
    }
    .sd-modern-button.sd-modern-button--inline {
      padding-inline: 0;
      font-weight: 400;
    }
    :deep(.v-btn__content) {
      white-space: normal;
    }
  }
  &__intro {
    color: var(--sd-modern-muted);
    padding-block-end: 25px;
  }
  &__level {
    padding-block: 21px;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  &__heading {
    display: grid;
    grid-template-columns: 32px minmax(0, 1fr) auto;
    gap: 12px;
    align-items: start;
  }
  &__guide {
    border-color: var(--sd-modern-border);
  }
  &__number {
    display: grid;
    place-items: center;
    width: 30px;
    height: 30px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 9px;
    color: var(--sd-modern-muted);
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    &--primary {
      color: rgb(var(--v-theme-primary));
      background: rgba(var(--v-theme-primary), 0.06);
      border-color: transparent;
    }
  }
  &__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 12px;
    margin-block-start: 5px !important;
    color: var(--sd-modern-muted);
    font-size: 11px;
    span {
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }
  }
  &__copy {
    max-width: 600px;
    margin-block-start: 12px !important;
    margin-inline-start: 44px !important;
    color: var(--sd-modern-muted);
  }
  &__templates {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin-block-start: 15px;
    margin-inline-start: 44px;
  }
  &__template {
    display: grid;
    grid-template-columns: 28px minmax(0, 1fr) auto;
    align-items: center;
    gap: 5px 11px;
    min-width: 0;
    padding: 11px 12px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 9px;
  }
  &__thumbnail {
    border-radius: 4px;
    color: var(--sd-modern-muted);
  }
  &__template-copy {
    min-width: 0;
    .s--shop-onboarding-customization__template-name {
      font-size: 12px;
    }
    p {
      color: var(--sd-modern-muted);
      font-size: 11px;
    }
  }
  &--modern &__preview.sd-modern-button {
    font-size: 12px;
    padding-block: 3px;
  }
  &__loading {
    display: grid;
    place-items: center;
    min-height: 72px;
    margin-inline-start: 44px;
  }
  &__brand {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding-block-start: 13px;
    margin-inline-start: 44px;
    p {
      color: var(--sd-modern-muted);
      font-size: 12px;
    }
  }
  &__palette {
    :deep(.s--color-circle) {
      padding: 0;
    }
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-inline-end: 7px;
  }
  &__tools {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 9px 21px;
    margin-block-start: 12px;
    margin-inline-start: 44px;
  }
  &__frameworks {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px 19px;
    min-height: 27px;
    color: var(--sd-modern-muted);
    font-size: 12px;
    span {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
  }
  &__react {
    color: #328298;
  }
  &__angular {
    color: #b54a61;
  }
  &__vue {
    color: #398468;
  }
  &--modern &__repository.sd-modern-button {
    justify-content: start;
    gap: 6px;
    min-width: 0;
    color: rgb(var(--v-theme-primary));
    font-size: 12px;
    text-decoration: none;
    &:hover {
      color: rgb(var(--v-theme-primary));
    }
  }
  &__footer {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-block: 16px;
    border-block-start: 1px solid var(--sd-modern-border);
    color: var(--sd-modern-muted);
    font-size: 11px;
  }
  &--modern :is(a, button):focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 3px;
  }
  [dir="rtl"] &__forward,
  .v-locale--is-rtl &__forward {
    transform: scaleX(-1);
  }
}
@media (max-width: 580px) {
  .s--shop-onboarding-customization {
    &__heading {
      grid-template-columns: 28px minmax(0, 1fr);
      gap: 10px;
      > .sd-modern-button {
        grid-column: 2;
        justify-self: start;
        margin-block-start: 4px;
      }
    }
    &__number {
      width: 27px;
      height: 27px;
    }
    &__copy {
      margin-inline-start: 38px !important;
    }
    &__templates {
      grid-template-columns: minmax(0, 1fr);
      margin-inline-start: 38px;
    }
    &__tools,
    &__brand,
    &__loading {
      margin-inline-start: 38px;
    }
    &__brand {
      flex-direction: column;
      align-items: start;
      gap: 4px;
    }
    &__tools {
      gap: 11px;
    }
    &__template {
      padding: 9px;
    }
  }
}
@media (max-width: 600px), (pointer: coarse) {
  .s--shop-onboarding-customization--modern .sd-modern-button {
    --v-btn-height: 44px;
    min-height: 44px;
  }
}
</style>
