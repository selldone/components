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
    v-bind="$attrs"
    class="tnt"
    size="small"
    variant="plain"
    @click.stop="apps_dialog = true"
  >
    <v-img
      :src="require('../../../../assets/icons/gdpr-user.svg')"
      height="20"
      width="20"
    ></v-img>

    <span class="mx-2">{{ $t("footer.shop_app_setting") }} </span>
  </v-btn>

  <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Shop Settings Dialog For Customer ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

  <v-dialog v-model="apps_dialog" content-class="rounded-xl" max-width="720px">
    <s-cookie-preferences
      :shop="$shop"
      class="rounded-xl"
      has-close
      @close="apps_dialog = false"
    ></s-cookie-preferences>
  </v-dialog>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import SCookiePreferences from "@selldone/components-vue/storefront/cookie/preferences/SCookiePreferences.vue";

export default defineComponent({
  name: "SFooterSectionGdpr",
  components: { SCookiePreferences },
  inject: ["$shop"],
  data: () => ({
    apps_dialog: false,
  }),
});
</script>

<style scoped lang="scss"></style>
