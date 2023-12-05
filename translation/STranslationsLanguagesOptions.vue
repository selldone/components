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
  <div v-if="languages?.length" class="d-flex align-center">
    <s-fade-scroll class="flex-grow-1">
      <div class="d-flex">
        <v-btn
          key="default"
          @click="select(null)"
          :depressed="!!value"
          :dark="!value"
          :color="!value ? 'primary' : undefined"
          class="ma-1"
        >
          <div class="d-flex flex-column">
            {{ shop_default_language }}
            <span class="tnt small">{{ $t("global.commons.default") }}</span>
          </div>
        </v-btn>

        <v-btn
          v-for="language in languages"
          :key="language"
          @click="select(language)"
          :depressed="language !== value"
          :dark="language === value"
          :color="language === value ? 'primary' : undefined"
          class="ma-1"
        >
          <div class="d-flex flex-column">
            <span>
              {{ language }}
              <v-scale-transition>
                <v-icon
                  v-if="availableTranslations?.includes(language)"
                  :color="language !== value ? 'green' : '#ff'"
                  x-small
                  class="ms-1"
                  >check_circle</v-icon
                >
              </v-scale-transition>
            </span>
            <span class="tnt small">{{ getLanguageName(language) }}</span>
          </div>
        </v-btn>
      </div>
    </s-fade-scroll>

    <s-smart-menu
      v-if="!!value"
      :items="[
        {
          title: `Remove ${getLanguageName(value)} translation`,
          icon: 'delete',
          click: () =>
            openDeleteAlert(() => {
              $emit('delete', value);
            }),
        },
      ]"
    >
    </s-smart-menu>
  </div>
</template>

<script>
import { ShopOptionsHelper } from "@core/helper/shop/ShopOptionsHelper";
import SFadeScroll from "@components/ui/fade-scroll/SFadeScroll.vue";
import SSmartMenu from "@components/smart/SSmartMenu.vue";

export default {
  name: "STranslationsLanguagesOptions",
  components: { SSmartMenu, SFadeScroll },
  props: {
    shop: { required: true, type: Object },
    value: {},
    availableTranslations: { type: Array },
  },
  data: () => ({
    dialog: false,
  }),

  computed: {
    languages() {
      return ShopOptionsHelper.GetLanguages(this.shop).filter(
        (l) => l !== this.shop_default_language
      );
    },
    shop_default_language() {
      return this.shop.language;
    },
  },

  methods: {
    select(language) {
      this.$emit("input", language);
      this.$nextTick(() => {
        this.$emit("change", language);
      });
    },
  },
};
</script>

<style scoped></style>
