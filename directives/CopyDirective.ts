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

import { DirectiveBinding, ObjectDirective } from "vue";

/**
 * A Vue directive to copy text to the clipboard when an element is clicked.
 * It adds an 'animate-underline' class to the element and listens for click events.
 * On click, it either copies the directive's value or the element's innerText.
 *
 * Usage: v-copy-to-clipboard="textToCopy"
 *
 * @module CopyToClipboardDirective
 */
const CopyToClipboardDirective: ObjectDirective<
  HTMLElement & { __copy_click__?: (event: Event) => void }
> = {
  /**
   * Called when the directive is mounted to the DOM.
   * Adds an underline animation class and sets up a click event listener.
   *
   * @param {HTMLElement} el - The element the directive is bound to.
   * @param {DirectiveBinding} binding - An object containing the directive's value and arguments.
   */
  mounted(el, binding: DirectiveBinding<string>) {
    el.classList.add("animate-underline");

    el.__copy_click__ = (event: Event) => {
      const valueToCopy = binding.value
        ? binding.value
        : (event.target as HTMLElement).innerText;

      if (
        binding.instance &&
        typeof binding.instance.copyToClipboard === "function"
      ) {
        binding.instance.copyToClipboard(valueToCopy);
      }
    };

    el.addEventListener("click", el.__copy_click__);
  },

  /**
   * Optional: Called when the directive's element is updated in the DOM.
   *
   * @param {HTMLElement} el - The element the directive is bound to.
   * @param {DirectiveBinding} binding - An object containing the directive's value and arguments.
   */
  updated(el, binding: DirectiveBinding<string>) {
    // Implementation if needed for updates
  },

  /**
   * Called when the directive's element is unmounted from the DOM.
   * Cleans up by removing the click event listener.
   *
   * @param {HTMLElement} el - The element the directive is bound to.
   */
  unmounted(el) {
    if (el.__copy_click__) {
      el.removeEventListener("click", el.__copy_click__);
    }
  },
};

export default CopyToClipboardDirective;
