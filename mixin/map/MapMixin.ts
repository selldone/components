/*
 * Copyright (c) 2023-2024. Selldone® Business OS™
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

//―――――――――――――――――――――― Event Bus ――――――――――――――――――――
import {EventBus, EventName} from "@selldone/components-vue/utils/events/EventBus.ts";
import {Map, Order} from "@selldone/core-js/models";

const MapMixin = {
  methods: {
    //―――――――――――――――――――――― Map ――――――――――――――――――――

    /**
     * Map: Only in Samin!
     */
    showMap(
      center: Map.ILocation,
      mode: string,
      location: Order.IReceiverInfo,
      selectCallback: () => void,
      viewOnly: boolean = false,
    ) {
      EventBus.$emit(EventName.SHOW_MAP, {
        center,
        mode,
        location,
        selectCallback,
        viewOnly,
      });
    },

    closeMap() {
      EventBus.$emit(EventName.HIDE_MAP);
    },
  },
};

export default MapMixin;
