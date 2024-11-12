/*
 * Copyright (c) 2024. Selldone® Business OS™
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

/*
 * TemplateMixin:
 * This mixin provides access to customizable theme colors (light, dark, deep, and info colors)
 * for the application. These color values can either be dynamically loaded from a global
 * `window.CUSTOME_TEMPLATE` object if present, or fall back to default values retrieved
 * from the `SetupService` via predefined methods.
 *
 * Use Case:
 * The mixin is useful for maintaining consistency across the application in terms of color schemes.
 * Developers can easily apply the theme colors to components or views by referencing these color values.
 *
 * Structure:
 * - `TemplateColorLight`: Represents the light theme color for the template.
 * - `TemplateColorDark`: Represents the primary dark theme color for the template.
 * - `TemplateColorDeepDark`: Represents an even deeper shade of the dark theme color.
 * - `TemplateColorInfo`: Represents an informational color, typically used for buttons or accents.
 *
 * Color Source:
 * - If a custom template (`window.CUSTOME_TEMPLATE`) is available, it will use the color values from there.
 * - If no custom template is defined, it will fall back to the default colors provided by the `SetupService`.
 */

import {SetupService} from "@selldone/core-js/server";

const TemplateMixin = {
  data() {
    return {
      // Customizable theme colors:
      ThemeColorLight: window.CUSTOME_TEMPLATE
        ? window.CUSTOME_TEMPLATE.color_light // Custom color from global object
        : SetupService.ColorThemeLight(), // Fallback to default light color
      ThemeColorDark: window.CUSTOME_TEMPLATE
        ? window.CUSTOME_TEMPLATE.color_dark // Custom color from global object
        : SetupService.ColorThemeDark(), // Fallback to default dark color
      ThemeColorDeepDark: window.CUSTOME_TEMPLATE
        ? window.CUSTOME_TEMPLATE.color_deep // Custom deep color from global object
        : SetupService.ColorThemeDeepDark(), // Fallback to default dark deep color
      ThemeColorInfo: window.CUSTOME_TEMPLATE
        ? window.CUSTOME_TEMPLATE.color_info // Custom info color from global object
        : SetupService.ColorThemeInfo(), // Fallback to default info color
    };
  },

  computed: {
    isMobile() {
      return this.$vuetify.display.smAndDown;
    },

    isStandalone() {
      // Detects if device is in standalone mode
      const isInWebAppiOS = window.navigator.standalone === true;

      let isInWebAppChrome = false;
      try {
        isInWebAppChrome = window.matchMedia(
            "(display-mode: standalone)",
        ).matches;
      } catch (e) {}

      return isInWebAppiOS || isInWebAppChrome;
    },

  },
};

export default TemplateMixin;
