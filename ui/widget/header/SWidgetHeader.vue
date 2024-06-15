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
  <div
    class="s--widget-header d-flex align-stretch align-sm-start flex-column flex-sm-row"
  >
    <div class="d-flex align-center flex-grow-1">
      <h2 class="d-flex align-center">
        <v-icon
          v-if="icon"
          :color="iconColor"
          :size="font_size"
          class="me-1 flex-grow-0 --icon"
          >{{ icon }}
        </v-icon>
        <img
          v-if="src"
          :src="src"
          class="me-2 flex-grow-0 rounded"
          height="24"
          width="24"
        />
        <slot name="icon"></slot>
        {{ title }}
        <sup
          v-if="dot"
          :class="{ 'hover-scale-small': dot_msg }"
          :title="dot_msg"
          class="mx-1"
        >
          <v-icon :color="dotColor" size="12">circle</v-icon>
        </sup>
      </h2>
      <slot name="append-title"></slot>

      <v-spacer></v-spacer>
      <slot name="icon-actions"></slot>
      <slot v-if="$vuetify.display.xs" name="actions"></slot>
    </div>
    <div class="d-flex align-center">
      <template v-if="hasAiAction">
        <!-- Ai Action -->
        <u-button-ai-small
          :color="buttonColor"
          :image-size="36"
          :loading="loadingAi"
          :size="44"
          :tooltip="tooltipAi"
          dark-mode
          placeholder-color="#fff"
          placeholder-icon="mic"
          variant="elevated"
          @click="$emit('click:ai')"
        ></u-button-ai-small>
        <v-sheet
          :color="buttonColor"
          class="align-self-center"
          height="4"
          width="16"
        ></v-sheet>
      </template>
      <v-btn
        v-if="addCaption"
        :block="$vuetify.display.xs"
        :class="{ disabled: disabled || disabledAccess}"
        :color="buttonColor"
        :href="href"
        :loading="addLoading"
        :target="target"
        :to="to"
        :variant="addText ? 'text' : 'elevated'"
        class="mt-2 mt-sm-0 rounded-18px"
        min-width="200"
        size="large"
        style="font-size: 0.875rem"
        @click="$emit('click:add')"
      >
        <v-icon :size="20" class="me-1">{{ addIcon }}</v-icon>

        <div v-if="disabled || disabledAccess">
          {{ addCaption }}
          <small class="d-block tnt">
            <v-icon size="x-small">{{disabledAccess?'lock':'error_outline'}}</v-icon>
            {{
              disabledAccess?$t("error.no_write_access"):   disabledReason ? disabledReason : $t("error.license_max_limit")
            }}</small
          >
        </div>
        <span v-else>
          {{ addCaption }}
          <span v-if="addSubCaption" class="d-block tnt small op-0-8">{{
            addSubCaption
          }}</span>
        </span>
      </v-btn>
    </div>
    <slot v-if="!$vuetify.display.xs" name="actions"></slot>
  </div>
</template>

<script>
import UButtonAiSmall from "../../button/ai/small/UButtonAiSmall.vue";

export default {
  name: "SWidgetHeader",
  components: { UButtonAiSmall },
  emits: ["click:add", "click:ai"],
  props: {
    icon: {},
    iconColor: {},
    title: {},
    src: {},
    addCaption: {},
    addSubCaption: {},
    addIcon: { default: "add_box" },
    addText: { default: false, type: Boolean },

    to: {},
    disabled: { default: false, type: Boolean },
    disabledAccess: { default: false, type: Boolean },
    addLoading: { default: false, type: Boolean },
    disabledReason: {},

    href: {},
    target: {},

    buttonColor: { default: "primary" },

    //------------------------------
    dot: { default: false },
    dotColor: { default: "red" },

    hasAiAction: Boolean,
    loadingAi: Boolean,
    tooltipAi: String,
  },

  computed: {
    font_size() {
      return this.icon?.startsWith("fas ") || this.icon?.startsWith("fa:")
        ? 22
        : 26;
    },
    dot_msg() {
      return this.isString(this.dot)
        ? this.dot
        : Array.isArray(this.dot)
          ? this.dot.join(", ")
          : null;
    },
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
.s--widget-header {
  .--icon {
    min-width: 26px;
  }
}
</style>
