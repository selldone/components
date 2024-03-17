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

import {ComponentPublicInstance, ObjectDirective} from "vue";
import {AppLevel, IAppLevel} from "@core/enums/application/AppLevel";
import {Store} from "vuex"; // Import Vuex Store type

interface HTMLElementWithCleanup extends HTMLElement {
  _cleanup?: () => void;
}

interface VueInstance extends ComponentPublicInstance {
  $store: Store<any>;
}

/**
 * Directive to conditionally hide elements based on user's app level.
 *
 * Usage:
 * v-level.min="BEGINNER" - Hides the element for levels below BEGINNER.
 * v-level.max="BEGINNER" - Hides the element for levels above BEGINNER.
 */
const levelDirective: ObjectDirective<
  HTMLElementWithCleanup,
  keyof typeof AppLevel | IAppLevel
> = {
  beforeMount(el: HTMLElementWithCleanup, binding, vnode) {
    const store = (binding.instance as VueInstance).$store as Store<any>;
    if (!store) {
      console.error("Store is not available in directive context.");
      return;
    }

    // Function to update element visibility
    const updateVisibility = () => {
      const currentLevel: number = store.getters.getAppLevel.level;
      const targetLevel: number =
        typeof binding.value === "string"
          ? AppLevel[binding.value].level
          : binding.value.level;

      let shouldRender = true;

      if (binding.modifiers.min) {
        shouldRender = currentLevel >= targetLevel;
      } else if (binding.modifiers.max) {
        shouldRender = currentLevel <= targetLevel;
      } else {
        // Default behavior (exact level match)
        shouldRender = currentLevel === targetLevel;
      }

      el.style.display = shouldRender ? "" : "none";
    };

    // Initial update
    updateVisibility();

    // Watch for changes in app level
    const unwatch = store.watch(
      () => store.getters.getAppLevel,
      () => updateVisibility(),
    );

    // Cleanup the watcher when the element is unmounted
    el._cleanup = unwatch;
  },

  unmounted(el: HTMLElementWithCleanup) {
    // Run the cleanup function to stop watching when the element is removed
    if (el._cleanup) {
      el._cleanup();
    }
  },
};

export default levelDirective;
