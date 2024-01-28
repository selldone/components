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
  <div>


    <v-text-field
      :model-value="selected_language_object.title"
      :hide-details="!messages"
      :messages="messages"
      :style="{ 'max-width': maxWidth }"
      :variant="variant?variant:outlined?'outlined':'underlined'"
      flat
      :rounded="rounded"
      :density="dense? 'compact':undefined"
      :outlined="outlined"
      :bg-color="backgroundColor"
      @click.stop="show_dialog = true"
      readonly
      prepend-inner-icon="translate"
    >
    </v-text-field>

    <s-languages-dialog
      v-model="show_dialog"
      v-model:selected-language="select_language"
    ></s-languages-dialog>

    <component
      :is="$vuetify.display.xsOnly ? 'v-bottom-sheet' : 'v-dialog'"
      v-model="show_warning"
      max-width="1080"
      width="90vw"
      scrollable
      :overlay-opacity="0.8"
    >
      <v-card
        color="#f9f9f9"
        :rounded="$vuetify.display.xsOnly ? 't-xl b-0' : 'lg'"
        flat
      >
        <v-card-title class="text-capitalize" style="min-height: 100px">
          <v-btn icon="" variant="flat" @click="reject_change()" color="#fff"
            ><v-icon>close</v-icon></v-btn
          >
        </v-card-title>
        <v-card-text
          class="d-flex flex-column"
          style="color: #222222"
          :style="
            $vuetify.display.xsOnly ? '' : 'height: 60vh;max-height: 460px'
          "
        >
          <div
            class="absolute-top-center mt-6 typo-body font-weight-black text-black d-flex d-sm-block flex-column align-center"
          >
            <b
              :title="$t('global.commons.language')"
              class="pa-2 me-2 rounded-lg d-inline-block"
              style="border: solid 3px #333"
              ><v-icon class="mx-1" color="#333">translate</v-icon></b
            >
            <span
              >Business
              <span class="bg-le-cocktail text-gradient font-weight-normal"
                >OS</span
              ></span
            >
          </div>

          <v-spacer></v-spacer>

          <div style="max-width: 640px" class="mx-auto mt-12 mt-sm-5">
            <h2
              class="text-center font-weight-bold lhn text-capitalize"
              :class="$vuetify.display.xsOnly ? 'text-h4' : 'text-h2'"
            >
              {{ $t("home.select_language_dialog_title") }}
            </h2>
            <p class="typo-body my-3">
              Make your local community rich.
            </p>
          </div>

          <div class="my-2">
            <flag
              v-for="c in selected_language_object.countries"
              :key="c"
              :iso="c"
              :squared="false"
              class="m-1"
            />
          </div>

          <div class="widget-buttons">
            <v-btn
              size="x-large"
              href="https://github.com/selldone/translate"
              target="_blank"
              variant="outlined"
              class="my-3 tnt"
            >
              <v-icon class="me-1">fa:fab fa-github</v-icon>
              Help us in translation {{ selected_language_object.title }}
            </v-btn>
          </div>
          <v-spacer></v-spacer>
        </v-card-text>
        <v-card-actions>
          <div class="widget-buttons">
            <v-btn size="x-large"  variant="text" @click="reject_change()">
              <v-icon class="me-1">close</v-icon>
              {{ $t("global.actions.cancel") }}
            </v-btn>

            <v-btn size="x-large" color="primary" @click="accept_change()" >
              <v-icon class="me-1">check</v-icon>
              Let's go
              {{ selected_language_object.title }} *
            </v-btn>
          </div>
        </v-card-actions>
        <small class="mb-2">* Not recommended for now!</small>
      </v-card>
    </component>
  </div>
</template>

<script>
import { Language } from "@core/enums/language/Language";
import { SetupService } from "@core/server/SetupService";
import SLanguagesDialog from "./SLanguagesDialog.vue";

export default {
  name: "SAppLanguageSelector",
  components: { SLanguagesDialog },
  props: {
    autoSmall: {
      type: Boolean,
      default: false,
    },
    messages: {},
    variant:{},
    dense: {
      type: Boolean,
      default: false,
    },
    maxWidth: {
      default: "220px",
    },
    outlined: {
      type: Boolean,
      default: false,
    },
    rounded: {
      type: Boolean,
      default: false,
    },
    backgroundColor: {},
  },

  data: () => ({
    select_language: window.$language.local,

    prevent_update: false,

    show_warning: false,
    old_selected: null,

    show_dialog: false,

    show_flags: false,
  }),

  computed: {
    languages() {
      return Object.values(Language).filter(
        (i) => i.vip || !SetupService.LocalServiceCountry()
      );
    },

    selected_language_object() {
      let out = Language[this.select_language];
      if (!out) return Language.en;

      return out;
    },
  },
  watch: {
    select_language(local, old) {
      if (this.prevent_update) return;

      this.old_selected = old;
      console.log("--select_language--", local);

      this.show_warning =
        this.selected_language_object && !this.selected_language_object.human;

      if (!this.show_warning) {
        this.setCurrentLanguage(local, true, true);
      }
    },
    "$i18n.locale"(value) {
      this.prevent_update = true;
      this.select_language = value;
      this.$nextTick(() => {
        this.prevent_update = false;
      });
    },
  },

  created() {
    this.select_language = window.$language.local;
  },

  methods: {
    accept_change() {
      this.setCurrentLanguage(this.select_language, true, true);
      this.show_warning = false;
    },
    reject_change() {
      this.select_language = Language.en;
      this.show_warning = false;
    },
  },
};
</script>

<style scoped></style>
