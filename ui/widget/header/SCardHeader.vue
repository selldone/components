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
  <div class="px-6 text-start">
    <u-widget-header
      :addCaption="addCaption"
      :addIcon="addIcon"
      :addLoading="addLoading"
      :addText="addText"
      :buttonColor="buttonColor"
      :disabled="disabled"
      :disabledReason="disabledReason"
      :dot="dot"
      :dotColor="dotColor"
      :href="href"
      :icon="icon"
      :iconColor="iconColor"
      :src="src"
      :target="target"
      :title="title"
      :to="to"
    ></u-widget-header>
    <p class="px-0 op-0-7" style="font-size: 0.85rem">
      {{ subtitle }}
    </p>
  </div>
</template>

<script lang="ts">
export default {
  name: "SCardHeader",
  components: {},
  props: {
    icon: {},
    iconColor: {},
    title: {},
    subtitle: {},
    src: {},
    addCaption: {},
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
