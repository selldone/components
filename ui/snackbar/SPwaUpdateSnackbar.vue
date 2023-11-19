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
  <v-snackbar
    v-model="new_version"
    multi-line
    :vertical="$vuetify.breakpoint.smAndDown"
    :timeout="60000"
    @click="new_version = false"
  >
    {{ $t("global.notification.new_pwa_version") }}

    <v-btn color="green" text @click.stop="refreshMe" :loading="busy">
      <v-icon class="me-1">get_app</v-icon>
      {{ $t("global.actions.update") }}
    </v-btn>
  </v-snackbar>
</template>

<script>
import _ from "lodash-es";
import SetupService from "@core/server/SetupService";

export default {
  name: "SPwaUpdateSnackbar",
  data: () => ({
    new_version: false,
    busy: false,
  }),

  created() {
    //――――――――――――――――――――――――― Check for new update of Web App ―――――――――――――――――――――――――
    this.getPwaVersion((need_update) => {
      if (need_update) this.new_version = true;
    });
  },

  methods: {
    refreshMe() {
      this.busy = true;
      this.$nextTick(() => {
        this.forceUpdatePwa();
      });
    },

    forceUpdatePwa() {
      window.location.reload();
    },

    //―――――――――――――――――――――― Get PWA Version ――――――――――――――――――――
    getPwaVersion(callback_update = null) {
      const fun = _.debounce((callback_update = null) => {
        // debounce : speed up firs load!
        axios
          .get("/check/version?v=" + SetupService.PWAVersion())
          .then(({ data }) => {
            if (!data.error) {
              if (data.version !== SetupService.PWAVersion()) {
                console.style(
                  '<b="font-size:14px;">--- New Version ---</b> <b="color:blue;"> ☄ ' +
                    data.version +
                    "</i>"
                );
                if (callback_update) callback_update(true);
              } else {
                callback_update(false);
              }
            }
          })
          .catch((error) => {
            this.showLaravelError(error);
          });
      }, 30000);

      fun(callback_update);
    },
  },
};
</script>

<style scoped></style>
