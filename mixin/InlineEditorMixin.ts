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

/**
 * Mixin to provide inline editing capabilities.
 * @mixin InlineEditorMixin
 */
export const InlineEditorMixin = Vue.extend({
  props: {},
  data() {
    return {};
  },
  methods: {
    /**
     * Handle inline updates for editable elements.
     *
     * @param {FocusEvent} e - The focus event.
     * @param {string} property - The property path (e.g., "a.b.c").
     * @param {Record<string, any>} variable - The target object to update.
     * @param {boolean} [force_text=false] - If true, uses innerText. Otherwise, uses innerHTML.
     */
    innerUpdate(
      e: FocusEvent,
      property: string,
      variable: Record<string, any>,
      force_text: boolean = false
    ) {
      const target = e.target as HTMLInputElement;

      let value = force_text ? target.innerText : target.innerHTML;
      if (value === "<br>") value = "";

      const props = property.split(".");
      if (props.length === 1) variable[props[0]] = value;
      else if (props.length === 2) variable[props[0]][props[1]] = value;
      else if (props.length === 3)
        variable[props[0]][props[1]][props[2]] = value;
    },
  },
});
