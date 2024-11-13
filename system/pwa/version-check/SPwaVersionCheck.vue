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
    v-if="local_version"
    v-model="new_version"
    :timeout="60000"
    :vertical="$vuetify.display.smAndDown"
    multi-line
    @click="new_version = false"
  >
    {{ $t("global.notification.new_pwa_version") }}

    <v-btn :loading="busy" color="green" variant="text" @click.stop="refreshMe">
      <v-icon class="me-1">get_app</v-icon>
      {{ $t("global.actions.update") }}
    </v-btn>
  </v-snackbar>
</template>

<script lang="ts">
import { debounce } from "lodash-es";
import { SetupService } from "@selldone/core-js/server/SetupService";

export default {
  name: "SPwaVersionCheck",
  data: () => ({
    new_version: false,
    busy: false,
  }),
  computed: {
    local_version() {
      return SetupService.PWAVersion();
    },
  },

  created() {
    //――――――――――――――――――――――――― Check for new update of Web App ―――――――――――――――――――――――――
    if (this.local_version)
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
      const fun = debounce((callback_update = null) => {
        // debounce : speed up firs load!
        axios
          .get("/check/version?v=" + SetupService.PWAVersion())
          .then(({ data }) => {
            if (!data.error) {
              if (data.version !== SetupService.PWAVersion()) {
                console.style(
                  '<b="font-size:14px;">--- New Version ---</b> <b="color:blue;"> ☄ ' +
                    data.version +
                    "</i>",
                );
                if (callback_update) callback_update(true);
              } else {
                callback_update(false);
              }
            }
          })
          .catch((error) => {
            NotificationService.showLaravelError(error);
          });
      }, 30000);

      fun(callback_update);
    },
  },
};
</script>

<style scoped></style>
