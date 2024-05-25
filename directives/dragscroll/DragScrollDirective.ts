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

import type {DirectiveBinding, VNode} from "vue";

const POINTER_START_EVENTS = ["mousedown", "touchstart"];
const POINTER_MOVE_EVENTS = ["mousemove", "touchmove"];
const POINTER_END_EVENTS = ["mouseup", "touchend"];

function addEventListeners(el: any, events: Array<string>, handler: Function) {
  for (let i = 0, len = events.length; i < len; i++) {
    el.addEventListener(events[i], handler, { passive: false });
  }
}

function removeEventListeners(
  el: any,
  events: Array<string>,
  handler: Function,
) {
  for (let i = 0, len = events.length; i < len; i++) {
    el.removeEventListener(events[i], handler, { passive: false });
  }
}

function emitEvent(vnode: any, eventName: string, eventDetail?: any) {
  // Vue 3
  // If vnode is a Vue component instance, use $emit. Otherwise use a native HTML event.
  if (vnode.componentInstance) {
    vnode.componentInstance.$emit(eventName, eventDetail);
  } else {
    const event = new window.CustomEvent(eventName, { detail: eventDetail });
    vnode.el.dispatchEvent(event);
  }
}

const init = function (el: Element, binding: DirectiveBinding, vnode: VNode) {
  if (binding.value === false) {
    return;
  }
  // console.log("Initialize drag scroll directive!");

  // Default parameters
  let target = el as any; // the element to apply the dragscroll on
  let active = true; // enable/disable dragscroll
  let container = window as any;

  // config type: boolean
  // Example: v-dragscroll="true" or v-dragscroll="false"
  if (typeof binding.value === "boolean") {
    active = binding.value;
  } else if (typeof binding.value === "object") {
    // config type: object
    // Example: v-dragscroll="{ active: true , target: "child" }"

    // parameter: target
    if (typeof binding.value.target === "string") {
      target = el.querySelector(binding.value.target);
      if (!target) {
        console.error("There is no element with the current target value.");
      }
    } else if (typeof binding.value.target !== "undefined") {
      console.error(
        "The parameter \"target\" should be either 'undefined' or 'string'.",
      );
    }
    // parameter: container
    if (typeof binding.value.container === "string") {
      container = document.querySelector(binding.value.container);
      if (!container) {
        console.error("There is no element with the current container value.");
      }
    } else if (typeof binding.value.container !== "undefined") {
      console.error(
        "The parameter \"container\" should be be either 'undefined' or 'string'.",
      );
    }

    // parameter: active
    if (typeof binding.value.active === "boolean") {
      active = binding.value.active;
    } else if (typeof binding.value.active !== "undefined") {
      console.error(
        "The parameter \"active\" value should be either 'undefined', 'true' or 'false'.",
      );
    }
  } else if (typeof binding.value !== "undefined") {
    // Throw an error if invalid parameters
    console.error(
      "The passed value should be either 'undefined', 'true' or 'false' or 'object'.",
    );
  }

  const scrollBy = function (x: number, y: number) {
    if (container === window) {
      window.scrollBy(x, y);
    } else {
      container.scrollLeft += x;
      container.scrollTop += y;
    }
  };

  const reset = function () {
    let lastClientX: number, lastClientY: number, pushed: number;
    let isDragging = false;
    let isClick = false; // workaround to handle click event from touch
    let startTime: number;
    let startX: number, startY: number;

    // Add 'cursor-pan-all' class on init
    target.classList.add("cursor-grab");

    target.onPointerStart = function (e: MouseEvent | TouchEvent) {
      e.preventDefault();
      const isMouseEvent = e instanceof window.MouseEvent;
      // The coordinates of the mouse pointer compared to the page when the mouse button is clicked on an element
      const pageX = isMouseEvent ? e.pageX : e.touches[0].pageX;
      const pageY = isMouseEvent ? e.pageY : e.touches[0].pageY;
      const clickedElement = document.elementFromPoint(
        pageX - window.pageXOffset,
        pageY - window.pageYOffset,
      ) as HTMLElement | null;

      const hasNoChildDrag = binding.arg === "nochilddrag";
      const ignoreLeft = binding.modifiers.noleft;
      const ignoreRight = binding.modifiers.noright;
      const ignoreMiddle = binding.modifiers.nomiddle;
      const ignoreBack = binding.modifiers.noback;
      const ignoreForward = binding.modifiers.noforward;
      const hasFirstChildDrag = binding.arg === "firstchilddrag";
      const isEl = clickedElement === target;
      const isFirstChild = clickedElement === target.firstChild;
      const isDataDraggable = hasNoChildDrag
        ? typeof clickedElement?.dataset.dragscroll !== "undefined"
        : typeof clickedElement?.dataset.noDragscroll === "undefined";

      if (!isEl && (!isDataDraggable || (hasFirstChildDrag && !isFirstChild))) {
        return;
      }

      if ((e as MouseEvent).button === 0 && ignoreLeft) {
        return;
      } else if ((e as MouseEvent).button === 1 && ignoreMiddle) {
        return;
      } else if ((e as MouseEvent).button === 2 && ignoreRight) {
        return;
      } else if ((e as MouseEvent).button === 3 && ignoreBack) {
        return;
      } else if ((e as MouseEvent).button === 4 && ignoreForward) {
        return;
      }

      pushed = 1;
      // The coordinates of the mouse pointer compared to the viewport when the mouse button is clicked on an element
      lastClientX = isMouseEvent ? e.clientX : e.touches[0].clientX;
      lastClientY = isMouseEvent ? e.clientY : e.touches[0].clientY;
      startX = lastClientX;
      startY = lastClientY;
      startTime = Date.now();
      if (e.type === "touchstart") {
        isClick = true;
      }
    };

    target.onPointerEnd = function (e: MouseEvent | TouchEvent) {
      pushed = 0;

      if (isDragging) {
        emitEvent(vnode, "dragscrollend");
      }

      isDragging = false;
      if (e.type === "touchend" && isClick === true) {
        const duration = Date.now() - startTime;
        const distance = Math.sqrt(
          Math.pow(startX - lastClientX, 2) + Math.pow(startY - lastClientY, 2),
        );
        //console.log("-->", duration, distance);
        if (duration < 1000 && distance < 32) {
          // this workaround enable click while using touch
          (e.target as HTMLElement).click();
          isClick = false;
        }
      } else {
        (e.target as HTMLElement).focus();
      }
    };

    target.onPointerMove = function (e: MouseEvent | TouchEvent) {
      const isMouseEvent = e instanceof window.MouseEvent;
      let newScrollX, newScrollY;
      if (pushed) {
        e.preventDefault();
        // pushed
        // Emit start event
        if (!isDragging) {
          emitEvent(vnode, "dragscrollstart");
        }
        isDragging = true;

        // when we reach the end or the beginning of X or Y
        const isEndX =
          target.scrollLeft + target.clientWidth >= target.scrollWidth ||
          target.scrollLeft === 0;
        const isEndY =
          target.scrollTop + target.clientHeight >= target.scrollHeight ||
          target.scrollTop === 0;

        // get new scroll dimensions
        newScrollX =
          -lastClientX +
          (lastClientX = isMouseEvent ? e.clientX : e.touches[0].clientX);
        newScrollY =
          -lastClientY +
          (lastClientY = isMouseEvent ? e.clientY : e.touches[0].clientY);

        if (binding.modifiers.pass) {
          // compute and scroll
          target.scrollLeft -= binding.modifiers.y ? -0 : newScrollX;
          target.scrollTop -= binding.modifiers.x ? -0 : newScrollY;
          if (target === document.body) {
            target.scrollLeft -= binding.modifiers.y ? -0 : newScrollX;
            target.scrollTop -= binding.modifiers.x ? -0 : newScrollY;
          }

          // if one side reaches the end scroll container
          if (isEndX || binding.modifiers.y) {
            scrollBy(-newScrollX, 0);
          }
          if (isEndY || binding.modifiers.x) {
            scrollBy(0, -newScrollY);
          }
        } else {
          // disable one scroll direction in case x or y is specified
          if (binding.modifiers.x) newScrollY = -0;
          if (binding.modifiers.y) newScrollX = -0;

          // compute and scroll
          target.scrollLeft -= newScrollX;
          target.scrollTop -= newScrollY;
          if (target === document.body) {
            target.scrollLeft -= newScrollX;
            target.scrollTop -= newScrollY;
          }
        }

        // Emit events
        emitEvent(vnode, "dragscrollmove", {
          // eventDetail
          deltaX: -newScrollX,
          deltaY: -newScrollY,
        });
      }
    };

    addEventListeners(target, POINTER_START_EVENTS, target.onPointerStart);

    addEventListeners(window, POINTER_END_EVENTS, target.onPointerEnd);

    addEventListeners(window, POINTER_MOVE_EVENTS, target.onPointerMove);
  };
  // if value is undefined or true we will init
  if (active) {
    if (document.readyState === "complete") {
      reset();
    } else {
      window.addEventListener("load", reset);
    }
  } else {
    // if value is false means we disable
    // window.removeEventListener('load', reset)
    removeEventListeners(target, POINTER_START_EVENTS, target.onPointerStart);
    removeEventListeners(window, POINTER_END_EVENTS, target.onPointerEnd);
    removeEventListeners(window, POINTER_MOVE_EVENTS, target.onPointerMove);
  }
};

const destroy = (el: any) => {
  const target = el;
  target.classList.remove("cursor-grab");
  removeEventListeners(target, POINTER_START_EVENTS, target.onPointerStart);
  removeEventListeners(window, POINTER_END_EVENTS, target.onPointerEnd);
  removeEventListeners(window, POINTER_MOVE_EVENTS, target.onPointerMove);
};

export default {
  mounted: (el: Element, binding: DirectiveBinding, vnode: VNode) =>
    init(el, binding, vnode),
  updated: (el: Element, binding: DirectiveBinding, vnode: VNode) => {
    // update the component only if the parameters change
    if (JSON.stringify(binding.value) !== JSON.stringify(binding.oldValue)) {
      init(el, binding, vnode);
    }
  },
  unmounted: (el: Element) => destroy(el),
};
