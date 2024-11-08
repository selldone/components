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

import {delay} from "lodash-es";

/**
 * IntersectMixin provides inline editing capabilities.
 * @mixin IntersectMixin
 */
export const IntersectMixin = {
  data() {
    return {
      intersects: [] as string[],
    };
  },
  methods: {
    /**
     * Load the intersecting entry.
     *
     * @param isIntersecting
     * @param {string} key - The key identifier.
     * @param _delay
     * @returns {void}
     */
    OnIntersectLoad(
      isIntersecting: boolean,
      key: string,
      _delay: number = 0,
    ): void {
      if (!this.intersects)
        return console.error("ERROR! Register var: _intersects!");

      if (isIntersecting) {
        if (_delay) {
          delay(() => {
            this.intersects.push(key);
            this.$forceUpdate();
          }, _delay);
        } else {
          this.intersects.push(key);
          this.$forceUpdate();
        }
      }
    },

    /**
     * Check if the intersect key has been loaded.
     *
     * @param {string} key - The key identifier.
     * @returns {boolean} - Whether the key has been loaded.
     */
    IsLoaded(key: string): boolean {
      return this.intersects.includes(key);
    },
  },
};
