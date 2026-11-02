<!--
  - Copyright (c) 2024. Selldone® Business OS™
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
  <button type="button" class="b-app-store-card" :disabled="disabled || loading" :aria-busy="loading"
          :aria-label="$t('app_store_catalog.view_app', { name: app.name }) + (mode_title ? ' · ' + mode_title : '')" @click="$emit('select', app)">
    <span class="b-app-store-card__logo">
      <v-img :src="app.icon ? getShopImagePath(app.icon, 128) : placeholder" width="30" height="30" contain alt="" />
    </span>
    <span class="b-app-store-card__name">{{ app.name }}</span>
    <bdi class="b-app-store-card__code">{{ app.code }}</bdi>
    <span class="b-app-store-card__footer">
      <span v-if="mode_badge" class="b-app-store-card__mode">
        <img :src="mode_badge.src" width="13" height="13" alt="" />
        {{ mode_title }}
      </span>
      <span class="b-app-store-card__view">
        {{ $t('app_store_catalog.view_details') }}
        <v-progress-circular v-if="loading" indeterminate size="14" width="2" />
        <v-icon v-else size="14" class="b-app-store-card__arrow">chevron_right</v-icon>
      </span>
    </span>
  </button>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { Application } from "@selldone/core-js";
import placeholder from "@selldone/core-js/helper/image/assets/image-placeholder.svg";

export default defineComponent({
  name: "BAppShopStoreIcon",
  emits: ["select"],
  props: {
    app: {
      required: true,
      type: Object,
    },
    loading: Boolean,
    disabled: Boolean,
  },
  data: () => ({ placeholder }),

  computed: {
    mode_title() {
      if (!this.mode_badge) return "";
      return this.$t(this.app.mode === 'TEST' ? 'app_store_catalog.mode_test' : 'app_store_catalog.mode_enterprise');
    },
    mode_badge() {
      const mode = this.app.mode;
      if (mode === Application.AppMode.TEST.code)
        return Application.AppMode.TEST;
      else if (mode === Application.AppMode.ENTERPRISE.code)
        return Application.AppMode.ENTERPRISE;
      return null;
    },
  },
});
</script>

<style lang="scss" scoped>
.b-app-store-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
  min-height: 165px;
  padding: 18px;
  border: 1px solid var(--sd-modern-border);
  border-radius: 14px;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  font: inherit;
  text-align: start;
  cursor: pointer;

  &:hover:not(:disabled) { box-shadow: 0 4px 13px rgba(var(--v-theme-on-surface), .04); }
  &:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 3px; }
  &:disabled { cursor: default; }
  &__logo { display: grid; place-items: center; flex: 0 0 42px; width: 42px; height: 42px; border-radius: 10px; background: var(--sd-modern-inset); }
  &__name { margin-block-start: 13px; max-width: 100%; font-size: 14px; font-weight: 500; line-height: 20px; overflow-wrap: anywhere; }
  &__code { margin-block-start: 3px; max-width: 100%; color: var(--sd-modern-muted); font-size: 12px; line-height: 18px; overflow-wrap: anywhere; }
  &__footer { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 6px; width: 100%; margin-block-start: auto; padding-block-start: 15px; }
  &__mode { display: inline-flex; align-items: center; gap: 4px; max-width: 100%; padding: 1px 5px; border: 1px solid var(--sd-modern-border); border-radius: 3px; color: var(--sd-modern-muted); font-size: 11px; line-height: 16px; }
  &__view { display: inline-flex; align-items: center; gap: 4px; color: rgb(var(--v-theme-primary)); font-size: 12px; line-height: 18px; }
  &:dir(rtl) &__arrow { transform: rotate(180deg); }
  @media (max-width: 420px) { padding: 14px; }
}
</style>
