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
  <div :style="`max-width: ${maxWidth}`" :class="{ 'v-input': !iconOnly }">
    <!-- v-input : css of widget-box same effect like normal inputs -->
    <!--
  <v-autocomplete
      v-model="select_language"
      :items="languages"
      item-value="code"
      item-text="title"
      :hide-details="hideDetails"
      :return-object="false"
      :style="`max-width: ${maxWidth}`"
      :rounded="rounded"
      :placeholder="
      placeholder ? placeholder : $t('global.placeholders.language')
    "
      :label="label ? label : $t('global.commons.language')"
      :messages="messages"
      :dense="dense"
      :outlined="outlined"
      :filled="filled"
      @change="(v) => $emit('change', v)"
      :readonly="readonly"
      :multiple="multiple"
      :solo="solo"
      :clearable="clearable"
      :color="color"
      :flat="flat"
      :disabled="disabled"
      :background-color="transparent?'transparent':undefined"
  >
    <template v-slot:item="data">
      <span class="px-3">{{ data.item.title }}</span>
    </template>

    <template v-slot:selection="data">
      <span :class="{ 'vertical-block': isVertical }">
        <span class="px-3" v-if="!menu">{{ data.item.title }}</span>
      </span>
    </template>
  </v-autocomplete>
-->

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅ Icon Mode ▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
    <circle-button
      v-if="iconOnly"
      dense
      :color="iconColor"
      :icon="prependInnerIcon"
      :tooltip="selected_language_object?.title"
      @click="readonly ? undefined : showDialog()"
      :title="`Change language | ${selected_language_object?.title}`"
    ></circle-button>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅ Normal Mode ▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <v-text-field
      v-else
      :value="multiple?select_language?.map(l=>getLanguageName(l)).join(', '): selected_language_object?.title"
      :hide-details="hideDetails"
      :rounded="rounded"
      :placeholder="
        placeholder ? placeholder : $t('global.placeholders.language')
      "
      :persistent-placeholder="persistentPlaceholder"
      :label="label ? label : $t('global.commons.language')"
      :messages="messages"
      :dense="dense"
      :outlined="outlined"
      :filled="filled"
      readonly
      :multiple="multiple"
      :solo="solo"
      :clearable="clearable"
      :color="color"
      :flat="flat"
      :disabled="disabled"
      :background-color="transparent ? 'transparent' : undefined"
      @click.native="readonly || disabled ? undefined : showDialog()"
      @click:clear="
        select_language = null;
        $nextTick(() => {
          $emit('change', null);
        });
      "
      :prepend-inner-icon="prependInnerIcon"
      :append-icon="appendIcon"
      :suffix="suffix"
    >
      <template v-slot:append-outer>
        <slot name="append-outer"></slot>
      </template>

    </v-text-field>
    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅ Dialog > Selector ▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <s-languages-dialog
      v-if="dialog_pre"
      v-model="show_dialog"
      :available-languages="availableLanguages"
      :selected-language.sync="select_language"
      @change="
        (val) =>
          $nextTick(() => {
            $emit('change', val);
          })
      "
      :checked-languages="checkedLanguages"
      :multiple="multiple"
    ></s-languages-dialog>
  </div>
</template>

<script>
import { Language } from "../../../../core/enums/language/Language";
import SetupService from "../../../../core/server/SetupService";
import SLanguagesDialog from "./SLanguagesDialog.vue";

export default {
  name: "SLanguageInput",
  components: { SLanguagesDialog },
  props: {
    value: {
      // type: String
    },
    color: {},
    maxWidth: {
      default: "220px",
    },
    label: {},
    placeholder: {},
    persistentPlaceholder: {
      type: Boolean,
      default: false,
    },
    messages: {},
    hideDetails: {
      type: Boolean,
      default: false,
    },
    dense: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    outlined: { type: Boolean, default: false },

    filled: { type: Boolean, default: false },
    rounded: { type: Boolean, default: false },

    readonly: { type: Boolean, default: false },

    multiple: { type: Boolean, default: false },
    solo: {
      default: false,
      type: Boolean,
    },
    isVertical: {
      default: false,
      type: Boolean,
    },

    clearable: {
      default: false,
      type: Boolean,
    },

    menu: {
      default: false,
      type: Boolean,
    },
    flat: {
      default: false,
      type: Boolean,
    },
    availableLanguages: {},
    transparent: {
      type: Boolean,
      default: false,
    },
    prependInnerIcon: {},
    appendIcon: {},
    // -------------------------
    iconOnly: { type: Boolean, default: false }, // Show circle button (shop top header)
    iconColor: {},



    suffix:{},

    checkedLanguages: {
      // Show a tick after language (Use case: in multi languages articles to show which language exists!)
    },

  },

  data: () => ({
    select_language: null,

    show_dialog: false,
    dialog_pre: false,

    show_flags: false,
  }),

  computed: {
    languages() {
      if (this.availableLanguages) {
        return Object.values(Language).filter((i) =>
          this.availableLanguages.includes(i.code)
        );
      }
      return Object.values(Language).filter(
        (i) => i.vip || !SetupService.LocalServiceCountry()
      );
    },

    selected_language_object() {
      if(this.multiple)return null;
      let out = this.getLanguageObject(this.select_language);
      if (!out && !this.clearable) return Language.en; // Just show english!

      return out;
    },

  },
  watch: {
    select_language(local) {
      this.$emit("input", local);
    },
    value(language) {
      this.select_language = language;
    },
  },

  created() {
    this.select_language = this.value;
  },

  methods: {
    showDialog() {
      this.dialog_pre = false;
      this.$nextTick(() => {
        this.dialog_pre = true;
        this.$nextTick(() => {
          this.show_dialog = true;
        });
      });
    },


  },
};
</script>

<style scoped lang="scss">
.vertical-block {
  display: block;
  padding: 4px 0;
}
</style>
