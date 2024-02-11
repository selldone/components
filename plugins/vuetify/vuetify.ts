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
//import "vuetify/styles"; // Import Vuetify styles
import "./vuetify-override.scss";

import { createVuetify, VuetifyOptions } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

import { SetupService } from "@core/server/SetupService";
import { aliases, md } from "vuetify/iconsets/md";

import "@fortawesome/fontawesome-free/css/all.css"; // Ensure your project is capable of handling css files
import { fa } from "vuetify/iconsets/fa";

// Define the Vuetify options.
const vuetifyOptions: VuetifyOptions = {
  components,
  directives,

  theme: {
    defaultTheme: "light", // Set the default theme
    themes: {
      light: {
        dark: false,
        colors: {
          //   'on-background': '#000',
          //   'on-surface': '#000',

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
      dark: {
        dark: true,
        colors: {
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
  },
  icons: {
    defaultSet: "md",
    aliases,
    sets: {
      md,
      fa,
    },
  },
};

// Create and export a Vuetify instance with the defined options.
export default createVuetify(vuetifyOptions);
