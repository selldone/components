import Vue, { type VueConstructor } from "vue";
import _ from "lodash-es";

/**
 * IntersectMixin provides inline editing capabilities.
 * @mixin IntersectMixin
 */
export const IntersectMixin: VueConstructor<Vue> = Vue.extend({
  data() {
    return {
      intersects: [] as string[],
    };
  },
  methods: {
    /**
     * Load the intersecting entry.
     *
     * @param {IntersectionObserverEntry[]} e - An array of intersection observer entries.
     * @param {string} key - The key identifier.
     * @param {number} [delay=0] - The delay before processing the intersection.
     * @returns {void}
     */
    OnIntersectLoad(
      e: IntersectionObserverEntry[],
      key: string,
      delay: number = 0
    ): void {
      if (!this.intersects)
        return console.error("ERROR! Register var: _intersects!");

      if (e[0].isIntersecting) {
        if (delay) {
          _.delay(() => {
            this.intersects.push(key);
            this.$forceUpdate();
          }, delay);
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
});
