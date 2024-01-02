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

import Vue from "vue";
import $ from "jquery";

import "@core/utils/console/ConsoleStyle";

//█████████████████████████████████████████████████████████████
//――――――――――――――――― Style ―――――――――――――――――
//█████████████████████████████████████████████████████████████

import "@components/style/components.scss";

// Fonts:
import "@fortawesome/fontawesome-free/css/all.css"; // Ensure you are using css-loader

//――― SVG Filters (Css filters add elements) ―――
import { SvgFilters } from "@core/helper/style/SvgFilters";
SvgFilters.Install();

require("./components-widgets");

//█████████████████████████████████████████████████████████████
//――――――――――― Selldone ® Business OS™ ―――――――――――
//█████████████████████████████████████████████████████████████

// ━━━ Selldone Core (gapi,...) ━━━
import { SelldoneCore } from "@core/SelldoneCore";
SelldoneCore.Setup();

console.log(
  "%c――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――",
  "color:#70557e;font-weight: 800;"
);
console.style(
  '<b="font-size:20px;color:#112;font-family:Roboto;font-weight: 900;">🛍️ Selldone ® Business OS™</b>'
);
console.style(
  '<b="color:green;font-family:Roboto;"> ✔ Commerce secure platform</b>'
);
console.style('<css="font-family:Roboto;">🆕 Tanks using business OS.</css>');
console.log(
  "%c――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――",
  "color:#70557e;font-weight: 800;"
);
console.style(
  '<css="">🎁 If you find something interesting like bugs and security issue, send it to: </css><b="color:#455A64;font-family:Arial;">tech@selldone.com </b>'
);
console.style(
  '<css="">We will send an NFT of </css><b="color:#455A64;font-family:Arial;"> 🐉 Limited Selldone Dragon Club</b>  <css="font-family:Arial;">to bug hunters on the ADA Cardano chain.</css>'
);
console.log(
  "%c――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――",
  "color:#70557e;font-weight: 800;"
);

//█████████████████████████████████████████████████████████████
//――――――――――――――― Global Config ――――――――――――――
//█████████████████████████████████████████████████████████████

/**
 * @deprecated | set throttle rate in the SDK level!
 */
// @ts-ignore
window.SERACH_THROTTLE = 1500; //ms; //TODO: Should remove!

// Initial global language object:
import { Language } from "@core/enums/language/Language";
window.$language = Language.en;

//█████████████████████████████████████████████████████████████
//――――――――――――――――― Mixin ―――――――――――――――――
//█████████████████████████████████████████████████████████████
import CoreMixin from "./mixin/CoreMixin";
Vue.mixin(CoreMixin);

//█████████████████████████████████████████████████████████████
//―――――――――――――――― Directives ―――――――――――――――
//█████████████████████████████████████████████████████████████
import CopyDirective from "./directives/CopyDirective";
Vue.directive("copy", CopyDirective);

import TrackDirective from "@components/directives/TrackDirective";
Vue.directive("track", TrackDirective);

import DynamicScriptDirective from "./directives/DynamicScriptDirective";
Vue.directive("dynamic-scripts", DynamicScriptDirective);

//█████████████████████████████████████████████████████████████
//――――――――――――――――― JQuery ――――――――――――――――
//█████████████████████████████████████████████████████████████

$.cachedScript = function (url: string, options?: any) {
  // Allow user to set any option except for dataType, cache, and url
  options = $.extend(options || {}, {
    dataType: "script",
    cache: true,
    url: url,
  });

  // Use $.ajax() since it is more flexible than $.getScript
  // Return the jqXHR object so we can chain callbacks
  return $.ajax(options);
};

//―――――――――――――――――――――― SEO ――――――――――――――――――――
import { SEO } from "@core/helper/seo/SEO";
Vue.prototype.$SEO = SEO;

//█████████████████████████████████████████████████████████████
//―――――――――――――――― Interfaces ―――――――――――――――
//█████████████████████████████████████████████████████████████
import type { ILanguage } from "@core/enums/language/Language";

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

  interface JQueryStatic {
    cachedScript(url: string, options?: any): JQuery.jqXHR<any>;
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
