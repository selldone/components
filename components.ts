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
//█████████████████████████████████████████████████████████████
//―――――――――――――― Js & Components――――――――――――――
//█████████████████████████████████████████████████████████████

import "@selldone/core-js/utils/console/ConsoleStyle";

//█████████████████████████████████████████████████████████████
//――――――――――――――――― Style ―――――――――――――――――
//█████████████████████████████████████████████████████████████
import "./style/components.scss";

//█████████████████████████████████████████████████████████████
//――――――――――― Selldone ® Business OS™ ―――――――――――
//█████████████████████████████████████████████████████████████
// ━━━ Selldone Core (gapi,...) ━━━
import { BackofficeLocalStorages, SelldoneCore } from "@selldone/core-js";
//█████████████████████████████████████████████████████████████
//―――――――――――――――― Interfaces ―――――――――――――――
//█████████████████████████████████████████████████████████████
import type { ILanguage } from "@selldone/core-js/enums/language/Language";
// Initial global language object:
import { Language } from "@selldone/core-js/enums/language/Language";
//█████████████████████████████████████████████████████████████
//――――――――――――――――― Mixin ―――――――――――――――――
//█████████████████████████████████████████████████████████████
import CoreMixin from "./mixin/CoreMixin";

//―――――――――――――――――――――― SEO ――――――――――――――――――――
import { SEO } from "@selldone/core-js/helper/seo/SEO";
import { App } from "vue";
import { installGlobalComponents } from "./components-mandetory";
import { installGlobalDirectives } from "./directives-mandetory";
import GlobalRules from "@selldone/core-js/helper/rules/GlobalRules.ts";

SelldoneCore.Setup();

console.log(
  "%c――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――",
  "color:#70557e;font-weight: 800;",
);
console.style(
  '<b="font-size:20px;color:#112;font-family:Roboto;font-weight: 900;">🛍️ Selldone ® Business OS™</b>',
);
console.style(
  '<b="color:green;font-family:Roboto;"> ✔ Commerce secure platform</b>',
);
console.style('<css="font-family:Roboto;">🆕 Tanks using business OS.</css>');
console.log(
  "%c――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――",
  "color:#70557e;font-weight: 800;",
);
console.style(
  '<css="">🎁 If you find something interesting like bugs and security issue, send it to: </css><b="color:#455A64;font-family:Arial;">tech@selldone.com </b>',
);
console.style(
  '<css="">We will send an NFT of </css><b="color:#455A64;font-family:Arial;"> 🐉 Limited Selldone Dragon Club</b>  <css="font-family:Arial;">to bug hunters on the ADA Cardano chain.</css>',
);
console.log(
  "%c――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――",
  "color:#70557e;font-weight: 800;",
);

//█████████████████████████████████████████████████████████████
//――――――――――――――― Global Config ――――――――――――――
//█████████████████████████████████████████████████████████████

/**
 * @deprecated | set throttle rate in the SDK level!
 */
// @ts-ignore
window.SERACH_THROTTLE = 1500; //ms; //TODO: Should remove!

window.$language = Language.en;

declare global {
  interface Window {
    CUSTOME_TEMPLATE:
      | {
          color_light: string;
          color_dark: string;
          color_deep: string;
          color_info: string;
        }
      | null
      | undefined;

    $language: ILanguage;
  }

  interface HTMLElement {
    loadedScripts?: string[] /** {@see DynamicScriptDirective} */;
  }

  /**
   * The `standalone` property indicates if the browser is running in standalone mode.
   *
   * Standalone mode occurs when the webpage is saved to the home screen on iOS devices,
   * allowing the webpage to be viewed in full-screen mode without the browser UI. This is
   * a non-standard property specific to iOS Safari.
   *
   * @property {boolean} standalone - true if the browser is running in standalone mode, false otherwise.
   * @see {@link https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariHTMLRef/Articles/MetaTags.html}
   */
  interface Navigator {
    standalone?: boolean;
  }
}
export {};

export function createComponents(options: {
  components?: any;
  directives?: any;
}) {
  const { components = {}, directives = {} } = options;

  const install = (app: App, options?: any) => {
    app.mixin(CoreMixin);

    app.config.globalProperties.$SEO = SEO; // 🌴 Global object in vue components

    installGlobalComponents(app);
    installGlobalDirectives(app);

    for (const key in directives) {
      app.directive(key, directives[key]);
    }
    for (const key in components) {
      app.component(key, components[key]);
    }

    // Initial global constants:
    app.config.globalProperties.SUB_TOOLBAR_CONFIG = {
      flat: true,
      color: "transparent",
      class: "overflow-x-auto overflow-y-hidden thin-scroll pb-4",
      minHeight: "84px",
    };
    //――― Images ―――
    app.config.globalProperties.IMAGE_SIZE_SMALL =
      BackofficeLocalStorages.IMAGE_SIZE_SMALL;
    app.config.globalProperties.IMAGE_SIZE_BLOG = 256;

    //――― Validation Rules ―――
    app.config.globalProperties.GlobalRules = GlobalRules;
  };
  return {
    install,
  };
}
