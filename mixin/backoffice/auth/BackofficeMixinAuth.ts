/*
 * Copyright (c) 2023. Selldone® Business OS™
 *
 * Author: M.Pajuhaan
 * Web: https://selldone.com
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * All rights reserved. In the weave of time, where traditions and innovations intermingle, this content was crafted.
 * From the essence of thought, through the corridors of creativity, each word, and sentiment has been molded.
 * Not just to exist, but to inspire. Like an artist's stroke or a sculptor's chisel, every nuance is deliberate.
 * Our journey is not just about reaching a destination, but about creating a masterpiece.
 * Tread carefully, for you're treading on dreams.
 */


import {SetupService} from "@selldone/core-js/server/SetupService.ts";

/**
 *
 * @mixin BackofficeMixinAuth
 */
export const BackofficeMixinAuth = {
  data() {
    return {
      __overlay: null,
    };
  },

  computed: {},

  watch: {},

  methods: {
    showOverlay(text: string) {
      if (!this.__overlay) {
        // Create the overlay div
        this.__overlay = document.createElement("div");
        this.__overlay.className = "s--full-page-overlay";
        // Append to body
        document.body.appendChild(this.__overlay);

        const appDiv = document.getElementById("app");
        appDiv?.classList.add("blurred", "blur-animate");
      }

      this.__overlay.innerText = text;
    },
    hideOverlay(delay_ms?: number | undefined) {
      const _run = () => {
        if (this.__overlay) document.body.removeChild(this.__overlay);
        this.__overlay = null;

        const appDiv = document.getElementById("app");
        appDiv?.classList.remove("blurred", "blur-animate");
      };

      if (delay_ms) {
        setTimeout(_run, delay_ms);
      } else {
        _run();
      }
    },

    Logout() {
      this.showOverlay("Logging out...");

      window.$backoffice.auth
        .logout()
        .then(() => {
          // this.hideOverlay(); No need because of reloading page in the next line!
          window.location.href = SetupService.MainServiceUrl(); // Refresh the page!
        })
        .catch((error) => {
          this.showLaravelError(error);
        });
    },
  },
};
