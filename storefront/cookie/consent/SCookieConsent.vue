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
  <div
    :class="{ preview: preview, 'is-mobile': isMobile, delay_4s: !preview }"
    class="s--storefront-cookie-dialog slideInUp"
  >
    <v-sheet
      v-if="show"
      :class="{}"
      class="content s--shadow-no-padding border rounded-t-xl"
      color="#fafafa"
    >
      <h5 class="typo-body mb-2 font-weight-bold text-uppercase">
        {{ $t("global.cookie.title") }}
      </h5>
      <p>
        {{ $t("global.cookie.message") }}
      </p>
      <v-btn
        v-if="!hide"
        block
        class="my-3 tnt"
        color="black"
        variant="flat"
        @click="
          () => {
            setCookieAccept(true);
            hide = !preview;
          }
        "
        >{{ $t("global.cookie.agree_action") }}
      </v-btn>
      <v-btn
        :to="
          !preview
            ? { name: window.$storefront.routes.SHOP_PROFILE_PAGE_PRIVACY }
            : null
        "
        block
        class="my-3 tnt"
        variant="outlined"
        @click="hide = !preview"
      >
        {{ $t("global.cookie.preferences_action") }}
      </v-btn>
    </v-sheet>
  </div>
</template>

<script lang="ts">
import TemplateMixin from "@selldone/components-vue/mixin/template/TemplateMixin.ts";

export default {
  name: "SCookieConsent",
  mixins:[TemplateMixin],
  props: {
    preview: {
      default: false,
      type: Boolean,
    },
  },

  data: () => ({
    hide: false,
  }),

  computed: {
    show() {
      return (
        !this.hide &&
        (this.preview || localStorage.getItem(`GDPR-Cookie`) === null)
      );
    },
  },
  methods: {
    //―――――――――――――――――――――― Cookie ――――――――――――――――――――

    setCookieAccept(active) {
      if (this.preview) return; // Maybe exists in the component (preview in seller dashboard)

      // GDPR: Save in local storage if user not login!
      if (!active) localStorage.setItem(`GDPR-Cookie`, "false");
      else localStorage.setItem(`GDPR-Cookie`, "true");
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
.s--storefront-cookie-dialog {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 9999;

  &.preview {
    position: unset;
  }

  &.is-mobile {
    .content {
      padding-bottom: 96px !important;
    }
  }

  .content {
    max-width: 480px;
    padding: 16px 24px;
    margin: 0 auto;
    letter-spacing: -0.02em;
  }
}
</style>
