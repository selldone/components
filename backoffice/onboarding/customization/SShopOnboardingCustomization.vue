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
  <v-card class="s--shop-onboarding-customization" color="transparent" flat>
    <v-card-text>
      <s-widget-header title="Tour" icon="movie_filter"> </s-widget-header>
      <p class="typo-body flex-grow-1">
        Discover what's possible here that isn't anywhere else.
      </p>

      <b-shop-onboarding-tour :shop="shop"></b-shop-onboarding-tour>

      <hr class="my-5" />

      <s-widget-header
        :title="$t('onboarding.customize.template.title')"
        icon="auto_awesome_motion"
      >
      </s-widget-header>

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
      >
        <div class="d-flex px-3 py-10">
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

      <s-widget-header
        :title="$t('onboarding.customize.colors.title')"
        icon="palette"
      >
      </s-widget-header>

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
          <div class="me-2">
            <u-color-circle :color="color_light" class="mx-1"></u-color-circle>
            <u-color-circle :color="color_dark" class="mx-1"></u-color-circle>
            <u-color-circle
              :color="color_deep_dark"
              class="mx-1"
            ></u-color-circle>
          </div>

          {{ $t("onboarding.customize.colors.action") }}
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import UFadeScroll from "../../../ui/fade-scroll/UFadeScroll.vue";
import LTemplateCard from "@selldone/page-builder/components/templates/card/LTemplateCard.vue";
import UColorCircle from "../../../ui/color/circle/UColorCircle.vue";
import SWidgetHeader from "@selldone/components-vue/ui/widget/header/SWidgetHeader.vue";
import BShopOnboardingTour from "@selldone/components-vue/backoffice/onboarding/customization/BShopOnboardingTour.vue";

export default {
  name: "SShopOnboardingCustomization",
  components: {
    BShopOnboardingTour,
    SWidgetHeader,
    UColorCircle,
    LTemplateCard,
    UFadeScroll,
  },
  props: {
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
  }),

  computed: {
    theme() {
      return this.shop.theme;
    },

    color_light() {
      return this.theme && this.theme.color_light
        ? this.theme.color_light
        : "#70557e";
    },

    color_dark() {
      return this.theme && this.theme.color_dark
        ? this.theme.color_dark
        : "#3a2c41";
    },

    color_deep_dark() {
      return this.theme && this.theme.color_deep_dark
        ? this.theme.color_deep_dark
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
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
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
}
</style>
