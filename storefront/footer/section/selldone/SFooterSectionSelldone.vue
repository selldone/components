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
  <v-btn
    v-if="show_selldone"
    :href="SetupService.MainServiceUrl()"
    class="tnt"
    target="_blank"
    variant="plain"
  >
    <small>{{ $t("footer.powered_by") }}</small>

    <svg
      :class="{ dark: dark }"
      class="ms-1 s--footer-svg"
      height="23px"
      viewBox="0 0 33.37 13.62"
      width="auto"
    >
      <g>
        <path
          class="fil1"
          d="M10.53 5.12c-.12.08-.25.12-.38.12a.4.4 0 0 1-.27-.09.567.567 0 0 1-.18-.2.552.552 0 0 1-.09-.23.285.285 0 0 1 0-.16c.11-.05.22-.11.34-.17.11-.07.22-.14.32-.22.1-.08.19-.17.26-.26.06-.09.11-.18.13-.28a.18.18 0 0 0-.04-.14c-.04-.04-.11-.07-.21-.08-.04-.01-.08-.02-.11-.02h-.12c-.16 0-.34.02-.54.06-.2.03-.4.08-.61.15-.2.07-.41.15-.6.25-.2.09-.38.21-.53.34-.16.13-.29.28-.39.44-.1.16-.16.33-.17.52-.01.13 0 .25.03.38.03.12.07.24.13.36.05.12.12.23.19.35.07.11.15.22.23.34.09.14.18.29.27.43.09.15.17.3.22.46.06.16.1.33.12.5.02.17.01.36-.04.55-.07.28-.23.56-.45.86-.23.29-.5.55-.82.79-.31.24-.66.43-1.04.57-.37.14-.75.21-1.12.19a2.03 2.03 0 0 1-.65-.15c-.22-.08-.42-.19-.61-.33-.18-.14-.33-.31-.44-.52-.1-.21-.14-.45-.1-.72.04-.3.15-.58.32-.86.18-.28.46-.54.84-.8H4.4c.03-.03.1-.02.21.02.1.05.21.11.32.19.1.08.19.15.27.24.08.08.11.14.09.18l-.2.11c-.1.06-.21.11-.31.18-.11.06-.21.12-.3.2-.09.08-.16.16-.23.26a.69.69 0 0 0-.12.32c-.03.19-.02.34.04.45.06.12.14.21.26.27.11.07.24.11.39.14.15.02.3.03.45.03.27 0 .52-.04.75-.11.24-.08.45-.19.63-.33.19-.14.34-.31.46-.5.12-.2.2-.43.24-.68.02-.12.02-.25-.01-.37-.02-.12-.06-.24-.12-.35-.05-.11-.12-.22-.2-.33-.07-.11-.15-.22-.23-.33l-.27-.39c-.09-.13-.16-.27-.22-.41-.06-.15-.1-.3-.12-.45-.01-.15 0-.32.05-.49.07-.26.18-.5.35-.74.16-.24.36-.46.59-.66.23-.21.48-.4.76-.56.28-.17.57-.31.87-.43.3-.11.59-.2.89-.26.3-.06.59-.08.86-.07.16.02.3.05.4.11.11.06.19.13.25.23.05.09.09.19.1.31.01.12.01.25-.02.38-.05.3-.13.55-.26.77-.12.22-.27.43-.45.61l-.04.03z"
        />
        <path
          id="_1"
          class="fil1"
          d="M12.06 7.19c-.28.41-.6.76-.98 1.04s-.78.48-1.22.62c-.01.12 0 .24.03.35.03.11.1.18.2.2h-.01c.09.02.2.01.32-.02.13-.04.27-.11.42-.2.15-.1.31-.22.48-.37.16-.16.33-.34.5-.55.09-.11.17-.22.25-.34.08-.12.16-.23.23-.34a.3.3 0 0 1 .18-.1c.06 0 .11.01.16.05.04.03.07.08.08.15.01.06-.01.13-.07.21l-.17.25c-.15.21-.33.44-.54.69-.21.25-.45.5-.72.73-.16.13-.31.23-.46.31-.15.07-.28.12-.41.16-.12.03-.24.05-.34.06-.1.01-.17.01-.23.01-.36 0-.62-.1-.78-.31-.16-.21-.22-.5-.17-.86.04-.31.14-.62.3-.92.16-.31.39-.63.68-.98.1-.12.23-.24.38-.38.15-.13.32-.25.5-.36.18-.11.37-.2.57-.27.2-.07.38-.11.56-.1.19 0 .34.07.44.19.09.12.12.29.09.5-.02.09-.05.18-.09.28-.04.09-.11.2-.18.3zm-.36-.58c-.17.04-.33.11-.49.23-.17.11-.32.25-.46.41-.15.16-.28.32-.4.5s-.22.35-.3.51c.33-.14.64-.32.92-.55.28-.23.52-.5.72-.82.03-.03.05-.07.06-.11.01-.04.02-.07.03-.1.01-.06-.01-.08-.08-.07z"
        />
        <path
          id="_2"
          class="fil1"
          d="M14.13 6.25c-.05.09-.13.21-.22.36-.1.16-.21.33-.32.52-.11.18-.23.38-.35.59-.12.2-.23.4-.34.6-.1.19-.18.37-.25.53-.07.16-.11.29-.13.39-.01.01-.01.02-.01.03 0 .01 0 .02-.01.02h.05c.13-.04.27-.12.4-.22.13-.11.25-.23.37-.36.12-.13.24-.27.35-.42.11-.15.22-.3.32-.44h-.01c.03-.05.06-.09.09-.13.03-.04.06-.07.09-.11.02-.03.05-.04.1-.02.05.01.09.04.14.07.04.03.07.07.1.11.03.05.03.09.01.12l-.23.31c-.19.27-.39.53-.61.8-.22.28-.46.51-.7.72-.05.03-.1.07-.16.12-.07.04-.14.08-.22.12-.08.04-.16.07-.25.09-.09.03-.18.04-.26.04-.11 0-.19-.03-.25-.07a.4.4 0 0 1-.15-.19.662.662 0 0 1-.07-.26c0-.1 0-.21.02-.33.01-.05.02-.11.04-.17.01-.05.03-.11.04-.15.14-.47.34-.92.59-1.36.24-.43.5-.87.76-1.29l.38-.59c.11-.17.21-.35.32-.54l.3-.54c.09-.17.18-.34.26-.51.08-.16.15-.31.2-.45.08-.04.17-.04.27 0s.19.1.27.19c.08.08.14.18.18.28.04.11.04.22 0 .32-.03.07-.09.17-.16.3-.08.13-.17.28-.27.44-.1.16-.2.33-.31.5-.11.18-.21.34-.31.49l-.06.09z"
        />
        <path
          id="_3"
          class="fil1"
          d="M16.01 6.25c-.06.09-.14.21-.23.36-.1.16-.21.33-.32.52-.11.18-.23.38-.35.59-.12.2-.23.4-.34.6-.1.19-.18.37-.25.53-.07.16-.11.29-.13.39-.01.01-.01.02-.01.03 0 .01 0 .02-.01.02h.05c.13-.04.27-.12.4-.22.13-.11.25-.23.37-.36.12-.13.24-.27.35-.42.11-.15.22-.3.32-.44h-.01c.03-.05.06-.09.09-.13.04-.04.07-.07.09-.11.02-.03.05-.04.1-.02.05.01.09.04.14.07.04.03.08.07.1.11.03.05.03.09.01.12l-.23.31c-.19.27-.39.53-.61.8-.22.28-.46.51-.7.72-.04.03-.1.07-.16.12-.07.04-.14.08-.22.12-.08.04-.16.07-.25.09-.09.03-.17.04-.26.04-.1 0-.19-.03-.25-.07a.4.4 0 0 1-.15-.19.662.662 0 0 1-.07-.26c0-.1 0-.21.02-.33.01-.05.02-.11.04-.17a.66.66 0 0 1 .05-.15c.13-.47.33-.92.58-1.36.24-.43.5-.87.76-1.29l.38-.59c.11-.17.21-.35.32-.54l.3-.54c.09-.17.18-.34.26-.51.08-.16.15-.31.21-.45.07-.04.16-.04.26 0s.19.1.27.19c.08.08.14.18.18.28.04.11.04.22 0 .32-.03.07-.08.17-.16.3-.08.13-.17.28-.27.44-.1.16-.2.33-.31.5-.11.18-.21.34-.31.49l-.05.09z"
        />
        <path
          id="_4"
          class="fil1"
          d="M18.68 8.47c-.07.13-.14.26-.19.4-.06.13-.09.25-.11.35-.01.04-.02.06-.04.07h.07c.14-.04.28-.12.41-.23.13-.1.25-.23.38-.36.12-.14.24-.28.35-.44.11-.16.22-.3.32-.45.04-.04.07-.07.09-.1.02-.02.03-.05.05-.09.02-.02.06-.03.11-.01.05.01.1.03.14.06.05.03.09.07.11.12.03.04.03.08 0 .11l-.2.28v.01c-.2.27-.4.54-.62.81-.22.26-.46.5-.72.72-.04.03-.09.07-.16.12-.06.04-.13.08-.21.12-.07.04-.15.08-.24.1-.09.03-.18.04-.27.03-.23-.02-.38-.09-.47-.23a.762.762 0 0 1-.1-.53c-.21.2-.42.37-.64.51-.21.14-.41.21-.61.22a.839.839 0 0 1-.42-.15.8.8 0 0 1-.23-.29 1.06 1.06 0 0 1-.09-.36c-.01-.13 0-.25.01-.36.02-.1.04-.18.06-.25.05-.17.13-.36.23-.56.11-.2.24-.41.39-.61.14-.21.31-.4.49-.59.17-.19.36-.36.56-.51.2-.15.41-.27.61-.36.21-.08.41-.13.62-.13.06 0 .12.01.17.02.06 0 .12.02.18.04.13.04.22.12.29.23l.06-.09.26-.41c.12-.17.23-.35.34-.53.11-.19.21-.37.31-.55.09-.18.18-.35.25-.51.08-.17.15-.32.2-.45.07-.04.16-.04.26 0s.2.1.28.18c.08.08.14.18.19.29.04.11.03.22-.02.32-.03.06-.08.15-.15.28-.07.13-.16.27-.26.44-.1.16-.21.33-.32.51-.12.18-.22.35-.32.5l-.25.39.01-.01c-.2.29-.39.59-.59.91-.19.31-.38.65-.55 1.02h-.02zm-1.98.72c.07-.02.15-.07.26-.16.11-.08.22-.19.33-.3.12-.12.23-.25.35-.38.11-.13.21-.25.29-.36l.12-.23c.16-.32.34-.62.54-.93a.478.478 0 0 0-.06-.18c-.03-.05-.09-.08-.17-.09-.17-.01-.34.06-.52.18-.19.13-.36.29-.53.49-.16.19-.32.4-.45.62-.14.23-.25.43-.33.61-.02.05-.04.11-.06.19-.03.08-.04.15-.05.23-.01.05-.02.1-.02.14 0 .05.01.09.03.12.02.03.06.05.1.06.04.01.1.01.17-.01z"
        />
        <path
          id="_5"
          class="fil1"
          d="M22.38 5.9c.18.04.32.13.4.27.09.14.14.31.15.49.04.06.08.14.09.23.02.1.03.2.03.32-.01.03-.01.07-.02.11 0 .03 0 .08-.01.13-.04.2-.09.4-.18.61-.09.2-.19.4-.31.6-.12.19-.26.37-.41.55-.15.17-.31.32-.48.45-.17.13-.34.23-.51.3-.17.07-.34.11-.51.11-.3 0-.54-.1-.74-.3-.19-.19-.3-.49-.31-.9 0-.05.01-.11.01-.16.01-.06.01-.12.02-.19.03-.2.1-.4.2-.61.09-.22.21-.42.35-.62.14-.2.3-.39.48-.56.18-.18.36-.33.56-.46.19-.13.39-.22.59-.29.2-.07.4-.1.6-.08zm-.49 1.83c-.04-.01-.06-.04-.07-.09a.88.88 0 0 1-.02-.17c0-.07.01-.13.02-.2s.02-.13.03-.18c.01-.06.04-.12.09-.18.04-.06.09-.11.14-.15.05-.05.1-.08.15-.12.05-.03.08-.05.11-.07-.01-.01-.04-.01-.09-.01-.11.01-.22.05-.36.12-.13.07-.26.16-.38.27-.13.11-.24.24-.35.38-.11.15-.2.29-.29.45-.08.15-.16.3-.21.45-.06.15-.1.29-.12.42-.03.18-.02.33.02.44.05.12.15.19.3.2.11 0 .23-.03.35-.09.12-.06.24-.15.35-.25.12-.11.23-.24.34-.38.11-.14.21-.29.3-.44.08-.16.16-.31.22-.46.06-.16.1-.3.12-.43l.01-.03c-.04 0-.08.01-.13.04s-.09.07-.14.11c-.04.04-.08.08-.11.13-.04.05-.06.09-.08.13l-.2.11z"
        />
        <path
          id="_6"
          class="fil1"
          d="M26.72 8.56c-.09.12-.21.27-.35.44-.14.17-.3.34-.47.5-.17.16-.35.3-.53.42-.18.11-.34.17-.5.17-.1 0-.19-.02-.28-.06a.503.503 0 0 1-.22-.16.704.704 0 0 1-.11-.29c-.02-.12-.02-.26.02-.42.03-.14.07-.28.12-.41a7.686 7.686 0 0 1 .43-.91c.09-.17.2-.37.32-.59.05-.09.1-.17.13-.26.04-.08.06-.14.07-.19l-.34.28c-.19.16-.37.33-.54.49-.16.16-.33.34-.5.53-.16.29-.3.58-.42.88-.13.3-.23.6-.31.91-.02.05-.07.08-.15.07a.59.59 0 0 1-.24-.07.513.513 0 0 1-.23-.15c-.07-.06-.1-.12-.1-.18.05-.2.1-.41.17-.6.06-.2.14-.4.22-.59l.27-.57c.1-.19.19-.38.29-.57.11-.22.22-.44.33-.65.1-.21.2-.41.28-.61.06-.02.13-.02.21 0 .08.03.16.07.23.12.07.06.14.13.19.21.06.08.09.16.11.25.2-.16.4-.31.6-.42.21-.12.41-.18.62-.2.06 0 .12.03.19.09.06.06.11.13.16.21.05.09.08.18.09.27.02.1.01.19-.03.26-.12.24-.24.46-.35.67-.12.2-.22.38-.3.53-.07.13-.14.25-.21.36-.06.1-.11.21-.16.32-.05.11-.1.21-.13.33-.04.11-.08.23-.11.36 0-.01.02-.03.05-.04h-.01c.14-.07.31-.19.51-.36.21-.17.42-.39.64-.68.06-.07.12-.15.17-.22.06-.07.11-.14.16-.2l.13-.21c.02-.02.06-.03.11-.01.05.01.1.03.14.06.04.03.08.07.1.12.03.04.03.08 0 .11l.01-.01-.48.67z"
        />
        <path
          id="_7"
          class="fil1"
          d="M29.5 7.19c-.28.41-.61.76-.98 1.04-.38.28-.79.48-1.22.62-.01.12 0 .24.03.35.03.11.09.18.2.2h-.01c.09.02.19.01.32-.02.13-.04.27-.11.42-.2.15-.1.31-.22.47-.37.17-.16.34-.34.51-.55.08-.11.17-.22.25-.34.08-.12.16-.23.23-.34.05-.06.11-.09.17-.1.07 0 .12.01.16.05.05.03.07.08.09.15.01.06-.01.13-.07.21l-.17.25c-.15.21-.33.44-.54.69-.21.25-.45.5-.72.73-.16.13-.31.23-.46.31-.15.07-.29.12-.41.16-.13.03-.24.05-.34.06-.1.01-.18.01-.23.01-.36 0-.62-.1-.78-.31-.16-.21-.22-.5-.18-.86.05-.31.15-.62.31-.92.16-.31.38-.63.68-.98.1-.12.23-.24.38-.38.15-.13.32-.25.5-.36.18-.11.37-.2.57-.27.19-.07.38-.11.56-.1.19 0 .34.07.43.19.1.12.13.29.09.5-.01.09-.04.18-.08.28-.05.09-.11.2-.19.3h.01zm-.36-.58a1.4 1.4 0 0 0-.5.23c-.16.11-.31.25-.45.41-.15.16-.28.32-.4.5s-.22.35-.3.51c.33-.14.64-.32.92-.55.28-.23.52-.5.72-.82.03-.03.05-.07.06-.11.01-.04.02-.07.03-.1.01-.06-.02-.08-.08-.07z"
        />
      </g>
    </svg>
  </v-btn>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { SetupService } from "@selldone/core-js/server";

export default defineComponent({
  name: "SFooterSectionSelldone",

  data: () => ({
    SetupService: SetupService,

    show_selldone: SetupService.ShowSelldoneCopyright(),
  }),
});
</script>

<style scoped lang="scss">
.s--footer-svg {
  .fil1 {
    fill: #373435;
    fill-rule: nonzero;
  }

  .fil0 {
    fill: #70557e;
    fill-rule: nonzero;
  }

  &.dark {
    .fil1 {
      fill: #fff;
      fill-rule: nonzero;
    }

    .fil0 {
      fill: #fff;
      fill-rule: nonzero;
    }
  }
}
</style>
