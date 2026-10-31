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
  <div v-if="vendor" class="d-flex align-center py-1 text-start" :class="{ 'b-vendor-box--modern': modern }">
    <u-avatar-folder
      :size="modern ? 38 : small ? 32 : 62"
      :border-size="modern ? 2 : small ? 4 : 10"
      :hide-side-icon="modern ? false : small"
      class="hover-scale-small me-2"
      :src="vendor.icon?getShopImagePath(vendor.icon,128):undefined"
      placeholder-icon="business"
      is-purple
      side-icon="storefront"
      elevated
    >
    </u-avatar-folder>

    <div class="flex-grow-1" :class="{ 'b-vendor-box__body': modern }">
      <b :class="modern ? 'b-vendor-box__name-row' : 'single-line max-w-200'">
        <span v-if="modern" v-overflow-check="(clipped) => (nameClipped = clipped)" class="b-vendor-box__name" :tabindex="nameClipped ? 0 : undefined">
          {{ vendor.name }}
          <v-tooltip activator="parent" :disabled="!nameClipped" location="top" open-on-focus open-on-click content-class="sd-modern-tooltip text-start">{{ vendor.name }}</v-tooltip>
        </span>
        <template v-else>{{ vendor.name?.limitWords(3) }}</template>
        <v-icon v-if="vendor.access" class="ms-1" color="blue" :size="modern ? 14 : 'small'"
          >verified
        </v-icon>
        <v-icon v-if="vendor.enable === false" class="ms-1" color="red" :size="modern ? 14 : undefined"
          >remove_done
        </v-icon>
      </b>
      <div v-if="vendor.description" class="flex-grow-1 single-line small max-w-200">
        {{ vendor.description }}
      </div>

      <v-row
        v-if="vendor.email || vendor.tel"
        :class="{ 'my-1': !small && !modern, 'b-vendor-box__contacts': modern }"
        class="small"
        no-gutters
      >
        <div v-if="vendor.email" class="flex-grow-1">
          <v-icon v-if="modern" size="12" aria-hidden="true">mail</v-icon>
          <span v-copy :class="modern ? 'b-vendor-box__contact-value' : 'py-1'" @click.stop>{{ vendor.email }}</span>
        </div>
        <div v-if="vendor.tel" class="flex-grow-1">
          <v-icon v-if="modern" size="12" aria-hidden="true">phone</v-icon>
          <span v-copy :class="modern ? 'b-vendor-box__contact-value' : 'py-1'" @click.stop>{{ vendor.tel }}</span>
        </div>
      </v-row>
    </div>
  </div>
  <div v-else-if="vendor?.deleted_at" class="text-red font-weight-bold small">
    <v-icon class="me-1" color="red" size="small">warning</v-icon>
    Deleted!
  </div>
  <small v-else>Not set!</small>
</template>

<script lang="ts">
import { RouteMixin } from "../../../mixin/route/RouteMixin.ts";
import UAvatarFolder from "@selldone/components-vue/ui/avatar/folder/UAvatarFolder.vue";

export default {
  name: "BVendorBox",
  mixins: [RouteMixin],

  directives: {
    overflowCheck: {
      mounted(element, binding) {
        const state = { notify: binding.value, observer: null, measure: null };
        state.measure = () => state.notify(element.scrollWidth > element.clientWidth + 1);
        state.observer = new ResizeObserver(state.measure);
        state.observer.observe(element);
        element._vendorNameOverflow = state;
        state.measure();
      },
      updated(element, binding) {
        const state = element._vendorNameOverflow;
        state.notify = binding.value;
        state.measure();
      },
      beforeUnmount(element) {
        element._vendorNameOverflow.observer.disconnect();
        delete element._vendorNameOverflow;
      },
    },
  },

  components: {UAvatarFolder},
  props: {
    vendor: {},
    small: Boolean,
    modern: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({ nameClipped: false }),
  methods: {},
};
</script>

<style lang="scss" scoped>
.b-vendor-box--modern {
  gap: 10px;
  min-width: 0;
  padding-block: 0 !important;
  font-family: inherit;

  > .hover-scale-small { flex-shrink: 0; margin-inline-end: 0 !important; }
  > .hover-scale-small :deep(.absolute-bottom-end-0) { display: grid; place-items: center; width: 16px !important; height: 16px !important; padding: 0 !important; border: 2px solid rgb(var(--v-theme-surface)); border-radius: 5px !important; }
  .b-vendor-box__body { min-width: 0; }
  .b-vendor-box__name-row { display: flex; align-items: center; min-width: 0; font-size: 13px; font-weight: 500; line-height: 20px; }
  .b-vendor-box__name { display: block; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .b-vendor-box__name-row > .v-icon { flex-shrink: 0; }
  .b-vendor-box__body > .single-line { max-width: 100% !important; font-size: 11px; line-height: 18px; color: var(--sd-modern-muted); }
  .b-vendor-box__contacts { display: flex; flex-direction: column; margin-block-start: 4px; font-size: 11px; line-height: 18px; color: var(--sd-modern-muted); }
  .b-vendor-box__contacts > div { display: flex; align-items: center; gap: 4px; min-width: 0; }
  .b-vendor-box__contact-value { min-width: 0; padding-block: 0 !important; font-size: 11px; line-height: 18px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
}
</style>
