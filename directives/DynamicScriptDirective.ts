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
 * Vue Directive: Dynamic Script Loader
 *
 * This directive dynamically loads scripts inside elements into the head of the document.
 * Useful for asynchronously loading third-party libraries or executing embedded scripts.
 *
 * Usage:
 * <div v-dynamic="true">
 *   <script src="https://somecdn.com/somescript.js"></script>
 * </div>
 *
 * NOTE: Make sure you trust the content you're loading, as this directive will execute the scripts.
 *
 * @file This file defines the dynamic script loader directive for Vue.
 * @author [Your Name]
 */

import { ObjectDirective } from 'vue';

const LoadScriptsDirective: ObjectDirective<HTMLElement & { loadedScripts?: string[] }> = {
  /**
   * Called when the directive is mounted to the DOM.
   */
  mounted(el, binding) {
    // Function to load scripts
    const loadScripts = () => {
      if (!binding.value) {
        return;
      }

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = el.innerHTML;
      const scripts = tempDiv.getElementsByTagName('script');

      el.loadedScripts = el.loadedScripts || [];

      for (const script of scripts) {
        const scriptSrc = script.getAttribute('src');
        if (scriptSrc && !el.loadedScripts.includes(scriptSrc)) {
          const newScript = document.createElement('script');
          Array.from(script.attributes).forEach(attr =>
              newScript.setAttribute(attr.name, attr.value)
          );
          newScript.onload = () => {
            el.loadedScripts?.push(scriptSrc);
          };
          document.head.appendChild(newScript);
        }
      }
    };

    loadScripts();
  },

  /**
   * Called when the directive's element is updated in the DOM.
   */
  updated(el, binding) {
    if (binding.value !== binding.oldValue) {
      // Repeat the same steps as in mounted if necessary
    }
  },

  /**
   * Called when the directive's element is removed from the DOM.
   */
  unmounted(el) {
    if (el.loadedScripts) {
      for (const script of el.loadedScripts) {
        const scriptElement = document.head.querySelector(`script[src="${script}"]`);
        if (scriptElement) {
          document.head.removeChild(scriptElement);
        }
      }
      el.loadedScripts = [];
    }
  }
};

export default LoadScriptsDirective;