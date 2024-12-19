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
  <div class="d-inline-flex flex-row align-center justify-center">
    <div :class="{ '-small': small, '-large': forceLarge }" class="social-btns">
      <share-network
        v-for="item in items"
        :key="item.code"
        :network="item.code"
        :url="url"
        :title="title"
        :description="description"
        :quote="quote"
        :hashtags="hashtags_string"
        :media="media"
        :twitterUser="twitter_user"
      >
        <a :class="`btn ${item.code}`" @click="$emit('share', item.code)"
          ><i :class="item.icon"
        /></a>
      </share-network>

      <a
        v-if="networks.includes('embed') && embedCode"
        class="btn embed"
        @click="
          copyToClipboard(embedCode);
          $emit('embed');
        "
        ><i class="fas fa-code"
      /></a>

      <a
        v-if="networks.includes('copy') && url"
        class="btn copy pp"
        @click="
          copyToClipboard(url);
          $emit('share', 'copy');
        "
        ><i class="fas fa-copy"
      /></a>
    </div>
  </div>
</template>

<script lang="ts">
import { SetupService } from "@selldone/core-js/server/SetupService";
import VueSocialSharing from "vue-social-sharing/src/share-network.js";

export default {
  name: "UButtonShareGroup",
  components: {
    "share-network": VueSocialSharing,
  },
  props: {
    networks: {
      type: Array,
      default: () => [
        "facebook",
        "twitter",
        "linkedin",
        "line",
        "pinterest",
        "reddit",
        "telegram",
        "whatsapp",
        "skype",
        "sms",
        "email",
        "embed",
        "copy",
      ],
    },

    url: {
      required: true,
      type: String,
    },
    title: {
      required: true,
      type: String,
    },
    description: {
      required: false,
    },
    quote: {
      required: false,
    },
    hashtags: {
      required: false,
      type: String,
    },
    media: {},

    telegramRhash: {
      required: false,
      type: String,
    },
    embedCode: {
      required: false,
      type: String,
    },
    small: {
      type: Boolean,
      default: false,
    },
    forceLarge: {
      type: Boolean,
      default: false,
    },
  },
  data: function () {
    return {};
  },
  computed: {
    items() {
      const out = [];
      if (this.networks.includes("facebook")) {
        out.push({ code: "facebook", icon: "fab fa-facebook" });
      }
      if (this.networks.includes("twitter")) {
        out.push({ code: "twitter", icon: "fab fa-twitter" });
      }
      if (this.networks.includes("linkedin")) {
        out.push({ code: "linkedin", icon: "fab fa-linkedin" });
      }
      if (this.networks.includes("line")) {
        out.push({ code: "line", icon: "fab fa-line" });
      }
      if (this.networks.includes("pinterest")) {
        out.push({ code: "pinterest", icon: "fab fa-pinterest" });
      }
      if (this.networks.includes("reddit")) {
        out.push({ code: "reddit", icon: "fab fa-reddit" });
      }
      if (this.networks.includes("telegram")) {
        out.push({ code: "telegram", icon: "fab fa-telegram" });
      }
      if (this.networks.includes("whatsapp")) {
        out.push({ code: "whatsapp", icon: "fab fa-whatsapp" });
      }
      if (this.networks.includes("skype")) {
        out.push({ code: "skype", icon: "fab fa-skype" });
      }
      if (this.networks.includes("sms")) {
        out.push({ code: "sms", icon: "fas fa-sms" });
      }
      if (this.networks.includes("email")) {
        out.push({ code: "email", icon: "fas fa-envelope" });
      }

      return out;
    },

    hashtags_string() {
      return this.hashtags ? this.hashtags.replace(/-/g, "") : "";
    },

    twitter_user() {
      return SetupService.GetTwitterAccount(); // Assuming this function returns a string
    },
  },
  methods: {},
};
</script>

<style lang="scss" scoped>
// Variables
$btn-size: 70px;

$sites: (
  "facebook": #3b5998,
  "twitter": #33ccff,
  // Expanded from #3CF
  "google": #dc4a38,
  "linkedin": #0080d1,
  "dribbble": #f26798,
  "skype": #00aff0,
  "email": #ffa000,
  "pinterest": #d32f2f,
  "reddit": #e64a19,
  "sms": #455a64,
  "telegram": #0288d1,
  "whatsapp": #689f38,
  "tumblr": #35465c,
  "line": #5cd037,
  "embed": #70557e,
  "copy": #333333,
);

// Mixins
@mixin animate {
  transition: all 0.35s;
  transition-timing-function: cubic-bezier(0.31, -0.105, 0.43, 1.59);
}

@mixin btn__inactive {
  &:before {
    top: 90%;
    left: -110%;
  }

  .fab,
  .fas {
    transform: scale(0.8);
  }

  @each $name, $color in $sites {
    &.#{$name} {
      &:before {
        background-color: $color;
      }

      .fab,
      .fas {
        //  color: $color;
        color: #000;
      }
    }
  }
}

@mixin btn__active {
  &:before {
    top: -10%;
    left: -10%;
  }

  .fab,
  .fas {
    color: #ffffff;
    transform: scale(1);
  }
}

// Main Styles
.social-btns {
  // height: $btn-size; // Uncomment if height is needed
  margin: auto;
  font-size: 0;
  text-align: center;
  position: relative;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;

  &.-small {
    .btn {
      width: 42px;
      height: 42px;
      line-height: 42px;
      margin: 6px !important;

      .fab,
      .fas {
        font-size: 18px;
      }
    }
  }

  &:not(.-large) {
    .btn {
      @media only screen and (max-width: 600px) {
        width: 42px;
        height: 42px;
        line-height: 42px;
        margin: 6px !important;

        .fab,
        .fas {
          font-size: 18px;
        }
      }
    }
  }

  .btn {
    @include btn__inactive;
    @include animate;
    margin: 4px 10px !important;
    display: inline-block;
    background-color: #ffffff;
    width: $btn-size;
    height: $btn-size;
    line-height: $btn-size;
    text-align: center;
    position: relative;
    overflow: hidden;
    border-radius: 28%;
    box-shadow: 0 5px 15px -5px rgba(0, 0, 0, 0.1) !important;
    opacity: 0.99; // Overflow bug fix

    &:before {
      @include animate;
      content: "";
      width: 120%;
      height: 120%;
      position: absolute;
      transform: rotate(45deg);
    }

    .fab,
    .fas {
      @include animate;
      font-size: 38px;
      vertical-align: middle;
    }

    &:focus,
    &:hover {
      @include btn__active;
    }
  }
}
</style>
