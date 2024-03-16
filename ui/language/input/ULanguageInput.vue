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
  <div :class="{ 'v-input': !iconOnly }" :style="`max-width: ${maxWidth}`">
    <!-- v-input : css of widget-box same effect like normal inputs -->

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅ Icon Mode ▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
    <s-circle-button
      v-if="iconOnly"
      :color="iconColor"
      :icon="prependInnerIcon"
      :title="`Change language | ${selected_language_object?.title}`"
      :tooltip="selected_language_object?.title"
      dense
      @click="readonly ? undefined : showDialog()"
    ></s-circle-button>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅ Normal Mode ▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <v-text-field
      v-else
      :append-inner-icon="appendIcon"
      :bg-color="transparent ? 'transparent' : undefined"
      :clearable="clearable"
      :color="color"
      :density="dense ? 'compact' : undefined"
      :disabled="disabled"
      :flat="flat"
      :hide-details="hideDetails"
      :label="label ? label : $t('global.commons.language')"
      :messages="messages"
      :modelValue="
        multiple
          ? select_language?.map((l) => getLanguageName(l)).join(', ')
          : selected_language_object?.title
      "
      :multiple="multiple"
      :persistent-placeholder="persistentPlaceholder"
      :placeholder="
        placeholder ? placeholder : $t('global.placeholders.language')
      "
      :prepend-inner-icon="prependInnerIcon"
      :rounded="rounded"
      :single-line="singleLine"
      :suffix="suffix"
      :variant="
        variant
          ? variant
          : outlined
            ? 'outlined'
            : filled
              ? 'filled'
              : solo
                ? 'solo'
                : 'underlined'
      "
      class="pp"
      readonly
      @click="readonly || disabled ? undefined : showDialog()"
      @click:clear="
        select_language = null;
        $nextTick(() => {
          $emit('change', null);
        });
      "
    >
      <template v-slot:append>
        <slot name="append-outer"></slot>
      </template>
    </v-text-field>
    <slot></slot>
    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅ Dialog > Selector ▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <u-languages-dialog
      v-if="dialog_pre"
      v-model="show_dialog"
      v-model:selected-language="select_language"
      :available-languages="availableLanguages"
      :checked-languages="checkedLanguages"
      :multiple="multiple"
      @change="
        (val) =>
          $nextTick(() => {
            $emit('change', val);
          })
      "
    ></u-languages-dialog>
  </div>
</template>

<script>
import { Language } from "@core/enums/language/Language";
import { SetupService } from "@core/server/SetupService";
import ULanguagesDialog from "../dialog/ULanguagesDialog.vue";

export default {
  name: "ULanguageInput",
  emits: ["change", "update:modelValue"],
  components: { ULanguagesDialog },
  props: {
    modelValue: {
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
    variant: {},
    singleLine: Boolean,
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

    suffix: {},

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
          this.availableLanguages.includes(i.code),
        );
      }
      return Object.values(Language).filter(
        (i) => i.vip || !SetupService.LocalServiceCountry(),
      );
    },

    selected_language_object() {
      if (this.multiple) return null;
      let out = this.getLanguageObject(this.select_language);
      if (!out && !this.clearable) return Language.en; // Just show english!

      return out;
    },
  },
  watch: {
    select_language(local) {
      this.$emit("update:modelValue", local);
    },
    modelValue(language) {
      this.select_language = language;
    },
  },

  created() {
    this.select_language = this.modelValue;
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

<style lang="scss" scoped>
.vertical-block {
  display: block;
  padding: 4px 0;
}
</style>
