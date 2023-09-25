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

import { VueRouter } from "vue-router/types/router";
import {Store} from "vuex";

declare global {
  interface Window {
    $global_router: VueRouter;
    $global_store:Store<any>;
    $global_vuetify: any; // Important! used by page build dynamic component generator!  USE THIS NOW: vuetify=Vue.prototype.$vuetify
    $i18n_global: any; // Important! used by styler!


  }
}
