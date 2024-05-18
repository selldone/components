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
  <div class="widget-box ">
    <s-widget-header
      :src="require('../../../assets/trademark/google-shopping.png')"
      :title="$t('channel_google.shopping.title') "
    >
    </s-widget-header>

    <v-list-subheader>
      {{$t('channel_google.shopping.subtitle')}}

    </v-list-subheader>

    <u-pods-panel >
      <u-pod-node  :title=" shop.title ">
        <v-avatar class="avatar-gradient -thin -shop mb-1" size="24">
          <v-img :src="getShopImagePath(shop.icon, 96)" />
        </v-avatar>
      </u-pod-node>

      <u-pod-wire forward>
      </u-pod-wire>
      <u-pod-node :image="require('../../../assets/trademark/google-shopping.png')" title="Google">
      </u-pod-node>
    </u-pods-panel>

    <v-list-subheader>
      {{$t('channel_google.shopping.tips')}}

    </v-list-subheader>

    <u-text-copy-box
      :image="require('../../../assets/icons/link.svg')"
      :value="google_products_feed"
      :message="$t('channel_google.shopping.link_message') "
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
  name: "BGoogleShopping",
  components: {
    UPodWire,
    UPodNode,
    UPodsPanel,
    UTextCopyBox,
  },
  props: {
    shop: {
      required: true,
      type: Object,
    },
  },
  data: () => ({}),
  computed: {
    google_products_feed() {
      return `${this.getShopMainUrl(this.shop)}/rss/google`;
    },

  },

  watch: {},

  created() {

  },

  methods: {},
};
</script>

<style lang="scss" scoped></style>
