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

import { App, defineAsyncComponent } from "vue";



//―――――――――――――――――――――― Vue Notification ――――――――――――――――――――
import VueNotifications from "@kyvg/vue3-notification";
//---------------- Number format --------------
// @ts-ignore
import VueNumerals from "vue-numerals";

//---------------- Check --------------
import UCheck from "./ui/check/UCheck.vue";

//---------------- Price view --------------
import UPrice from "./ui/price/UPrice.vue";

//---------------- Loading --------------

import ULoadingProgress from "./ui/loading/progress/ULoadingProgress.vue";

// @ts-ignore
import VueTheMask from "vue-the-mask";

//---------------- SVG Flags --------------
// @ts-ignore
import FlagIcon from "vue-flag-icon";

//---------------- Social Share --------------
import UButtonCircle from "./ui/button/circle/UButtonCircle.vue";

import UTooltipTips from "./ui/tooltip/tips/UTooltipTips.vue";




//---------------- Widget --------------
import SWidget from "./ui/widget/widget/SWidget.vue";

import UWidgetHeader from "./ui/widget/header/UWidgetHeader.vue";

import VueConfetti from "./ui/confetti";

//---------------- prototypes --------------

import "@selldone/core-js/prototypes/Prototypes";


export function installGlobalComponents(app: App) {
  // Create component


  app.use(VueNotifications);

  app.use(VueNumerals);
  app.component("UCheck", UCheck);
  app.component("u-price", UPrice);
  app.component(ULoadingProgress.name, ULoadingProgress);






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
        /* webpackChunkName: "plug-miscellaneous" */ "./ui/qrcode/UQrcode.vue"
      ),
  );
  app.component("u-qrcode", SQrcode);

  // + Bar Code:

  const UBarcode = defineAsyncComponent(
    () =>
      import(
        /* webpackChunkName: "plug-miscellaneous" */ "./ui/barcode/UBarcode.vue"
      ),
  );
  app.component("u-barcode", UBarcode);

  const ULottie = defineAsyncComponent(
      () =>
          import(
              /* webpackChunkName: "plug-lottie" */ "@selldone/components-vue/ui/lottie/ULottie.vue"
              ),
  );
  app.component("u-lottie", ULottie);




  app.use(VueConfetti);

  app.use(VueTheMask);
  app.use(FlagIcon);
  app.component(UButtonCircle.name, UButtonCircle);
  app.component(UTooltipTips.name, UTooltipTips);
  app.component(SWidget.name, SWidget);
  app.component(UWidgetHeader.name, UWidgetHeader);

  //Vue.prototype.window = window;
  app.config.globalProperties.window = window; // 🌴 Global object in vue components
}
