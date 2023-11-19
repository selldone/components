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

/**
 * Vue Directive: Copy to Clipboard
 *
 * This directive enables easy copying to the clipboard. When an element with this directive
 * is clicked, its content (or the value passed to the directive) is copied.
 *
 * Usage:
 * <div v-copy>Click me to copy my text</div>
 * OR
 * <div v-copy="'Specific text to copy'">Click me</div>
 *
 * NOTE: When using v-copy with a dynamic value, note that changes to the binding value are not
 * applied after the initial bind. Use with caution.
 *
 * @file This file defines the copy to clipboard directive for Vue.
 * @author [Your Name]
 */

import type { VNode, DirectiveBinding } from "vue";

export default {
  /**
   * Called when the directive is bound to the DOM.
   */
  bind: function (
    el: HTMLElement,
    binding: DirectiveBinding<any>,
    vnode: VNode
  ) {
    // Add underline animation class
    el.classList.add("animate-underline");

    // Attach event listener
    el.addEventListener("click", function (event: Event) {
      const valueToCopy = binding.value
        ? binding.value
        : (event.target as HTMLElement).innerText;

      if (
        vnode.context &&
        typeof (vnode.context as any).copyToClipboard === "function"
      ) {
        (vnode.context as any).copyToClipboard(valueToCopy);
      }
    });
  },

  /**
   * Called when the directive's value is updated.
   * Currently, this is empty since the binding value is not dynamic.
   */
  update: function (newValue: any, oldValue: any) {},

  /**
   * Called when the directive's element is removed from the DOM.
   * This can be used to cleanup any event listeners or perform other cleanup tasks.
   */
  unbind: function (
    el: HTMLElement,
    binding: DirectiveBinding<any>,
    vnode: VNode
  ) {
    // Cleanup tasks (if needed)
  },
};
