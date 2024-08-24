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
  <div class="s--footer-section-copyright">
    <i class="fas fa-copyright me-1" />
    {{ new Date().getFullYear() }},

    {{ $t("footer.copyright", { shop_title: $shop.title }) }}
  </div>


</template>
<script lang="ts">
import { defineComponent } from "vue";
import SCookiePreferences from "@selldone/components-vue/storefront/cookie/preferences/SCookiePreferences.vue";

export default defineComponent({
  name: "SFooterSectionCopyright",
  components: {  },
  inject: ["$shop"],
  data: () => ({

  }),
});
</script>

<style scoped lang="scss">
.s--footer-section-copyright{
  font-size: 0.8rem;
}
</style>
