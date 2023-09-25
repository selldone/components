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
  <v-row
    v-if="socials && socials.length"
    dense
    align="center"
    class="text-center m-0"
    :class="{
      'flex-column': vertical,
      'border-start': productOnly && socials.length,
    }"
    v-intersect="
      (e) => {
        visible = e[0].isIntersecting;
      }
    "
  >
    <v-btn
      v-for="(item, i) in socials"
      :key="item.network"
      icon
      target="_blank"
      :href="getUrl(item)"
      :title="$t(SocialNetwork[item.network].title)"
      class="toc"
      :class="{
        'hover-parallax': parallax,
        'm-2': !productOnly,
        tada: productOnly && visible,
      }"
      :tile="tile"
      :large="large"
      :color="SocialNetwork[item.network].color"
      :min-width="minWidth"
      :style="{ animationDelay: 500 + i * 500 + 'ms' }"
    >
      <img
        width="20"
        height="20"
        :src="SocialNetwork[item.network].image"
        class="trn toc"
        :class="{
          '-scale': hasScale(item) && !finish,
          swing: hasScale(item) && finish,
        }"
      />
    </v-btn>
  </v-row>
</template>

<script>
import {CreateSocialConnectLink, SocialNetwork} from "../../../../core/enums/social/SocialNetwork";
import _ from "lodash-es";

export default {
  name: "SShopSocialButtons",
  props: {
    shop: {
      require: true,
      type: Object,
    },
    vertical: {
      default: false,
      type: Boolean,
    },
    activeOnly: {
      default: false,
      type: Boolean,
    },
    productOnly: {
      default: false,
      type: Boolean,
    },
    parallax: {
      default: false,
      type: Boolean,
    },
    tile: {
      default: false,
      type: Boolean,
    },
    large: {
      default: false,
      type: Boolean,
    },
    minWidth: {},
  },
  data: () => ({
    visible: false,

    SocialNetwork: SocialNetwork,
    finish: false,
  }),

  computed: {
    socials() {
      if (this.productOnly)
        return this.shop.socials?.filter(
          (i) => SocialNetwork[i.network] && SocialNetwork[i.network].product
        );

      if (this.activeOnly)
        return this.shop.socials.filter((i) => i.active && SocialNetwork[i.network]);

      return this.shop.socials.filter((i) => SocialNetwork[i.network]); // Check exist in web app (supported)
    },
  },

  watch: {
    visible(visible) {
      if (visible) {
        this.finish = false;
        _.delay(() => {
          this.finish = true;
        }, 5000);
      }
    },
  },

  mounted() {},

  methods: {
    getUrl(item) {
      return CreateSocialConnectLink(item.network,item.url );
    },


    hasScale(item) {
      return !this.parallax;
    },
  },
};
</script>

<style scoped lang="scss">
.toc {
  transform-origin: center;
}
.-scale {
  transform: scale(1.5);
  transition: all 0.3s !important;
}
.trn {
  transition: all 0.5s;
}
</style>
