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
    v-intersect="
      (isIntersecting) => {
        visible = isIntersecting;
      }
    "
    :class="{
      'flex-column': vertical,
      'border-start': productOnly && socials.length,
    }"
    align="center"
    class="s--storefront-social-buttons"
    dense
  >
    <v-btn
      v-for="(item, i) in socials"
      :key="item.network"
      :class="{
        'hover-parallax': parallax,
        'm-2': !productOnly,
        tada: productOnly && visible,
      }"
      :color="SocialNetwork[item.network].color"
      :href="getUrl(item)"
      :min-width="minWidth"
      :size="size"
      :style="{ animationDelay: 500 + i * 500 + 'ms' }"
      :tile="tile"
      :title="$t(SocialNetwork[item.network].title)"
      class="toc"
      icon
      target="_blank"
      variant="text"
    >
      <img
        :class="{
          '-scale': hasScale(item) && !finish,
          swing: hasScale(item) && finish,
        }"
        :src="SocialNetwork[item.network].image"
        class="trn toc"
        height="20"
        width="20"
        :alt="item.network"
      />
    </v-btn>
  </v-row>
</template>

<script lang="ts">
import {
  CreateSocialConnectLink,
  SocialNetwork,
} from "@selldone/core-js/enums/social/SocialNetwork";
import { delay } from "lodash-es";

export default {
  name: "SStorefrontSocialButtons",
  inject: ["$shop"],
  props: {
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
    size: {
      default: 44,
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
        return this.$shop.socials?.filter(
          (i) => SocialNetwork[i.network] && SocialNetwork[i.network].product,
        );

      if (this.activeOnly)
        return this.$shop.socials.filter(
          (i) => i.active && SocialNetwork[i.network],
        );

      return this.$shop.socials.filter((i) => SocialNetwork[i.network]); // Check exist in web app (supported)
    },
  },

  watch: {
    visible(visible) {
      if (visible) {
        this.finish = false;
        delay(() => {
          this.finish = true;
        }, 5000);
      }
    },
  },

  mounted() {},

  methods: {
    getUrl(item) {
      return CreateSocialConnectLink(item.network, item.url);
    },

    hasScale(item) {
      return !this.parallax;
    },
  },
};
</script>

<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--storefront-social-buttons {
  text-align: center;
  margin: 0;

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
}
</style>
