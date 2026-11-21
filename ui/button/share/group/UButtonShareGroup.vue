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
      <a
        v-for="item in items"
        :key="item.code"
        :class="`btn ${item.code} share-network-${item.code}`"
        :href="item.href"
        target="_blank"
        rel="noopener noreferrer"
        :aria-label="item.code"
        :aria-disabled="item.href ? undefined : 'true'"
        @click="openShare(item, $event)"
      >
        <i :class="item.icon" aria-hidden="true" />
      </a>

      <component
        :is="embedMode ? 'button' : 'a'"
        :type="embedMode ? 'button' : undefined"
        :aria-label="embedMode ? $t('global.commons.embed') : undefined"
        v-if="networks.includes('embed') && embedCode"
        class="btn embed"
        @click="
          copyToClipboard(embedCode);
          $emit('embed');
        "
        ><i class="fas fa-code"
      /></component>

      <component
        :is="embedMode ? 'button' : 'a'"
        :type="embedMode ? 'button' : undefined"
        :aria-label="embedMode ? $t('global.actions.copy') : undefined"
        v-if="networks.includes('copy') && url"
        class="btn copy pp"
        @click="
          copyToClipboard(url);
          $emit('share', 'copy');
        "
        ><i class="fas fa-copy"
      /></component>
    </div>
  </div>
</template>

<script lang="ts">
import { SetupService } from "@selldone/core-js/server/SetupService";
import { defineComponent, type PropType } from "vue";

const socialNetworks = [
  { code: "facebook", icon: "fab fa-facebook" },
  { code: "twitter", icon: "fab fa-twitter" },
  { code: "linkedin", icon: "fab fa-linkedin" },
  { code: "line", icon: "fab fa-line" },
  { code: "pinterest", icon: "fab fa-pinterest" },
  { code: "reddit", icon: "fab fa-reddit" },
  { code: "telegram", icon: "fab fa-telegram" },
  { code: "whatsapp", icon: "fab fa-whatsapp" },
  { code: "skype", icon: "fab fa-skype" },
  { code: "sms", icon: "fas fa-sms" },
  { code: "email", icon: "fas fa-envelope" },
] as const;

type SocialNetwork = (typeof socialNetworks)[number]["code"];
type ShareDetails = {
  url: string;
  title: string;
  description: string;
  quote: string;
  hashtags: string;
  media: string;
  twitterUser: string;
};

function webUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return;
  try {
    const url = new URL(value);
    if ((url.protocol === "http:" || url.protocol === "https:") && !url.username && !url.password) {
      return url.href;
    }
  } catch {
    return;
  }
}

function encodeShareText(text: string): string {
  // A truncated string can end in half of a surrogate pair.
  return encodeURIComponent(text.replace(/[\uD800-\uDFFF]/gu, "\uFFFD"));
}

function shareHref(network: SocialNetwork, details: ShareDetails): string {
  const url = encodeURIComponent(details.url);
  const title = encodeShareText(details.title);
  const description = encodeShareText(details.description);
  const message = `${title}%0D%0A${url}%0D%0A${description}`;

  switch (network) {
    case "facebook": {
      const firstHashtag = details.hashtags.split(",")[0];
      const hashtag = firstHashtag ? encodeShareText(`#${firstHashtag}`) : "";
      const quote = encodeShareText(details.quote);
      return `https://www.facebook.com/sharer/sharer.php?u=${url}&title=${title}&description=${description}&quote=${quote}&hashtag=${hashtag}`;
    }
    case "twitter": {
      const hashtags = details.hashtags ? `&hashtags=${encodeShareText(details.hashtags)}` : "";
      const via = details.twitterUser ? `&via=${encodeShareText(details.twitterUser)}` : "";
      return `https://twitter.com/intent/tweet?text=${title}&url=${url}${hashtags}${via}`;
    }
    case "linkedin":
      return `https://www.linkedin.com/shareArticle?url=${url}`;
    case "line":
      return `https://line.me/R/msg/text/?${message}`;
    case "pinterest":
      return `https://pinterest.com/pin/create/button/?url=${url}&media=${encodeURIComponent(details.media)}&description=${title}`;
    case "reddit":
      return `https://www.reddit.com/submit?url=${url}&title=${title}`;
    case "telegram":
      return `https://t.me/share/url?url=${url}&text=${title}%0D%0A${description}`;
    case "whatsapp":
      return `https://api.whatsapp.com/send?text=${message}`;
    case "skype":
      return `https://web.skype.com/share?url=${message}`;
    case "sms": {
      const ios = typeof navigator !== "undefined" && /iphone|ipad/i.test(navigator.userAgent);
      return `sms:${ios ? "&" : "?"}body=${message}`;
    }
    case "email": {
      const subject = encodeShareText(details.title.replace(/[\r\n]+/g, " "));
      return `mailto:?subject=${subject}&body=${url}%0D%0A${description}`;
    }
  }
}

export default defineComponent({
  name: "UButtonShareGroup",
  emits: ["share", "embed"],
  props: {
    embedMode: { type: Boolean, default: false },
    networks: {
      type: Array as PropType<string[]>,
      default: () => [...socialNetworks.map(({ code }) => code), "embed", "copy"],
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
  computed: {
    items() {
      const url = webUrl(this.url);
      const details = url && {
        url,
        title: this.title ?? "",
        description: String(this.description ?? ""),
        quote: String(this.quote ?? ""),
        hashtags: (this.hashtags ?? "").replace(/-/g, ""),
        media: webUrl(this.media) ?? "",
        twitterUser: typeof window !== "undefined" && this.networks.includes("twitter")
          ? SetupService.GetTwitterAccount() ?? ""
          : "",
      };
      return socialNetworks.filter(({ code }) => this.networks.includes(code)).map((item) => ({
        ...item,
        href: details ? shareHref(item.code, details) : undefined,
      }));
    },
  },
  methods: {
    openShare(item: { code: SocialNetwork; href?: string }, event: MouseEvent) {
      if (!item.href || event.defaultPrevented) return;
      this.$emit("share", item.code);
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();

      if (item.code === "email" || item.code === "sms") {
        window.open(item.href, "_blank", "noopener,noreferrer");
        return;
      }

      const width = 626;
      const height = 436;
      const left = Math.round(window.screenX + (window.outerWidth - width) / 2);
      const top = Math.round(window.screenY + (window.outerHeight - height) / 2);
      window.open(item.href, "_blank", `popup,noopener,noreferrer,width=${width},height=${height},left=${left},top=${top}`);
    },
  },
});
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
    transform: scale(1);
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
    transform: scale(1.4);
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
