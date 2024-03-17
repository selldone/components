// @ts-nocheck
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

import {App, defineAsyncComponent} from "vue";

//---------------- Vue FilePond --------------
// Import Vue FilePond
import vueFilePond from "vue-filepond";

// Import FilePond styles
import "filepond/dist/filepond.min.css";

// Import image preview plugin styles
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css";

// Import image preview and file type validation plugins
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginImageTransform from "filepond-plugin-image-transform";
import FilePondPluginImageResize from "filepond-plugin-image-resize";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";

//―――――――――――――――――――――― Vue Notification ――――――――――――――――――――
import VueNotifications from "@kyvg/vue3-notification";
//---------------- Number format --------------
// @ts-ignore
import VueNumerals from "vue-numerals";

//---------------- Check --------------
import UCheck from "@components/ui/check/UCheck.vue";

//---------------- Price view --------------
import UPrice from "@components/ui/price/UPrice.vue";

//---------------- Loading --------------
import ULoadingEllipsis from "@components/ui/loading/ellipsis/ULoadingEllipsis.vue";

import ULoadingProgress from "@components/ui/loading/progress/ULoadingProgress.vue";


// @ts-ignore
import VueTheMask from "vue-the-mask";

//---------------- SVG Flags --------------
// @ts-ignore
import FlagIcon from "vue-flag-icon";

//---------------- Social Share --------------
import VueSocialSharing from "vue-social-sharing";
import UButtonCircle from "@components/ui/button/circle/UButtonCircle.vue";

import UTooltipTips from "@components/ui/tooltip/tips/UTooltipTips.vue";

//---------------- Medium Editor --------------
import "medium-editor";

import "@components/article/add-on/code-editor/plugin/ArticleAddonCodeEditorPlugin";
import "@components/article/add-on/comparison/plugin/ArticleAddonComparisonPlugin";
import "@components/article/add-on/catalog/plugin/ArticleAddonCatalogPlugin";
import "@components/article/add-on/canvas/plugin/ArticleAddonCanvasPlugin";

// @ts-ignore
import {MediumInsert} from "@components/article/insert/SelldoneEditorInsert";
//―――――――――――――――――――――― vue-prism-editor ――――――――――――――――――――
import "prismjs";
import "prismjs/themes/prism.css";

import {PrismEditor} from "vue-prism-editor";
import "vue-prism-editor/dist/prismeditor.min.css";

//---------------- Widget --------------
import SWidget from "@components/ui/widget/widget/SWidget.vue";

import SWidgetHeader from "@components/ui/widget/header/SWidgetHeader.vue";

import VueConfetti from "@components/ui/confetti";
import SDrag from "@components/ui/drag/core/SDrag.vue";
import SDrop from "@components/ui/drag/core/SDrop.vue";

require("@components/style/animation/vue2-animate.scss");
require("@components/style/selldone/general_animates.scss");

//---------------- prototypes --------------

require("@core/prototypes/Prototypes");

window.MediumInsert = MediumInsert;

export function installGlobalComponents(app: App) {
  // Create component
  const FilePond = vueFilePond(
    FilePondPluginFileValidateType,
    FilePondPluginImagePreview,
    FilePondPluginImageTransform,
    FilePondPluginImageResize,
    FilePondPluginFileValidateSize,
  );

  app.component("file-pond", FilePond);

  app.use(VueNotifications);

  app.use(VueNumerals);
  app.component("UCheck", UCheck);
  app.component("u-price", UPrice);
  app.component(ULoadingEllipsis.name, ULoadingEllipsis);
  app.component(ULoadingProgress.name, ULoadingProgress);

  //---------------- Map --------------

  const UMapView = defineAsyncComponent(
    () =>
      import(
        /* webpackChunkName: "plug-map" */ "@components/ui/map/view/UMapView.vue"
      ),
  );
  app.component("u-map-view", UMapView);

  //---------------- Lottie Animation View for Vue --------------

  const ULottie = defineAsyncComponent(
    () =>
      import(
        /* webpackChunkName: "plug-lottie" */ "./ui/animation/ULottie.vue"
      ),
  );
  app.component("u-lottie", ULottie);

  //---------------- State Flags --------------

  const SStateFlag = defineAsyncComponent(
    () =>
      import(
        /* webpackChunkName: "plug-flag" */ "@components/ui/country/state-flag/SStateFlag.vue"
      ),
  );
  app.component("s-state-flag", SStateFlag);

  //---------------- Miscellaneous --------------

  // + Chart:

  // Define the async component globally
  app.component(
    "apexchart",
    defineAsyncComponent(
      () =>
        import(/* webpackChunkName: "plug-miscellaneous" */ "vue3-apexcharts"),
    ),
  );

  // + QR Code:
  const SQrcode = defineAsyncComponent(
    () =>
      import(
        // @ts-ignore
        /* webpackChunkName: "plug-miscellaneous" */ "@components/ui/qrcode/UQrcode"
      ),
  );
  app.component("u-qrcode", SQrcode);

  // + Bar Code:

  const UBarcode = defineAsyncComponent(
    () =>
      import(
        // @ts-ignore
        /* webpackChunkName: "plug-miscellaneous" */ "@components/ui/barcode/UBarcode"
      ),
  );
  app.component("u-barcode", UBarcode);

  //---------------- Barcode Scanner --------------
  app.component(
    "barcode-scanner",
    // A dynamic import returns a Promise.
    () =>
      import(
        /* webpackChunkName: "plug-scanner" */ "./ui/scanner/./UScanner"
      ),
  );

  app.use(VueConfetti);

  app.use(VueTheMask);
  app.use(FlagIcon);
  app.use(VueSocialSharing);
  app.component(UButtonCircle.name, UButtonCircle);
  app.component(UTooltipTips.name, UTooltipTips);
  app.component("prism-editor", PrismEditor);
  app.component(SWidget.name, SWidget);
  app.component(SWidgetHeader.name, SWidgetHeader);

  //Vue.prototype.window = window;
  app.config.globalProperties.window = window; // 🌴 Global object in vue components

  app.component(SDrag.name, SDrag);
  app.component(SDrop.name, SDrop);
}
