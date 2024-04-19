import { DirectiveBinding } from "vue";

interface Dimension {
  width: number;
  height: number;
}

export default {
  /**
   * Mounted lifecycle hook of the Vue directive.
   * Sets up a ResizeObserver on the bound element to observe changes in its dimensions.
   * This version adds debouncing to the dimension updates to reduce the frequency of updates.
   * @param el - The HTML element to which the directive is bound.
   * @param binding - An object containing details about the binding.
   *
   * example: v-size="({width, height})=>{}"
   */
  mounted(
    el: HTMLElement,
    binding: DirectiveBinding<(dimension: Dimension) => void>,
  ): void {
    const callback = binding.value;
    let timeoutId: number | null = null; // Define timeoutId within the mounted function scope

    const debounce = (func: () => void, delay: number = 500) => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
      timeoutId = window.setTimeout(func, delay);
    };

    // ResizeObserver to observe changes in the dimensions of the element
    const resizeObserver = new ResizeObserver(
      (entries: ResizeObserverEntry[]) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          // Debounce the callback invocation
          debounce(() => callback({ width, height }));
        }
      },
    );

    // Start observing the element
    resizeObserver.observe(el);

    // Store the observer in the element's dataset for cleanup on unmount
    (el as any).__resizeObserver__ = resizeObserver;

    // Store cleanup function on the element to ensure it can be called in unmounted
    (el as any).__cleanup__ = () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
      if ((el as any).__resizeObserver__) {
        (el as any).__resizeObserver__.unobserve(el);
        delete (el as any).__resizeObserver__;
      }
    };
  },

  /**
   * Unmounted lifecycle hook of the Vue directive.
   * Cleans up the ResizeObserver and any pending timeouts when the directive is unbound from the element.
   * @param el - The HTML element from which the directive is unbinding.
   */
  unmounted(el: HTMLElement): void {
    // Invoke the cleanup function if available
    if ((el as any).__cleanup__) {
      (el as any).__cleanup__();
      delete (el as any).__cleanup__;
    }
  },
};
