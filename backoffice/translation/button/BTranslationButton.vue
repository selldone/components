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
  <div v-if="languages?.length">
    <v-btn
      :title="`Set other languages for ${getName(translationKey)}`"
      class="position-relative"
      icon
      size="var(--append-inner-button-size)"
      variant="text"
      @click="showTranslations()"
    >
      <v-icon>translate</v-icon>
      <div
        v-if="number_translated > 0"
        :style="{
          '--percent':
            Math.round((number_translated * 100) / languages.length) + '%',
          '--color':
            number_translated >= languages.length ? '#4CAF50' : '#0b6aaa',
        }"
        class="s-lang-completed"
      ></div>
    </v-btn>
    <v-bottom-sheet
      v-model="dialog"
      content-class="no-shadow-dialog"
      max-width="860"
      scrollable
      width="90%"
    >
      <v-card class="rounded-t-xl rounded-b-0">
        <v-card-title class="d-flex align-center">
          <v-icon class="me-1" color="#333">translate</v-icon>
          {{ $t("translation_button.header") }} | {{ label }}
          <v-spacer></v-spacer>
          <v-btn
            v-if="defaultValue && number_translated_in_pack < languages.length"
            :loading="busy_auto_translate"
            class="rounded-18px"
            color="primary"
            size="large"
            @click="is_premium ? autoTranslate() : showNeedSubscribePremium()"
          >
            <v-icon class="me-1">g_translate</v-icon>
            <div class="d-block text-start">
              {{ $t("translation_button.auto_action") }}

              <span class="d-block small tnt mt-1"
                ><v-icon size="x-small">star</v-icon>
                {{ $t("translation_button.premium_user_only") }}
              </span>
            </div>
          </v-btn>
        </v-card-title>
        <v-card-text class="text-start">
          <p v-if="defaultValue" class="mb-3">
            <b>{{ $t("global.commons.default") }} :</b>
            {{ defaultValue }}
          </p>
          <div class="max-widget-width mx-auto">
            <div v-for="language in languages" :key="language" class="py-2">
              <v-text-field
                v-if="isStringMode"
                v-model="pack[language]"
                :label="getLanguageName(language)"
                hide-details
                variant="outlined"
              >
                <template v-slot:append-inner>
                  <v-scale-transition>
                    <v-icon v-if="pack[language]" color="green"
                      >check_circle
                    </v-icon>
                  </v-scale-transition>
                </template>
              </v-text-field>
            </div>
          </div>
        </v-card-text>

        <v-card-actions>
          <div class="widget-buttons">
            <v-btn size="x-large" variant="text" @click="dialog = false">
              <v-icon start>close</v-icon>
              {{ $t("global.actions.close") }}
            </v-btn>

            <v-btn
              :loading="busy"
              color="primary"
              size="x-large"
              variant="elevated"
              @click="save()"
            >
              <v-icon start>save</v-icon>
              {{ $t("global.actions.save") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script>
import { ShopOptionsHelper } from "@selldone/core-js/helper/shop/ShopOptionsHelper";

export default {
  name: "BTranslationButton",
  components: {},
  emits: ["update:translations"],
  props: {
    shop: { required: true, type: Object },
    label: {},
    defaultValue: {},
    translations: {
      type: Object,
      /**
       * structure: {  en:{title:'',title_en:'',...}  , dk:{title:'',title_en:'',...}  }
       */
    },
    translationKey: {
      required: true,
      type: String,
    },
    url: {
      required: true,
      type: String,
    },
    isStringMode: {
      default: false,
      type: Boolean,
    },
    isProductSpecMode: {
      default: false,
      type: Boolean,
    },
  },
  data: () => ({
    dialog: false,
    busy: false,

    pack: {},

    busy_auto_translate: false,
  }),

  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    is_premium() {
      return !!this.USER().premium;
    },

    languages() {
      return ShopOptionsHelper.GetLanguages(this.shop).filter(
        (l) => l !== this.shop_default_language,
      );
    },
    shop_default_language() {
      return this.shop.language;
    },
    translated_languages() {
      let out = [];

      this.languages.forEach((lang) => {
        if (this.translations?.hasOwnProperty(lang)) {
          const _translation = this.translations[lang];
          if (
            _translation[this.translationKey] &&
            _translation[this.translationKey].trim() !== ""
          ) {
            out.push(lang);
          }
        }
      });

      return out;
    },

    number_translated() {
      return this.translated_languages.length;
    },

    number_translated_in_pack() {
      return this.getTranslatedLanguagesInPack().length;
    },
  },

  methods: {
    showTranslations() {
      this.pack = {};

      // Initialize:
      this.languages.forEach((_lang) => {
        this.pack[_lang] = null;
      });

      // Set value from existing translations:
      if (this.translations && !Array.isArray(this.translations)) {
        Object.keys(this.translations).forEach((_lang) => {
          const _value = this.translations[_lang];
          this.pack[_lang] = _value ? _value[this.translationKey] : null;
        });
      }

      this.dialog = true;
    },
    save() {
      this.busy = true;
      axios
        .put(this.url, {
          pack: this.pack,
        })
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.$emit("update:translations", data.translations);
            this.showSuccessAlert(null, "Translation successfully saved!");
            this.dialog = false;
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },

    getTranslatedLanguagesInPack() {
      const out = [];

      Object.keys(this.pack).forEach((_lang) => {
        if (this.pack[_lang]) {
          out.push(_lang);
        }
      });
      return out;
    },

    autoTranslate() {
      const to_languages = this.languages.filter(
        (_lang) => !this.getTranslatedLanguagesInPack().includes(_lang),
      );
      if (!to_languages.length) {
        this.pack = Object.assign({}, this.pack); // Force update!
        return;
      }

      this.busy_auto_translate = true;
      axios
        .post(
          this.IS_VENDOR_PANEL
            ? window.VAPI.POS_MY_VENDOR_TRANSLATE(this.$route.params.vendor_id)
            : window.API.POS_SHOP_TRANSLATE(this.shop.id),
          {
            text: this.defaultValue,
            from_language: this.shop_default_language,
            to_languages: to_languages, // Just not translated!
          },
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            Object.keys(data.translates).forEach((lang) => {
              this.pack[lang] = data.translates[lang];
            });
            this.pack = Object.assign({}, this.pack); // Force update!
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_auto_translate = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.s-lang-completed {
  position: absolute;
  right: -2px;
  top: 2%;
  bottom: 2%;
  background-color: #eee;
  border-radius: 2px;
  width: 3px;
  height: 96%;
  overflow: hidden;

  &:after {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    content: "";
    background-color: var(--color);
    height: var(--percent);
  }
}
</style>
