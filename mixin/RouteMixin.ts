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

import type {IReturn} from "@core/types/route/return.type";
import {defineComponent} from "vue";
import _ from "lodash-es";

declare global {
  interface Window {
    __STATE: IReturn | null;
    __RETURN: IReturn | null;
  }
}

export const RouteMixin = defineComponent({
  props: {},
  data() {
    return {
      RETURN: {} as IReturn | null | undefined,
      HIGHLIGHT_ID: null as number | null,
    };
  },

  created() {
    // ............ Handle returned state ............
    if (window.__STATE) {
      // Iterate over the component's data properties
      Object.keys(this.$data).forEach((key) => {
        // Check if there's a matching key in window.__STATE
        if (window.__STATE!.hasOwnProperty(key)) {
          // Assign the value from window.__STATE to the component's data
          this[key] = window.__STATE![key];
        }
      });
    }
    window.__STATE = null;
    //..............................................

    // ............ Save passed previous state ............

    this.RETURN = window.__RETURN as IReturn | null | undefined;
    window.__RETURN = null;

    //..............................................
  },

  mounted() {
    // Clear highlight ID:
    if (this.HIGHLIGHT_ID)
      _.delay(() => {
        this.HIGHLIGHT_ID = null;
      }, 3000);
  },
  methods: {
    //―――――――――――――――――――――― Route ――――――――――――――――――――

    /**
     * Build return route to highlight last selected item on return to orders list , etc.
     *
     * @param default_route_name
     * @returns {{name: *, params: any}}
     */
    buildReturnRoute(default_route_name: string) {
      const RETURN = this.RETURN ? Object.assign({}, this.RETURN) : null; // Make a clone!
      // Important: STATE on params may exist! So override it after get RETURN.params!
      const params =
        RETURN && RETURN.ROUTE_PARAMS
          ? Object.assign({}, RETURN.ROUTE_PARAMS)
          : {};
      if (RETURN) {
        RETURN.ROUTE_PARAMS = undefined; // Prevent cyclic object value!
        //  params.STATE = RETURN;
      }
      window.__STATE = RETURN;
      //  console.log('buildReturnRoute',params,RETURN)
      return {
        name:
          RETURN && RETURN.ROUTE_NAME ? RETURN.ROUTE_NAME : default_route_name,
        params: params,
      };
    },

    /**
     * Cache route state.
     * Call this before $router.push(...)
     * @param item_id
     */
    cacheRouteState(item_id?: number) {
      window.__RETURN = Object.assign({}, this.$data);

      window.__RETURN!.HIGHLIGHT_ID = item_id;
      window.__RETURN!.ROUTE_NAME = this.$route.name;
      window.__RETURN!.ROUTE_PARAMS = this.$route.params;
    },
  },
});
