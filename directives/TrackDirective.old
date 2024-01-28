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

import type { VNode, DirectiveBinding } from "vue";
import { TrackUser } from "@core/enums/gtag/TrackUser";

/**
 * This directive allows for tracking user clicks on elements.
 * Use case example in Vue template: v-track:click="Home Storefront Preview ● Open Live Product"
 *
 * @module TrackClickDirective
 */

// Define accepted arguments for the directive
interface TrackClickDirectiveArgs {
  click: string; // Argument for click event tracking
  // Add other arguments as needed
}

export default {
  /**
   * Called when the directive is bound to the element in the DOM.
   * Attaches a click event listener to the element, triggering TrackUser.onClick with the provided label.
   *
   * @param {HTMLElement} el - The DOM element the directive is bound to.
   * @param {DirectiveBinding<TrackClickDirectiveArgs>} binding - An object containing the directive's value and arguments.
   * @param {VNode} vnode - The virtual node produced by Vue.
   */
  bind: function (
    el: HTMLElement,
    binding: DirectiveBinding<TrackClickDirectiveArgs>,
    vnode: VNode
  ) {
    if (binding.arg === "click" && binding.value) {
      el.addEventListener("click", () => {
        TrackUser.onClick("" + binding.value);
      });
    }
  },
};
