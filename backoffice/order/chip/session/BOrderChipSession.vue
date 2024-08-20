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
  <v-chip
    v-if="order"
    :size="size"
    :density="density"
    :variant="variant"
    :color="color"
  >
    <img
      :src="getBrowserImage(session.browser)"
      :title="session.browser"
      class=""
      :height="imageSize"
      :width="imageSize"
    />

    <v-icon :title="$t(device.title)" class="ms-1" :size="imageSize"
      >{{ device.icon }}
    </v-icon>

    <img
      v-if="campaign"
      :title="campaign?.name"
      class="ms-1"
      :src="require('@selldone/components-vue/assets/icons/campaign.svg')"
      :height="imageSize"
      :width="imageSize"
    />
  </v-chip>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { Analytics } from "@selldone/core-js/models";

export default defineComponent({
  name: "BOrderChipSession",
  props: {
    order: {
      type: Object,
    },
    size: {},
    imageSize: {
      default: 14,
    },
    density: {},
    variant: {},
    color: {},
  },
  computed: {
    session() {
      return this.order.session;
    },
    device() {
      let out = Analytics.DeviceType.find(
        (item) => item.code === this.session.type.toLowerCase(),
      );
      return out ? out : Analytics.DeviceType[0];
    },
    campaign_link() {
      return this.order.campaign_link;
    },

    campaign() {
      if (!this.campaign_link) return null;
      return this.campaign_link.campaign;
    },
  },
});
</script>

<style scoped lang="scss"></style>
