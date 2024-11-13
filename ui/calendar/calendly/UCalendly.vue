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
    <div
      ref="calendly"
      :style="{ minWidth: '320px', height: height }"
      class="calendly-inline-widget"
      data-auto-load="false"
    />

    <u-loading-progress v-if="busy"></u-loading-progress>
  </div>
</template>

<script lang="ts">
import { ScriptHelper } from "@selldone/components-vue/plugins/jquery/ScriptHelper";
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "UCalendly",
  props: {
    dataUrl: {
      required: true,
    },
    height: {
      default: "640px",
    },
  },
  data: () => ({
    script: null,

    busy: false,
  }),

  computed: {
    user() {
      return this.USER();
    },
  },
  mounted() {
    this.loadPaypalJs();
  },
  beforeUnmount() {
    $("html")
      .find("script")
      .filter(function () {
        return (
          $(this).attr("src") ===
          "https://assets.calendly.com/assets/external/widget.js"
        );
      })
      .remove();
  },
  methods: {
    loadPaypalJs() {
      let t = this;
      this.busy = true;

      try {
        let test = Calendly; // Check if previously loaded:
        this.busy = false;
        console.style(`✔ ❰ Calendly ❱  Script exist`);
        this.init();
      } catch (e) {
        // Load dynamically:
        ScriptHelper.CachedScript(
          "https://assets.calendly.com/assets/external/widget.js",
        )
          .done(function (script, textStatus) {
            console.style(
              `🔔 ❰ Calendly ❱  Load script file start... ▶ status: ${textStatus}`,
            );
            t.busy = false;

            console.style(`🔔 ❰ Calendly ❱  Load script file end`);
            t.init();
          })
          .fail(function (jqxhr, settings, exception) {
            console.errorStyle(
              `⚠ ❰ Calendly ❱  Failed to load script file: `,
              exception,
            );
            NotificationService.showErrorAlert(null, "Can not load script!");
          });
      }
    },

    init() {
      Calendly.initInlineWidget({
        url: this.dataUrl,
        parentElement: this.$refs.calendly,
        prefill: this.user
          ? {
              name: this.user.name,
              email: this.user.email,
            }
          : {},
        utm: {},
      });
    },
  },
};
</script>

<style scoped></style>
