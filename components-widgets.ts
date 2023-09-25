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

//---------------- Vue FilePond --------------

// Import Vue FilePond
import vueFilePond from "vue-filepond";

// Import FilePond styles
import "filepond/dist/filepond.min.css";

// Import FilePond plugins
// Please note that you need to install these plugins separately

// Import image preview plugin styles
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css";

// Import image preview and file type validation plugins
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginImageTransform from "filepond-plugin-image-transform";
import FilePondPluginImageResize from "filepond-plugin-image-resize";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";
// Create component
const FilePond = vueFilePond(
  FilePondPluginFileValidateType,
  FilePondPluginImagePreview,
  FilePondPluginImageTransform,
  FilePondPluginImageResize,
  FilePondPluginFileValidateSize
);

Vue.component("file-pond", FilePond);

//---------------- TIME --------------
// @ts-ignore
import VueTimeago from "vue-timeago";

Vue.use(VueTimeago, {
  name: "Timeago", // Component name, `Timeago` by default
  locale: "en", // Default locale
});

//―――――――――――――――――――――― Vue Notification ――――――――――――――――――――

import VueNotifications from "vue-notification";
Vue.use(VueNotifications);

require("@/Components/style/animation/vue2-animate.scss");
require("@/Components/style/selldone/general_animates.scss");

//---------------- Number format --------------
// @ts-ignore
import VueNumerals from "vue-numerals";
Vue.use(VueNumerals);



//---------------- Check --------------
import Check from "@/Components/ui/icon/Check.vue";
Vue.component("Check", Check);

//---------------- Price view --------------

import PriceView from "@/Components/ui/price/PriceView.vue";
Vue.component("price-view", PriceView);

//---------------- Loading --------------

import Loading from "@/Components/ui/loading/loading.vue";
Vue.component("loading", Loading);

import ProgressLoading from "@/Components/ui/loading/ProgressLoading.vue";
Vue.component(ProgressLoading.name, ProgressLoading);

//---------------- Map --------------
Vue.component(
  "map-view",
  // A dynamic import returns a Promise.
  () => import(/* webpackChunkName: "plug-map" */ "./map/MapView.vue")
);

//---------------- Lottie Animation View for Vue --------------

Vue.component(
  "lottie",
  // A dynamic import returns a Promise.
  () => import(/* webpackChunkName: "plug-lottie" */ "./ui/animation/lottie.vue")
);
//---------------- Miscellaneous --------------

// + Chart:
Vue.component(
  "apexchart",
  // A dynamic import returns a Promise.
  () => import(/* webpackChunkName: "plug-miscellaneous" */ "vue-apexcharts")
);

// + QR Code:

Vue.component(
  "qrcode",

  // A dynamic import returns a Promise.
  () =>
    import(
      // @ts-ignore
      /* webpackChunkName: "plug-miscellaneous" */ "@chenfengyuan/vue-qrcode"
    )
);

// + Bar Code:

Vue.component(
  "barcode",

  // A dynamic import returns a Promise.
  () =>
    import(
      // @ts-ignore
      /* webpackChunkName: "plug-miscellaneous" */ "vue-barcode"
    )
);

// + Youtube Player:
// @ts-ignore
import VueYoutube from "vue-youtube";
Vue.use(VueYoutube);

//---------------- Barcode Scanner --------------
Vue.component(
  "barcode-scanner",
  // A dynamic import returns a Promise.
  () =>
    import(
      /* webpackChunkName: "plug-scanner" */ "./ui/scanner/BarcodeScanner.vue"
    )
);

// + Tel input:
import "vue-tel-input/dist/vue-tel-input.css";
// @ts-ignore
import VueTelInput from "vue-tel-input";
Vue.use(VueTelInput);
// @ts-ignore
import VueTheMask from "vue-the-mask";
Vue.use(VueTheMask);

//---------------- SVG Flags --------------
// @ts-ignore
import FlagIcon from "vue-flag-icon";
Vue.use(FlagIcon);

// ------------- vue-clipboard2 -------------
import VueClipboard from "vue-clipboard2";
Vue.use(VueClipboard);

//---------------- Social Share --------------
const SocialSharing = require("vue-social-sharing");
Vue.use(SocialSharing);

//---------------- Copy - Clipboard --------------
import Clipboard from "v-clipboard";
Vue.use(Clipboard);



//---------------- prototypes --------------

//Vue.prototype.window_portal = window;
Vue.prototype.window = window;
require("../../core/prototypes/Prototypes");

//---------------- Vue-Awesome-Swiper --------------

import VueAwesomeSwiper from "vue-awesome-swiper";
import "swiper/css/swiper.css"; // require styles

Vue.use(VueAwesomeSwiper /* { default global options } */);

import CircleButton from "./ui/button/CircleButton.vue";
Vue.component(CircleButton.name, CircleButton);

import SimpleInnerTitle from "./depricated/SimpleInnerTitle.vue";
Vue.component(SimpleInnerTitle.name, SimpleInnerTitle);

import TipsButton from "./ui/tips/TipsButton.vue";
Vue.component(TipsButton.name, TipsButton);

//---------------- Medium Editor --------------
import "medium-editor";


import "@/Components/article/add-on/code-editor/CodeEditorMediumPlugin";
import "@/Components/article/add-on/compare/ImagesCompareMediumPlugin";
import "@/Components/article/add-on/flip-book/FlipBookMediumPlugin";
import "@/Components/article/add-on/canvas/ImageOverlayCanvasMediumPlugin";

// @ts-ignore
import { MediumInsert } from "@/Components/article/insert/SelldoneEditorInsert";
window.MediumInsert = MediumInsert;

//―――――――――――――――――――――― vue-prism-editor ――――――――――――――――――――
import "prismjs";
import "prismjs/themes/prism.css";

import { PrismEditor } from "vue-prism-editor";
import "vue-prism-editor/dist/prismeditor.min.css";
Vue.component("prism-editor", PrismEditor);



//---------------- Widget --------------

import Widget from "@/Components/widget/Widget.vue";
Vue.component(Widget.name, Widget);

import WidgetHeader from "@/Components/widget/WidgetHeader.vue";
Vue.component(WidgetHeader.name, WidgetHeader);

