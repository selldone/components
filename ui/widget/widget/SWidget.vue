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
  <v-sheet
    ref="widget"
    :class="{ className, h100: h100 }"
    :style="{ '--background': 'var(--widget-background-color)' }"
    color="var(--widget-background-color)"
    :theme="dark ? 'dark' : 'light'"
    class="widget s--widget"
    v-bind="dataWidgster"
    @click="$emit('click')"
    :rounded="rounded"
  >
    <div class="top-left-container">
      <slot name="top-left" />
    </div>

    <h5
      v-if="title && typeof title === 'string' && !customHeader"
      :style="$vuetify.rtl ? 'padding-left: 48px ' : 'padding-right: 48px '"
      class="title-widget text-start-dir"
    >
      {{ title }}
    </h5>

    <header
      v-if="title && customHeader"
      :style="$vuetify.rtl ? 'padding-left: 48px ' : 'padding-right: 48px '"
      class="title-widget"
      v-html="title"
    />

    <v-list-subheader v-if="subTitle" :dark="dark">
      {{ subTitle }}
    </v-list-subheader>

    <div
      v-if="!customControls && mainControls"
      class="widgetControls widget-controls"
    >
      <a v-if="settings" href="#"><i class="fas fa-cogs" /></a>
      <a v-if="settingsInverse" class="bg-gray-transparent inverse" href="#">
        <i class="fas fa-cogs text-white" />
      </a>
      <a
        v-if="refresh"
        :id="`reloadId-${randomId}`"
        data-widgster="load"
        href="#"
      >
        <strong v-if="typeof refresh === 'string'" class="text-gray-light">{{
          refresh
        }}</strong>
        <i v-else class="fas fa-refresh" />
        <v-tooltip
          v-if="showTooltip"
          :placement="tooltipPlacement"
          :target="`reloadId-${randomId}`"
          >Reload
        </v-tooltip>
      </a>
      <a
        v-if="fullscreen"
        :id="`fullscreenId-${randomId}`"
        data-widgster="fullscreen"
        href="#"
      >
        <i class="glyphicon glyphicon-resize-full" />
        <v-tooltip
          v-if="showTooltip"
          :placement="tooltipPlacement"
          :target="`fullscreenId-${randomId}`"
          >Fullscreen
        </v-tooltip>
      </a>
      <a
        v-if="fullscreen"
        :id="`restoreId-${randomId}`"
        data-widgster="restore"
        href="#"
      >
        <i class="glyphicon glyphicon-resize-small" />
        <v-tooltip
          v-if="showTooltip"
          :placement="tooltipPlacement"
          :target="`restoreId-${randomId}`"
          >Restore
        </v-tooltip>
      </a>
      <span v-if="collapse">
        <a :id="`collapseId-${randomId}`" data-widgster="collapse" href="#">
          <i class="fas fa-angle-down" />
          <v-tooltip
            v-if="showTooltip"
            :placement="tooltipPlacement"
            :target="`collapseId-${randomId}`"
            >Collapse
          </v-tooltip>
        </a>
      </span>
      <span v-if="collapse">
        <a :id="`expandId-${randomId}`" data-widgster="expand" href="#">
          <i class="fas fa-angle-up" />
          <v-tooltip
            v-if="showTooltip"
            :placement="tooltipPlacement"
            :target="`expandId-${randomId}`"
            >Expand
          </v-tooltip>
        </a>
      </span>
      <a
        v-if="close"
        :id="`closeId-${randomId}`"
        data-widgster="close"
        href="#"
      >
        <strong v-if="typeof refresh === 'string'" class="text-gray-light">{{
          close
        }}</strong>
        <i v-else class="fas fa-remove" />
        <v-tooltip
          v-if="showTooltip"
          :placement="tooltipPlacement"
          :target="`closeId-${randomId}`"
          >Close
        </v-tooltip>
      </a>
    </div>
    <div
      v-if="customControls"
      class="widgetControls widget-controls"
      v-html="customControls"
    />
    <div :class="`widgetBody widget-body ${bodyClass}`">
      <slot />
    </div>
  </v-sheet>
</template>

<script>
export default {
  name: "SWidget",
  props: {
    customHeader: { type: Boolean, default: false },
    tooltipPlacement: { default: "top" },
    showTooltip: { type: Boolean, default: false },
    close: { type: [Boolean, String], default: false },
    fullscreen: { type: [Boolean, String], default: false },
    collapse: { type: [Boolean, String], default: false },
    settings: { type: [Boolean, String], default: false },
    settingsInverse: { type: Boolean, default: false },
    refresh: { type: [Boolean, String], default: false },
    className: { default: "" },
    title: { default: "" },
    subTitle: {},
    customControls: { default: null },
    bodyClass: { default: "" },
    options: { default: () => ({}) },
    dataWidgster: { type: Object, default: () => ({}) },
    h100: { default: false, type: Boolean },
    dark: { type: Boolean, default: false },
    rounded:{default:'xl'}
  },
  computed: {
    randomId() {
      return Math.floor(Math.random() * 100);
    },
    mainControls() {
      return !!(
        this.close ||
        this.fullscreen ||
        this.collapse ||
        this.refresh ||
        this.settings ||
        this.settingsInverse
      );
    },
  },
  mounted() {
    const { options } = this;
    options.bodySelector = ".widget-body";
  },
};
</script>

<style lang="scss" src="./s-widget.scss" />

<style lang="scss" scoped>
.top-left-container {
  position: absolute;
  top: 8px;
  right: 8px;
}

.v-application--is-rtl {
  .top-left-container {
    right: unset;
    left: 8px;
  }
}
</style>
