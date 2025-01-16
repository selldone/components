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
  <div v-if="vendor" class="d-flex align-center py-1 text-start">
    <u-avatar-folder
      :size="small ? 32 : 62"
      :border-size="small?4:10"
      :hide-side-icon="small"
      class="hover-scale-small me-2"
      :src="vendor.icon?getShopImagePath(vendor.icon,128):undefined"
      placeholder-icon="business"
      is-purple
      side-icon="storefront"
      elevated
    >
    </u-avatar-folder>

    <div class="flex-grow-1">
      <b class="single-line max-w-200"
        >{{ vendor.name?.limitWords(3) }}
        <v-icon v-if="vendor.access" class="ms-1" color="blue" size="small"
          >verified
        </v-icon>
        <v-icon v-if="vendor.enable === false" class="ms-1" color="red"
          >remove_done
        </v-icon>
      </b>
      <div v-if="vendor.description" class="flex-grow-1 single-line small max-w-200">
        {{ vendor.description }}
      </div>

      <v-row
        v-if="vendor.email || vendor.tel"
        :class="{ 'my-1': !small }"
        class="small"
        no-gutters
      >
        <div v-if="vendor.email" class="flex-grow-1">
          <span v-copy class="py-1" @click.stop>{{ vendor.email }}</span>
        </div>
        <div v-if="vendor.tel" class="flex-grow-1">
          <span v-copy class="py-1" @click.stop>{{ vendor.tel }}</span>
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

  components: {UAvatarFolder},
  props: {
    vendor: {},
    small: Boolean,
  },
  methods: {},
};
</script>

<style scoped></style>
