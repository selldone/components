<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
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
  <div class="widget-box">
    <s-widget-header
      :src="require('../../../assets/trademark/meta.png')"
      title="Meta Data Source"
    >
    </s-widget-header>

    <v-list-subheader>
      Selldone seamlessly integrates with Meta to automatically synchronize and
      update your products and categories.
    </v-list-subheader>

    <u-pods-panel >
      <u-pod-node  :title="shop.title">
        <v-avatar class="avatar-gradient -thin -shop mb-1" size="24">
          <v-img :src="getShopImagePath(shop.icon, 96)" />
        </v-avatar>
      </u-pod-node>

      <u-pod-wire forward >
      </u-pod-wire>
      <u-pod-node >
        <div>
          <img
            class="m-1"
            height="20"
            src="../../../assets/trademark/instagram.svg"
            width="20"
          />
          <img
            class="m-1"
            height="20"
            src="../../../assets/trademark/facebook.svg"
            width="20"
          />
        </div>
      </u-pod-node>
    </u-pods-panel>

    <v-list-subheader>
      Here's the link for your data feed. Simply copy it and integrate it with
      your Facebook catalog. This will allow automatic synchronization of all
      products and categories, enabling you to effortlessly run advertisements
      on the Meta platform.
    </v-list-subheader>
    <div class="text-end">
      <v-btn
        class="tnt"
        color="primary"
        href="https://www.facebook.com/business/help/125074381480892?id=725943027795860"
        target="_blank"
        variant="text"
      >
        <v-icon class="me-1" size="small">fa:fab fa-facebook</v-icon>
        {{ $t("global.actions.read_more") }}...
      </v-btn>
    </div>

    <u-text-copy-box
      :image="require('../../../assets/icons/link.svg')"
      :value="facebook_catelog_feed"
      message="Facebook Products Feed URL"
      small-width-mode
    >
    </u-text-copy-box>
  </div>
</template>

<script>
import UTextCopyBox from "../../../ui/text/copy-box/UTextCopyBox.vue";
import UPodsPanel from "@selldone/components-vue/ui/pod/panel/UPodsPanel.vue";
import UPodNode from "@selldone/components-vue/ui/pod/node/UPodNode.vue";
import UPodWire from "@selldone/components-vue/ui/pod/wire/UPodWire.vue";

export default {
  name: "BMetaCatalog",
  components: {UPodWire, UPodNode, UPodsPanel, UTextCopyBox },
  props: {
    shop: {
      required: true,
      type: Object,
    },
  },
  data: () => ({
    busy_set: false,
  }),
  computed: {
    facebook_catelog_feed() {
      return `${this.getShopMainUrl(this.shop)}/rss/facebook`;
    },
  },

  watch: {},

  created() {},

  methods: {},
};
</script>

<style lang="scss" scoped></style>
