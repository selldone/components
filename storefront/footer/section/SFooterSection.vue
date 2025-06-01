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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div  v-if="custom_footer_code">
    <component
      :is="generated_component"
      v-dynamic-scripts="true"
    ></component>
  </div>
  <v-sheet
    v-else-if="!disabled"
    :class="{ '-dark': dark, '-rtl': $vuetify.locale.isRtl }"
    :color="dark ? ThemeColorDeepDark : '#fff'"
    :style="{
      '--color-link': dark ? '#fff' : '#000',
      '--color-hover-bg': dark ? '#00000033' : '#fafafa',
    }"
    :theme="dark ? 'dark' : 'light'"
    class="s--storefront-primary-footer"
  >
    <v-container style="max-width: 1520px">
      <!--- ================= Info ================= --->
      <v-row class="mt-0">
        <v-col
          :md="sections_count > 1 ? 8 : sections_count ? 10 : 12"
          class="text-start pl-3 pr-3"
          cols="12"
          sm="12"
        >
          <h3 style="font-size: 32px; letter-spacing: -0.4px; font-weight: 900">
            {{ $shop.title }}
          </h3>
          <p class="mt-3 text-justify">
            {{ $shop.description }}
          </p>

          <!-- =――――――――――――――――――――― Social links ――――――――――――――――――――― -->
          <s-storefront-social-buttons
            class="my-3"
            parallax
          ></s-storefront-social-buttons>
        </v-col>

        <v-col
          v-if="sections_count"
          :md="sections_count > 1 ? 4 : 2"
          class="mb-4 d-flex"
          cols="12"
          sm="12"
        >
          <s-footer-section-box
            :pack="footer.sec1"
            :style="`width: ${90 / sections_count}%;`"
          ></s-footer-section-box>
          <s-footer-section-box
            :pack="footer.sec2"
            :style="`width: ${90 / sections_count}%;`"
          ></s-footer-section-box>
          <s-footer-section-box
            :pack="footer.sec3"
            :style="`width: ${90 / sections_count}%;`"
          ></s-footer-section-box>
        </v-col>
      </v-row>

      <!--- ================= Menu ================= --->
      <s-footer-section-menu class="mb-4"></s-footer-section-menu>

      <!--- ================= Contact ================= --->
      <s-footer-section-contact></s-footer-section-contact>

      <!--- ================= Currency / Language ================= --->
      <div class="mt-6">
        <v-row class="text-start my-2" justify="end" no-gutters>
          <!--- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Select  Currency ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ --->
          <u-currency-selector
            v-if="$shop.currencies?.length > 1"
            :shop="$shop"
            class="ma-2"
            flag-mode
            hide-details
            variant="outlined"
            @change="
              () => {
                onChangeUserSelectedCurrency();
              }
            "
          />

          <!--- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Select  Language ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ --->

          <s-language-selector
            class="ma-2"
            hide-details
            variant="outlined"
          ></s-language-selector>
        </v-row>
      </div>

      <!--- ================= Bottom ================= --->

      <v-row>
        <v-col class="mt-2 px-2" cols="12">
          <s-footer-section-copyright class="mt-3">
          </s-footer-section-copyright>

          <p class="mt-3 text-subtitle-2">
            <router-link
              :to="{
                name: window.$storefront.routes.SHOP_PROFILE_PAGE_PRIVACY,
              }"
              class="mx-2"
            >
              {{ $t("footer.privacy") }}
            </router-link>

            |
            <router-link
              :to="{ name: window.$storefront.routes.SHOP_PROFILE_PAGE_TERMS }"
              class="mx-2"
            >
              {{ $t("footer.term_of_use") }}
            </router-link>
          </p>

          <s-footer-section-gdpr class="ma-2"></s-footer-section-gdpr>

          <s-footer-section-selldone class="ma-2"></s-footer-section-selldone>
        </v-col>
      </v-row>
    </v-container>
  </v-sheet>
</template>

<script lang="ts">
import UCurrencySelector from "../../../ui/currency/selector/UCurrencySelector.vue";
import SStorefrontSocialButtons from "../../../storefront/social/SStorefrontSocialButtons.vue";
import SLanguageSelector from "../../../storefront/language/selector/SLanguageSelector.vue";
import SFooterSectionSelldone from "@selldone/components-vue/storefront/footer/section/selldone/SFooterSectionSelldone.vue";
import SFooterSectionGdpr from "@selldone/components-vue/storefront/footer/section/gdpr/SFooterSectionGdpr.vue";
import SFooterSectionBox from "@selldone/components-vue/storefront/footer/section/box/SFooterSectionBox.vue";
import SFooterSectionMenu from "@selldone/components-vue/storefront/footer/section/menu/SFooterSectionMenu.vue";
import SFooterSectionContact from "@selldone/components-vue/storefront/footer/section/contact/SFooterSectionContact.vue";
import SFooterSectionCopyright from "@selldone/components-vue/storefront/footer/section/copyright/SFooterSectionCopyright.vue";
import TemplateMixin from "@selldone/components-vue/mixin/template/TemplateMixin.ts";
import DynamicScriptDirective from "@selldone/components-vue/directives/script/DynamicScriptDirective.ts";
import { VueComponentBuilder } from "@selldone/components-vue/storefront/custom/VueComponentBuilder.ts";

export default {
  name: "SFooterSection",
  mixins: [TemplateMixin],
  directives: {
    "dynamic-scripts": DynamicScriptDirective,
  },
  components: {
    SFooterSectionCopyright,
    SFooterSectionContact,
    SFooterSectionMenu,
    SFooterSectionBox,
    SFooterSectionGdpr,
    SFooterSectionSelldone,
    SLanguageSelector,

    SStorefrontSocialButtons,
    UCurrencySelector,
  },
  inject: ["$shop"],
  props: {
    dark: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({}),

  computed: {
    theme() {
      return this.$shop.theme;
    },
    footer() {
      return this.$shop.footer;
    },
    sections_count() {
      let out = 0;
      if (this.footer && this.footer.sec1) out++;
      if (this.footer && this.footer.sec2) out++;
      if (this.footer && this.footer.sec3) out++;

      return out;
    },

    menu_footer() {
      return this.$shop.menus.find((it) => it.type === "FOOTER");
    },
    disabled() {
      return this.menu_footer && this.menu_footer.enable === false;
    },

    custom_footer_code() {
      return this.theme?.custom_footer_code;
    },

    generated_component() {
      return new VueComponentBuilder().create(this.custom_footer_code, this);
    },

  },

  watch: {},

  created() {},

  methods: {},
};
</script>

<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */

.s--storefront-primary-footer {
  position: relative;
  z-index: 1;
  width: 100%;
  // background-color: var(--theme-deep-dark) ;
  color: #fff;
  min-height: 240px;
  //padding-top: 0px;
  padding-bottom: 38px;
  padding-top: 12px;

  h3 {
    font-size: 1.3rem;
    font-weight: 400;
  }

  hr {
    background-image: linear-gradient(
      to right,
      #f3e7e9 0%,
      #e3eeff 99%,
      #e3eeff 100%
    );
    height: 1px;
    border: 0;
  }
}
</style>
