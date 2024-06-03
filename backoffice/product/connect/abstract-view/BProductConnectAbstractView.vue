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
  <s-widget-box
    :title="`Connect <span class='text-gradient bg-sunny-morning'>OS</span>`"
    icon="hub"
  >
    <div class="d-flex align-center py-1">
      <router-link
        :to="IS_VENDOR_PANEL ? undefined : { name: 'BPageShopChannelConnect' }"
        title="Go to the channels."
      >
        <u-avatar-folder  v-if="connect.icon" class="me-2" :src="getShopImagePath(connect.icon, 128)" side-icon="hub" is-green size="64">

        </u-avatar-folder>
      </router-link>
      <div class="flex-grow-1">
        <v-row align="center" justify="start" no-gutters>
          <b class="body-title">{{ connect.name }}</b>
          <v-chip
            v-if="connect.enable === true"
            class="mx-2 pa-1"
            color="green"
            label
            size="x-small"
          >
            {{ $t("global.commons.enable") }}
          </v-chip>
          <v-chip
            v-if="connect.enable === false"
            class="mx-2 pa-1"
            color="red"
            label
            size="x-small"
          >
            {{ $t("global.commons.disable") }}
          </v-chip>
        </v-row>
        <div class="small">
          {{ connect.description }}
        </div>
      </div>
    </div>
  </s-widget-box>
</template>
<script>
import { defineComponent } from "vue";
import SWidgetBox from "../../../../ui/widget/box/SWidgetBox.vue";
import UAvatarFolder from "@selldone/components-vue/ui/avatar/folder/UAvatarFolder.vue";

export default defineComponent({
  name: "BProductConnectAbstractView",
  components: {UAvatarFolder, SWidgetBox },
  props: {
    shop: {
      required: true,
      type: Object,
    },
    product: {
      required: true,
      type: Object,
    },
  },

  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    connect() {
      return this.product.connect;
    },
  },
});
</script>

<style lang="scss" scoped></style>
