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
  <div class="d-flex align-stretch align-sm-start flex-column flex-sm-row s-widget-header">
    <div class="d-flex align-center flex-grow-1">
      <h2 class="d-flex align-center">
        <v-icon
          v-if="icon"
          class="me-1 flex-grow-0"
          :color="iconColor"
          :size="icon?.startsWith('fas ') ? 18 : undefined"
          >{{ icon }}</v-icon
        >
        <img
          v-if="src"
          :src="src"
          width="24"
          height="24"
          class="me-1 flex-grow-0 rounded"
        />
        <slot name="icon"></slot>
        {{ title }}
        <sup
          v-if="dot"
          class="mx-1"
          :title="dot_msg"
          :class="{ 'hover-scale-small': dot_msg }"
        >
          <v-icon size="12" :color="dotColor">circle</v-icon>
        </sup>
      </h2>
      <slot name="append-title"></slot>

      <v-spacer> </v-spacer>
      <slot name="icon-actions"></slot>
      <slot v-if="$vuetify.breakpoint.xs" name="actions"></slot>
    </div>
    <v-btn
      v-if="addCaption"
      large
      :color="buttonColor"
      :block="$vuetify.breakpoint.xs"
      class="mt-2 mt-sm-0 rounded-18px"
      @click="$emit('click:add')"
      min-width="200"
      :to="to"
      :href="href"
      :target="target"
      :class="{ disabled: disabled }"
      :loading="addLoading"
      :text="addText"
    >
      <v-icon class="me-1">{{ addIcon }}</v-icon>

      <div v-if="disabled">
        {{ addCaption }}
        <small class="d-block tnt">
          <v-icon x-small>error_outline</v-icon>
          {{
            disabledReason ? disabledReason : $t("error.license_max_limit")
          }}</small
        >
      </div>
      <span v-else>
        {{ addCaption }}
        <small v-if="addSubCaption" class="d-block tnt">{{
          addSubCaption
        }}</small>
      </span>
    </v-btn>

    <slot v-if="!$vuetify.breakpoint.xs" name="actions"></slot>
  </div>
</template>

<script>
export default {
  name: "SWidgetHeader",
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
    addLoading: { default: false, type: Boolean },
    disabledReason: {},

    href: {},
    target: {},

    buttonColor: { default: "primary" },

    //------------------------------
    dot: { default: false },
    dotColor: { default: "red" },
  },

  computed: {
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

<style scoped></style>
