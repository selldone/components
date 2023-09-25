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

import Vue from "vue";
import Vuetify from "vuetify";
import "vuetify/dist/vuetify.min.css";
import SetupService from "../../../../core/server/SetupService";
import type { UserVuetifyPreset } from "vuetify/types/services/presets";
// Import the Vuetify CSS. Ensure you have configured css-loader.

Vue.use(Vuetify);

// Define the Vuetify options.
const opts: Partial<UserVuetifyPreset> = {
  theme: {
    dark: false, // Set the theme to light mode.
    themes: {
      light: {
        // Define primary, secondary, accent, error, info, success, and warning colors.
        primary: SetupService.SaminColorLight(),
        secondary: SetupService.SaminColorDark(),
        accent: "#FFA000",
        error: "#FF5252",
        info: "#9964e3",
        success: "#4CAF50",
        warning: "#FFC107",
      },
    },
  },

  icons: {
    iconfont: "md", // Specify the icon font. Options: 'mdi' || 'mdiSvg' || 'md' || 'fa' || 'fa4'
  },

  rtl: false, // Set RTL (right-to-left) mode to false.
};

// Create and export a new Vuetify instance with the defined options.
export default new Vuetify(opts);
